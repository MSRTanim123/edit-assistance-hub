import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { performDiagnosis, DiagnosisResult, RedFlagAlert } from '@/lib/aiDiagnosis';

interface DiagnosisFormProps {
  onDiagnosisComplete: (results: {
    diagnoses: DiagnosisResult[];
    redFlags: RedFlagAlert[];
    patientId: string;
    vitals: any;
    encounterId?: string;
  }) => void;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
}

export function DiagnosisForm({ onDiagnosisComplete }: DiagnosisFormProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState({
    symptoms: '',
    temperature: '',
    bpSystolic: '',
    bpDiastolic: '',
    spo2: '',
    pulse: '',
  });
  
  useEffect(() => {
    loadPatients();
  }, []);
  
  const loadPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, name, age, sex')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading patients:', error);
      return;
    }
    
    setPatients(data || []);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    
    setLoading(true);
    
    try {
      // Perform AI diagnosis
      const vitals = {
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        bpSystolic: formData.bpSystolic ? parseInt(formData.bpSystolic) : undefined,
        bpDiastolic: formData.bpDiastolic ? parseInt(formData.bpDiastolic) : undefined,
        spo2: formData.spo2 ? parseInt(formData.spo2) : undefined,
        pulse: formData.pulse ? parseInt(formData.pulse) : undefined,
      };
      
      const results = await performDiagnosis(formData.symptoms, vitals);
      
      // Save encounter to database
      const { data: encounterData, error: encounterError } = await supabase
        .from('encounters')
        .insert({
          patient_id: selectedPatient,
          symptoms: formData.symptoms,
          temperature: vitals.temperature || null,
          blood_pressure_systolic: vitals.bpSystolic || null,
          blood_pressure_diastolic: vitals.bpDiastolic || null,
          spo2: vitals.spo2 || null,
          pulse: vitals.pulse || null,
          diagnosis_result: results.diagnoses as any,
          red_flags: results.redFlags as any,
          triage_instructions: results.diagnoses[0]?.triage || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      
      if (encounterError) throw encounterError;
      
      toast.success(t('diagnosisSaved'));
      
      onDiagnosisComplete({
        ...results,
        patientId: selectedPatient,
        encounterId: encounterData?.id,
        vitals,
      });
      
      // Reset form
      setFormData({
        symptoms: '',
        temperature: '',
        bpSystolic: '',
        bpDiastolic: '',
        spo2: '',
        pulse: '',
      });
    } catch (error) {
      console.error('Error performing diagnosis:', error);
      toast.error(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-2xl">{t('diagnose')}</CardTitle>
        <CardDescription>
          Enter patient symptoms and vital signs for AI-assisted diagnosis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="patient">{t('selectPatient')} *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder={t('searchPatient')} />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.age}{t('age')}, {patient.sex})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symptoms">{t('symptoms')} *</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder={t('symptomsPlaceholder')}
              required
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('vitals')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">{t('temperature')}</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="98.6"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('bloodPressure')}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.bpSystolic}
                    onChange={(e) => setFormData({ ...formData, bpSystolic: e.target.value })}
                    placeholder={t('systolic')}
                  />
                  <span className="self-center">/</span>
                  <Input
                    type="number"
                    value={formData.bpDiastolic}
                    onChange={(e) => setFormData({ ...formData, bpDiastolic: e.target.value })}
                    placeholder={t('diastolic')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="spo2">{t('spo2')}</Label>
                <Input
                  id="spo2"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.spo2}
                  onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                  placeholder="95-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pulse">{t('pulse')}</Label>
                <Input
                  id="pulse"
                  type="number"
                  value={formData.pulse}
                  onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                  placeholder="60-100"
                />
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t('analyzing') : t('diagnoseNow')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}