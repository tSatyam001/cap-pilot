import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCapTable } from '@/contexts/CapTableContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { companyName, setCompanyName, currency, setCurrency } = useCapTable();
  const { toast } = useToast();

  const [nameInput, setNameInput] = useState(companyName);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) return;
    setSavingProfile(true);
    setCompanyName(nameInput.trim());
    toast({ title: 'Profile updated', description: 'Company name updated. Click Commit to save to cloud.' });
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setChangingPassword(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, password, and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Profile</CardTitle>
          </div>
          <CardDescription>Update your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Enter company name" />
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
            {savingProfile ? 'Saving...' : 'Update Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Change Password</CardTitle>
          </div>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
          </div>
          <Button onClick={handleChangePassword} disabled={changingPassword} size="sm">
            {changingPassword ? 'Updating...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Preferences</CardTitle>
          </div>
          <CardDescription>Customize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Currency</Label>
            <div className="flex items-center gap-2">
              <Button variant={currency === '$' ? 'default' : 'outline'} size="sm" onClick={() => setCurrency('$')}>USD ($)</Button>
              <Button variant={currency === '₹' ? 'default' : 'outline'} size="sm" onClick={() => setCurrency('₹')}>INR (₹)</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sign Out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
