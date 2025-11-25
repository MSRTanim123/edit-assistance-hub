import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn as offlineSignIn, signOut as offlineSignOut, getSession, User, Session, initializeAuth } from '@/lib/offlineAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'admin' | 'user' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function OfflineAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    await initializeAuth();
    const { user, session } = await getSession();
    setUser(user);
    setSession(session);
    setUserRole(user?.role as 'admin' | 'user' || null);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, session, error } = await offlineSignIn(email, password);
      
      if (error) return { error };

      setUser(user);
      setSession(session);
      setUserRole(user?.role as 'admin' | 'user' || null);
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await offlineSignOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    navigate('/login');
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signIn,
    signOut,
    isAdmin: userRole === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an OfflineAuthProvider');
  }
  return context;
}
