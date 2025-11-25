import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { DiagnosisResult, RedFlagAlert } from '@/lib/aiDiagnosis';
import { PrintableReport } from '@/components/PrintableReport';
import { AlertTriangle, Printer, AlertCircle, Activity, Pill, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosisResultsProps {
  diagnoses: DiagnosisResult[];
  redFlags: RedFlagAlert[];
  encounterId?: string;
}

export function DiagnosisResults({ diagnoses, redFlags, encounterId }: DiagnosisResultsProps) {
  const { t } = useLanguage();
  const [encounterDetails, setEncounterDetails] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    if (encounterId) {
      fetchEncounterDetails();
    }
  }, [encounterId]);

  const fetchEncounterDetails = async () => {
    if (!encounterId) return;
    
    try {
      const { data, error } = await supabase
        .from('encounters')
        .select(`
          *,
          patients (
            name,
            age,
            sex,
            village
          )
        `)
        .eq('id', encounterId)
        .single();

      if (error) throw error;
      setEncounterDetails(data);
    } catch (error) {
      console.error('Error fetching encounter details:', error);
    }
  };

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setShowPrint(false);
    }, 100);
  };
  
  const getSeverityColor = (severity: 'critical' | 'high' | 'moderate'): "default" | "destructive" | "outline" | "secondary" => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'moderate':
        return 'default';
    }
  };
  
  return (
    <>
      {showPrint && encounterDetails && (
        <PrintableReport
          diagnoses={diagnoses}
          redFlags={redFlags}
          patientData={encounterDetails.patients}
          vitals={{
            temperature: encounterDetails.temperature,
            bloodPressureSystolic: encounterDetails.blood_pressure_systolic,
            bloodPressureDiastolic: encounterDetails.blood_pressure_diastolic,
            pulse: encounterDetails.pulse,
            spo2: encounterDetails.spo2,
          }}
          symptoms={encounterDetails.symptoms}
        />
      )}
      
      <div className="space-y-6 print:hidden">
      <div className="flex justify-between items-start">
        <h2 className="text-3xl font-bold text-foreground">{t('diagnosisResults')}</h2>
        {encounterDetails && (
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            {t('printReport')}
          </Button>
        )}
      </div>
      
      {/* Red Flags */}
      {redFlags.length > 0 && (
        <Alert variant="destructive" className="shadow-alert">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">{t('redFlags')}</AlertTitle>
          <AlertDescription>
            <div className="mt-3 space-y-3">
              {redFlags.map((flag, index) => (
                <div key={index} className="bg-destructive-foreground/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(flag.severity)}>
                      {flag.severity.toUpperCase()}
                    </Badge>
                    <span className="font-semibold">{flag.condition}</span>
                  </div>
                  <p className="text-sm">{flag.action}</p>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Top Diagnoses */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('topDiagnoses')}
          </CardTitle>
          <CardDescription>
            AI-powered differential diagnosis based on symptom analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnoses.map((diagnosis, index) => (
              <Card key={diagnosis.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Badge variant="outline" className="text-lg">
                        #{index + 1}
                      </Badge>
                      {diagnosis.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      {diagnosis.confidence}% {t('confidence')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Triage */}
                  <div className="bg-accent/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      {t('triageInstructions')}
                    </h4>
                    <p className="text-sm">{diagnosis.triage}</p>
                  </div>
                  
                  {/* Red Flags */}
                  {diagnosis.redFlags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-warning" />
                        {t('redFlags')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {diagnosis.redFlags.map((flag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-warning/10">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Medications */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4 text-success" />
                      {t('medications')}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {diagnosis.medications.map((med, idx) => (
                        <li key={idx}>{med}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Contraindications */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      {t('contraindications')}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {diagnosis.contraindications.map((contra, idx) => (
                        <li key={idx} className="text-destructive">
                          {contra}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Disclaimer */}
      <Alert className="shadow-soft">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-bold">{t('disclaimer')}</AlertTitle>
        <AlertDescription className="text-sm">
          {t('disclaimerText')}
        </AlertDescription>
      </Alert>
    </div>
    </>
  );
}