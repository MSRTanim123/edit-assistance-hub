import { useLanguage } from '@/contexts/LanguageContext';
import { DiagnosisResult, RedFlagAlert } from '@/lib/aiDiagnosis';
import { format } from 'date-fns';

interface PrintableReportProps {
  diagnoses: DiagnosisResult[];
  redFlags: RedFlagAlert[];
  patientData?: {
    name: string;
    age: number;
    sex: string;
    village?: string;
  };
  vitals?: {
    temperature?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    pulse?: number;
    spo2?: number;
  };
  symptoms?: string;
}

export const PrintableReport = ({ 
  diagnoses, 
  redFlags, 
  patientData,
  vitals,
  symptoms 
}: PrintableReportProps) => {
  const { t } = useLanguage();

  return (
    <div className="print-only fixed inset-0 bg-white text-black p-8 overflow-auto">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
              color: black;
            }
            @page {
              margin: 1cm;
            }
          }
          @media screen {
            .print-only {
              display: none;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold mb-2">{t('diagnosisResults')}</h1>
        <p className="text-sm text-gray-600">{t('generatedBy')}</p>
        <p className="text-sm text-gray-600">
          {t('dateTime')}: {format(new Date(), 'PPpp')}
        </p>
      </div>

      {/* Patient Information */}
      {patientData && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">
            {t('patientInformation')}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">{t('patientName')}:</span> {patientData.name}
            </div>
            <div>
              <span className="font-semibold">{t('age')}:</span> {patientData.age}
            </div>
            <div>
              <span className="font-semibold">{t('sex')}:</span> {patientData.sex}
            </div>
            {patientData.village && (
              <div>
                <span className="font-semibold">{t('village')}:</span> {patientData.village}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vital Signs */}
      {vitals && Object.values(vitals).some(v => v !== undefined && v !== null) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">
            {t('vitalSigns')}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {vitals.temperature && (
              <div>
                <span className="font-semibold">{t('temperature')}:</span> {vitals.temperature}°F
              </div>
            )}
            {vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic && (
              <div>
                <span className="font-semibold">{t('bloodPressure')}:</span>{' '}
                {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg
              </div>
            )}
            {vitals.pulse && (
              <div>
                <span className="font-semibold">{t('pulse')}:</span> {vitals.pulse} bpm
              </div>
            )}
            {vitals.spo2 && (
              <div>
                <span className="font-semibold">{t('spo2')}:</span> {vitals.spo2}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinical Findings */}
      {symptoms && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">
            {t('clinicalFindings')}
          </h2>
          <div className="text-sm">
            <span className="font-semibold">{t('symptoms')}:</span>
            <p className="mt-1">{symptoms}</p>
          </div>
        </div>
      )}

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="mb-6 border-2 border-red-600 p-4 rounded">
          <h2 className="text-xl font-bold mb-3 text-red-600">
            ⚠️ {t('redFlags')}
          </h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            {redFlags.map((flag, idx) => (
              <li key={idx} className="text-red-700">
                <strong>{flag.condition}:</strong> {flag.action} ({flag.severity})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Assessment and Plan */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">
          {t('assessmentAndPlan')}
        </h2>
        <div className="space-y-4">
          {diagnoses.map((diagnosis, idx) => (
            <div key={idx} className="border border-gray-300 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">
                  {idx + 1}. {diagnosis.name}
                </h3>
                <span className="text-sm bg-gray-200 px-3 py-1 rounded">
                  {t('confidence')}: {diagnosis.confidence.toFixed(0)}%
                </span>
              </div>
              
              <div className="mb-3">
                <p className="font-semibold text-sm mb-1">{t('triageInstructions')}:</p>
                <p className="text-sm">{diagnosis.triage}</p>
              </div>

              {diagnosis.medications && diagnosis.medications.length > 0 && (
                <div className="mb-3">
                  <p className="font-semibold text-sm mb-1">{t('medications')}:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {diagnosis.medications.map((med, medIdx) => (
                      <li key={medIdx}>{med}</li>
                    ))}
                  </ul>
                </div>
              )}

              {diagnosis.contraindications && diagnosis.contraindications.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-1">{t('contraindications')}:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {diagnosis.contraindications.map((contra, contraIdx) => (
                      <li key={contraIdx}>{contra}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-4 border-t-2 border-black">
        <h3 className="font-bold mb-2">{t('medicalDisclaimer')}:</h3>
        <p className="text-xs text-gray-700">
          {t('disclaimerText')}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>___________________________</p>
        <p className="mt-2">Healthcare Provider Signature</p>
      </div>
    </div>
  );
};
