import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, User, Calendar, Phone, MapPin, Stethoscope, Printer, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { PrintableReport } from './PrintableReport';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentsList } from './AppointmentsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  village: string | null;
  phone: string | null;
  weight: number | null;
  created_at: string;
}

interface Encounter {
  id: string;
  created_at: string;
  temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse: number | null;
  spo2: number | null;
  symptoms: string;
  diagnosis_result: any;
  red_flags: any;
}

interface PatientProfileProps {
  patientId: string;
}

export const PatientProfile = ({ patientId }: PatientProfileProps) => {
  const { t } = useLanguage();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEncounter, setSelectedEncounter] = useState<string | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [refreshAppointments, setRefreshAppointments] = useState(0);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const [patientResult, encountersResult] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase
          .from('encounters')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
      ]);

      if (patientResult.error) throw patientResult.error;
      if (encountersResult.error) throw encountersResult.error;

      setPatient(patientResult.data);
      setEncounters(encountersResult.data || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (encounterId: string) => {
    setSelectedEncounter(encounterId);
    setTimeout(() => window.print(), 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {t('noResultsFound')}
        </CardContent>
      </Card>
    );
  }

  const selectedEncounterData = encounters.find(e => e.id === selectedEncounter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Print Report */}
      {selectedEncounterData && (
        <PrintableReport
          diagnoses={selectedEncounterData.diagnosis_result || []}
          redFlags={selectedEncounterData.red_flags || []}
          patientData={{
            name: patient.name,
            age: patient.age,
            sex: patient.sex,
            village: patient.village || undefined,
          }}
          vitals={{
            temperature: selectedEncounterData.temperature || undefined,
            bloodPressureSystolic: selectedEncounterData.blood_pressure_systolic || undefined,
            bloodPressureDiastolic: selectedEncounterData.blood_pressure_diastolic || undefined,
            pulse: selectedEncounterData.pulse || undefined,
            spo2: selectedEncounterData.spo2 || undefined,
          }}
          symptoms={selectedEncounterData.symptoms}
        />
      )}

      {/* Patient Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-primary" />
            {t('patientProfile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">{t('patientName')}:</span>
              <p className="font-semibold text-lg">{patient.name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">{t('age')}:</span>
              <p className="font-semibold">{patient.age} years</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">{t('sex')}:</span>
              <p className="font-semibold">{patient.sex}</p>
            </div>
            {patient.village && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">{t('village')}:</span>
                  <p className="font-semibold">{patient.village}</p>
                </div>
              </div>
            )}
            {patient.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">{t('phone')}:</span>
                  <p className="font-semibold">{patient.phone}</p>
                </div>
              </div>
            )}
            {patient.weight && (
              <div>
                <span className="text-sm text-muted-foreground">{t('weight')}:</span>
                <p className="font-semibold">{patient.weight} kg</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 pt-4 border-t">
            <Badge variant="secondary" className="text-base">
              {t('totalEncounters')}: {encounters.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appointments
            </CardTitle>
            <Button onClick={() => setShowAppointmentForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentsList 
            key={refreshAppointments}
            patientId={patientId} 
            limit={5}
            showUpcomingOnly={true}
          />
        </CardContent>
      </Card>

      {/* Encounters History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            {t('allEncounters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {encounters.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('noEncountersYet')}</p>
          ) : (
            <div className="space-y-4">
              {encounters.map((encounter) => (
                <div
                  key={encounter.id}
                  className="border border-border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(encounter.created_at), 'PPp')}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(encounter.id)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      {t('printReport')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {encounter.temperature && (
                      <Badge variant="outline" className="justify-center">
                        Temp: {encounter.temperature}°F
                      </Badge>
                    )}
                    {encounter.blood_pressure_systolic && encounter.blood_pressure_diastolic && (
                      <Badge variant="outline" className="justify-center">
                        BP: {encounter.blood_pressure_systolic}/{encounter.blood_pressure_diastolic}
                      </Badge>
                    )}
                    {encounter.pulse && (
                      <Badge variant="outline" className="justify-center">
                        Pulse: {encounter.pulse}
                      </Badge>
                    )}
                    {encounter.spo2 && (
                      <Badge variant="outline" className="justify-center">
                        SpO2: {encounter.spo2}%
                      </Badge>
                    )}
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-muted-foreground">{t('symptoms')}:</span>
                    <p className="text-sm mt-1">{encounter.symptoms}</p>
                  </div>

                  {encounter.red_flags && Array.isArray(encounter.red_flags) && encounter.red_flags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-destructive">{t('redFlags')}:</span>
                      <div className="flex flex-wrap gap-2">
                        {encounter.red_flags.map((flag: any, idx: number) => (
                          <Badge key={idx} variant="destructive">
                            {flag.message}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {encounter.diagnosis_result && Array.isArray(encounter.diagnosis_result) && encounter.diagnosis_result.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-semibold">{t('diagnoses')}:</span>
                      <div className="space-y-2">
                        {encounter.diagnosis_result.slice(0, 3).map((diagnosis: any, idx: number) => (
                          <div key={idx} className="bg-accent/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{diagnosis.name}</span>
                              <Badge variant="secondary">
                                {(diagnosis.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{diagnosis.triage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Form Dialog */}
      <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            patientId={patientId}
            patientName={patient.name}
            onSuccess={() => {
              setShowAppointmentForm(false);
              setRefreshAppointments(prev => prev + 1);
            }}
            onCancel={() => setShowAppointmentForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
