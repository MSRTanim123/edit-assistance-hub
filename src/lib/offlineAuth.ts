import { offlineDB, generateId } from './offlineStorage';

export interface User {
  id: string;
  email: string;
  role: string;
  username?: string;
  full_name?: string;
}

export interface Session {
  id: string;
  user_id: string;
  email: string;
  role: string;
  expires_at: string;
}

// Initialize with admin user if none exists
export async function initializeAuth() {
  const users = await offlineDB.getAll('users');
  if (users.length === 0) {
    const adminId = generateId();
    await offlineDB.add('users', {
      id: adminId,
      email: 'admin@rural.health',
      password: 'admin123',
      username: 'admin',
      full_name: 'Admin User',
      role: 'admin'
    });
  }
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: any }> {
  try {
    const users = await offlineDB.getAll('users');
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { user: null, session: null, error: { message: 'Invalid email or password' } };
    }

    const session: Session = {
      id: generateId(),
      user_id: user.id,
      email: user.email,
      role: user.role,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    await offlineDB.clear('session');
    await offlineDB.add('session', session);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        full_name: user.full_name
      },
      session,
      error: null
    };
  } catch (error) {
    return { user: null, session: null, error };
  }
}

export async function signUp(email: string, password: string, username: string, full_name?: string): Promise<{ user: User | null; error: any }> {
  try {
    const users = await offlineDB.getAll('users');
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return { user: null, error: { message: 'User already exists' } };
    }

    const userId = generateId();
    const newUser = {
      id: userId,
      email,
      password,
      username,
      full_name: full_name || username,
      role: 'user'
    };

    await offlineDB.add('users', newUser);

    return {
      user: {
        id: userId,
        email,
        role: 'user',
        username,
        full_name: full_name || username
      },
      error: null
    };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signOut(): Promise<void> {
  await offlineDB.clear('session');
}

export async function getSession(): Promise<{ user: User | null; session: Session | null }> {
  try {
    const sessions = await offlineDB.getAll('session');
    if (sessions.length === 0) {
      return { user: null, session: null };
    }

    const session = sessions[0];
    const expiresAt = new Date(session.expires_at);

    if (expiresAt < new Date()) {
      await offlineDB.clear('session');
      return { user: null, session: null };
    }

    const user = await offlineDB.get('users', session.user_id);
    if (!user) {
      return { user: null, session: null };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        full_name: user.full_name
      },
      session
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return { user: null, session: null };
  }
}

export async function getUserRole(userId: string): Promise<string> {
  const user = await offlineDB.get('users', userId);
  return user?.role || 'user';
}
