import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OfflineAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { signUp as offlineSignUp } from '@/lib/offlineAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Shield, Users, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: t('error') || 'Error',
        description: error.message || 'Invalid credentials',
      });
      setLoading(false);
    } else {
      toast({
        title: t('success') || 'Success',
        description: 'Logged in successfully',
      });
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Passwords do not match',
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 6 characters',
      });
      return;
    }

    if (!signupUsername.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Username is required',
      });
      return;
    }

    setSignupLoading(true);

    try {
      const { user, error } = await offlineSignUp(
        signupEmail,
        signupPassword,
        signupUsername,
        signupFullName || signupUsername
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Account created successfully! You can now log in.',
      });

      // Clear signup form
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupUsername('');
      setSignupFullName('');
      
      // Switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement;
      if (loginTab) loginTab.click();
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create account',
      });
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Activity className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Healthcare System</CardTitle>
          <CardDescription>
            Access your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-muted/50 border-muted">
            <Info className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-2 text-sm">
                <p className="font-medium">Unified Authentication System</p>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Admins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Healthcare Workers</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Access level is determined by your role after login
                </p>
              </div>
            </AlertDescription>
          </Alert>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email') || 'Email'}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="healthcare@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password') || 'Password'}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (t('loading') || 'Loading...') : (t('login') || 'Login')}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={signupLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="username"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    required
                    disabled={signupLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">Full Name (optional)</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="Your full name"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    disabled={signupLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={signupLoading}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    disabled={signupLoading}
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              First time setting up the system?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/initialize')}
            >
              Initialize System
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
