import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/OfflineAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { offlineDB, generateId } from '@/lib/offlineStorage';

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  email?: string;
  role?: 'admin' | 'user';
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [creating, setCreating] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = await offlineDB.getAll('users');
      const usersWithRoles: UserProfile[] = allUsers.map(user => ({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role as 'admin' | 'user',
      }));
      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('Email, password, and username are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Check if user already exists
      const existingUsers = await offlineDB.getAll('users');
      if (existingUsers.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUserId = generateId();
      await offlineDB.add('users', {
        id: newUserId,
        email,
        password,
        username,
        full_name: fullName || username,
        role,
      });

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      // Reset form
      setEmail('');
      setPassword('');
      setUsername('');
      setFullName('');
      setRole('user');

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    // Prevent self-deletion
    if (userId === currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot delete your own account',
      });
      return;
    }

    try {
      await offlineDB.delete('users', userId);

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {t('createUser') || 'Create New User'}
              </CardTitle>
              <CardDescription>
                {t('createUserDescription') || 'Add a new healthcare worker to the system'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email') || 'Email'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={creating}
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
                    disabled={creating}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('username') || 'Username'}</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('fullName') || 'Full Name'}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('role') || 'Role'}</Label>
                  <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)} disabled={creating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t('userRole') || 'User'}</SelectItem>
                      <SelectItem value="admin">{t('adminRole') || 'Admin'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? (t('creating') || 'Creating...') : (t('createUser') || 'Create User')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('users') || 'Users'}</CardTitle>
              <CardDescription>
                {t('manageUsers') || 'Manage healthcare workers'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">{t('loading') || 'Loading...'}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('username') || 'Username'}</TableHead>
                        <TableHead>{t('role') || 'Role'}</TableHead>
                        <TableHead>{t('actions') || 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              {user.full_name && (
                                <div className="text-sm text-muted-foreground">{user.full_name}</div>
                              )}
                              {user.email && (
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={user.role === 'admin' ? 'text-primary font-medium' : ''}>
                              {user.role === 'admin' ? (t('adminRole') || 'Admin') : (t('userRole') || 'User')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
