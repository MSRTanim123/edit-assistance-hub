import { useState } from 'react';
import { Header } from '@/components/Header';
import { PatientForm } from '@/components/PatientForm';
import { DiagnosisForm } from '@/components/DiagnosisForm';
import { DiagnosisResults } from '@/components/DiagnosisResults';
import { EncounterHistory } from '@/components/EncounterHistory';
import { PatientProfile } from '@/components/PatientProfile';
import { UpcomingAppointments } from '@/components/UpcomingAppointments';
import { TelemedicineCard } from '@/components/TelemedicineCard';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Stethoscope, ArrowLeft, History, Activity, Calendar, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DiagnosisResult, RedFlagAlert } from '@/lib/aiDiagnosis';

type ViewMode = 'home' | 'newPatient' | 'diagnose' | 'results' | 'history' | 'patientProfile';

interface DiagnosisData {
  diagnoses: DiagnosisResult[];
  redFlags: RedFlagAlert[];
  patientId: string;
  vitals: any;
  encounterId?: string;
}

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisData | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  const handlePatientSuccess = () => {
    setViewMode('home');
  };
  
  const handleDiagnosisComplete = (data: DiagnosisData) => {
    setDiagnosisData(data);
    setViewMode('results');
  };

  const handleViewPatientProfile = (patientId: string) => {
    setSelectedPatientId(patientId);
    setViewMode('patientProfile');
  };
  
  const renderContent = () => {
    switch (viewMode) {
      case 'newPatient':
        return <PatientForm onSuccess={handlePatientSuccess} />;
      case 'diagnose':
        return <DiagnosisForm onDiagnosisComplete={handleDiagnosisComplete} />;
      case 'results':
        return diagnosisData ? (
          <DiagnosisResults 
            diagnoses={diagnosisData.diagnoses} 
            redFlags={diagnosisData.redFlags}
            encounterId={diagnosisData.encounterId}
          />
        ) : null;
      case 'history':
        return <EncounterHistory onViewPatient={handleViewPatientProfile} />;
      case 'patientProfile':
        return selectedPatientId ? <PatientProfile patientId={selectedPatientId} /> : null;
      default:
        return (
          <div className="w-full">
            {/* Hero Section */}
            <section className="bg-gradient-hero py-20 px-4 animate-fade-in">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center space-y-6">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight">
                    {t('appTitle')}
                  </h1>
                  <p className="text-xl md:text-2xl text-secondary font-medium">
                    {t('homeSubtitle')}
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    {t('homeDescription')}
                  </p>
                </div>
              </div>
            </section>

            {/* Feature Cards Section */}
            <section className="container mx-auto px-4 -mt-12 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div 
                  className="group bg-gradient-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border border-border hover:border-primary/50 animate-slide-up"
                  style={{ animationDelay: '0.1s' }}
                  onClick={() => setViewMode('newPatient')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                      <UserPlus className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('newPatient')}</h3>
                    <p className="text-sm text-muted-foreground">Register new patients</p>
                  </div>
                </div>

                <div 
                  className="group bg-gradient-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border border-border hover:border-primary/50 animate-slide-up"
                  style={{ animationDelay: '0.2s' }}
                  onClick={() => setViewMode('diagnose')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-secondary/10 rounded-2xl group-hover:bg-secondary/20 transition-colors">
                      <Stethoscope className="h-12 w-12 text-secondary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('diagnose')}</h3>
                    <p className="text-sm text-muted-foreground">AI-powered diagnosis</p>
                  </div>
                </div>

                <div 
                  className="group bg-gradient-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border border-border hover:border-primary/50 animate-slide-up"
                  style={{ animationDelay: '0.3s' }}
                  onClick={() => setViewMode('history')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-success/10 rounded-2xl group-hover:bg-success/20 transition-colors">
                      <History className="h-12 w-12 text-success" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('viewHistory')}</h3>
                    <p className="text-sm text-muted-foreground">Patient history</p>
                  </div>
                </div>

                <div 
                  className="group bg-gradient-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border border-border hover:border-primary/50 animate-slide-up"
                  style={{ animationDelay: '0.4s' }}
                  onClick={() => navigate('/appointments')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-colors">
                      <Calendar className="h-12 w-12 text-accent-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Appointments</h3>
                    <p className="text-sm text-muted-foreground">Manage appointments</p>
                  </div>
                </div>

                <div 
                  className="group bg-gradient-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border border-border hover:border-primary/50 animate-slide-up"
                  style={{ animationDelay: '0.5s' }}
                  onClick={() => navigate('/appointments')}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                      <Video className="h-12 w-12 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Telemedicine</h3>
                    <p className="text-sm text-muted-foreground">Video consultations</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Upcoming Appointments Widget */}
            <section className="container mx-auto px-4 py-8 max-w-6xl">
              <UpcomingAppointments />
            </section>

            {/* Features List Section */}
            <section className="container mx-auto px-4 py-16 max-w-6xl">
              <div className="bg-gradient-card rounded-2xl p-8 shadow-card border border-border animate-scale-in">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">{t('features')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-2xl text-success mt-1">✓</span>
                    <p className="text-foreground font-medium">{t('featureOfflineAI')}</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-2xl text-success mt-1">✓</span>
                    <p className="text-foreground font-medium">{t('featureRedFlags')}</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-2xl text-success mt-1">✓</span>
                    <p className="text-foreground font-medium">{t('featureTriage')}</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-2xl text-success mt-1">✓</span>
                    <p className="text-foreground font-medium">{t('featureDrugInteraction')}</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-2xl text-success mt-1">✓</span>
                    <p className="text-foreground font-medium">{t('featureMultilingual')}</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-2xl text-success mt-1">✓</span>
                    <p className="text-foreground font-medium">{t('featurePatientRecords')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {viewMode !== 'home' && (
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setViewMode('home')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back')}
            </Button>
            {renderContent()}
          </div>
        )}
        
        {viewMode === 'home' && renderContent()}
      </main>
      
      {viewMode === 'home' && (
        <footer className="bg-gradient-to-br from-accent/20 via-background to-accent/30 border-t border-border mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{t('appTitle')}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('homeDescription')}
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button onClick={() => setViewMode('newPatient')} className="text-muted-foreground hover:text-primary transition-colors">
                      {t('newPatient')}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setViewMode('diagnose')} className="text-muted-foreground hover:text-primary transition-colors">
                      {t('diagnose')}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setViewMode('history')} className="text-muted-foreground hover:text-primary transition-colors">
                      {t('viewHistory')}
                    </button>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">Privacy Policy</li>
                  <li className="text-muted-foreground">Terms & Conditions</li>
                  <li className="text-muted-foreground">{t('disclaimer')}</li>
                  <li className="text-xs text-muted-foreground pt-2">Version 1.0.0</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Contact</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-muted-foreground">support@medicalai.org</li>
                  <li className="text-muted-foreground">Rural Healthcare Initiative</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                <p>© 2025 {t('appTitle')}. All rights reserved.</p>
                <p className="text-center md:text-right">
                  For clinical decision support only — not a replacement for licensed medical professionals.
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;