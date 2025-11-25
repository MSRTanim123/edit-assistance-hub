import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Calendar, User, Stethoscope, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Encounter {
  id: string;
  created_at: string;
  patient_id: string;
  temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse: number | null;
  spo2: number | null;
  symptoms: string;
  diagnosis_result: any;
  red_flags: any;
  patients: {
    id: string;
    name: string;
    age: number;
    sex: string;
    village: string | null;
  };
}

interface EncounterHistoryProps {
  onViewPatient?: (patientId: string) => void;
}

export const EncounterHistory = ({ onViewPatient }: EncounterHistoryProps) => {
  const { t } = useLanguage();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEncounters();
  }, []);

  const fetchEncounters = async () => {
    try {
      const { data, error } = await supabase
        .from('encounters')
        .select(`
          *,
          patients (
            id,
            name,
            age,
            sex,
            village
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEncounters(data || []);
    } catch (error) {
      console.error('Error fetching encounters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEncounters = encounters.filter(encounter => {
    const searchLower = searchTerm.toLowerCase();
    return (
      encounter.patients.name.toLowerCase().includes(searchLower) ||
      encounter.symptoms.toLowerCase().includes(searchLower) ||
      (encounter.patients.village?.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-foreground">
          {t('encounterHistory')}
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPatients')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredEncounters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchTerm ? t('noResultsFound') : t('noEncountersYet')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEncounters.map((encounter) => (
            <Card key={encounter.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      {encounter.patients.name}
                    </CardTitle>
                    {onViewPatient && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewPatient(encounter.patient_id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('viewProfile')}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(encounter.created_at), 'PPp')}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('age')}:</span>
                    <span className="ml-2 font-medium">{encounter.patients.age}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('sex')}:</span>
                    <span className="ml-2 font-medium">{encounter.patients.sex}</span>
                  </div>
                  {encounter.patients.village && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">{t('village')}:</span>
                      <span className="ml-2 font-medium">{encounter.patients.village}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
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
                    {encounter.red_flags.map((flag: any, idx: number) => (
                      <Badge key={idx} variant="destructive" className="mr-2">
                        {flag.message}
                      </Badge>
                    ))}
                  </div>
                )}

                {encounter.diagnosis_result && Array.isArray(encounter.diagnosis_result) && encounter.diagnosis_result.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{t('diagnoses')}:</span>
                    </div>
                    <div className="space-y-2">
                      {encounter.diagnosis_result.slice(0, 3).map((diagnosis: any, idx: number) => (
                        <div key={idx} className="bg-accent/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{diagnosis.name}</span>
                            <Badge variant="secondary">
                              {diagnosis.confidence.toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{diagnosis.triage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
