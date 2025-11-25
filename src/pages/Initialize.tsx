import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Initialize() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/init-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize admin user');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
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
          <CardTitle className="text-2xl">System Initialization</CardTitle>
          <CardDescription>
            Initialize the system with a default admin user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success && !error && (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to create the default administrator account. This can only be done once.
              </p>
              <Button 
                onClick={handleInitialize} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Initializing...' : 'Create Admin User'}
              </Button>
            </>
          )}

          {success && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Default admin user has been created successfully.
                </AlertDescription>
              </Alert>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Default Credentials:</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Email:</strong> admin@healthcare.local</p>
                  <p><strong>Password:</strong> admin123</p>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  ⚠️ Please change this password immediately after first login!
                </p>
              </div>

              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Go to Login
              </Button>
            </>
          )}

          {error && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleInitialize} 
                  className="w-full" 
                  disabled={loading}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full"
                  variant="ghost"
                >
                  Go to Login
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
