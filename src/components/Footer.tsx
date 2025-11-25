import { useLanguage } from '@/contexts/LanguageContext';
import { Activity, Mail, FileText, Shield, BookOpen } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gradient-to-br from-accent/20 via-background to-accent/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
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
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('newPatient')}
                </a>
              </li>
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('diagnose')}
                </a>
              </li>
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('viewHistory')}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('disclaimer')}
                </a>
              </li>
              <li className="text-xs text-muted-foreground pt-2">
                Version 1.0.0
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">
                support@medicalai.org
              </li>
              <li className="text-muted-foreground">
                Rural Healthcare Initiative
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 {t('appTitle')}. All rights reserved.</p>
            <p className="text-center md:text-right">
              {t('disclaimerText')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
