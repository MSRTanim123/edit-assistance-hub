import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PatientFormProps {
  onSuccess?: () => void;
}

export function PatientForm({ onSuccess }: PatientFormProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    weight: '',
    village: '',
    phone: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('patients').insert({
        name: formData.name,
        age: parseInt(formData.age),
        sex: formData.sex,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        village: formData.village || null,
        phone: formData.phone || null,
        created_by: user?.id,
      });
      
      if (error) throw error;
      
      toast.success(t('patientRegistered'));
      setFormData({
        name: '',
        age: '',
        sex: '',
        weight: '',
        village: '',
        phone: '',
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error registering patient:', error);
      toast.error(t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-2xl">{t('patientRegistration')}</CardTitle>
        <CardDescription>
          Register a new patient in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('patientName')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">{t('age')} *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                min="1"
                max="150"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sex">{t('sex')} *</Label>
              <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('sex')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('male')}</SelectItem>
                  <SelectItem value="female">{t('female')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">{t('weight')}</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="village">{t('village')}</Label>
            <Input
              id="village"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('registerPatient')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}