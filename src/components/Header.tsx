import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Activity, LogOut, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80"
            aria-label="Go to home page"
          >
            <div className="p-2 bg-primary/10 rounded-lg transition-transform hover:scale-105">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('appTitle')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('appSubtitle')}
              </p>
            </div>
          </button>
          
          <div className="flex gap-2 items-center">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
              size="sm"
              className="relative group"
            >
              <span className="relative z-10">EN</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>
            <Button
              variant={language === 'hi' ? 'default' : 'outline'}
              onClick={() => setLanguage('hi')}
              size="sm"
              className="relative group"
            >
              <span className="relative z-10">हिंदी</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>
            <Button
              variant={language === 'bn' ? 'default' : 'outline'}
              onClick={() => setLanguage('bn')}
              size="sm"
              className="relative group"
            >
              <span className="relative z-10">বাংলা</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>
            
            {user && (
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    {t('adminPanel')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings')}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}