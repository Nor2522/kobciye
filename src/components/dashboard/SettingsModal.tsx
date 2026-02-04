import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: () => void;
}

export function SettingsModal({ isOpen, onClose, onProfileUpdate }: SettingsModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Full name is required' : 'Magaca buuxa waa lagama maarmaan',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Profile Updated' : 'Profile La Cusbooneysiiyey',
        description: language === 'en' 
          ? 'Your profile has been updated successfully.' 
          : 'Profile-kaaga si guul leh ayaa loo cusbooneysiiyey.',
      });
      onProfileUpdate?.();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: error.message || (language === 'en' ? 'Failed to update profile' : 'Cusbooneysiinta waa fashilantay'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Please fill in all password fields' : 'Fadlan buuxi meelaha password-ka',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Password must be at least 8 characters' : 'Password-ku waa inuu ahaadaa ugu yaraan 8 xaraf',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Passwords do not match' : 'Password-yadu iskuma mid aha',
        variant: 'destructive',
      });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Password Updated' : 'Password La Bedelay',
        description: language === 'en' 
          ? 'Your password has been changed successfully.' 
          : 'Password-kaaga si guul leh ayaa loo bedelay.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: error.message || (language === 'en' ? 'Failed to change password' : 'Beddelka password-ku wuu fashilmay'),
        variant: 'destructive',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = (fullName || user?.email?.split('@')[0] || 'U').slice(0, 2).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'en' ? 'Settings' : 'Qaabeynta'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' ? 'Manage your account settings' : 'Maamul qaabeynta akoonkaaga'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              {language === 'en' ? 'Profile' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="security">
              {language === 'en' ? 'Security' : 'Amniga'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label>{language === 'en' ? 'Avatar URL' : 'URL Sawirka'}</Label>
                <Input
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {language === 'en' ? 'Full Name' : 'Magaca Buuxa'}
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={language === 'en' ? 'Enter your full name' : 'Geli magacaaga buuxa'}
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {language === 'en' ? 'Email' : 'Email'}
              </Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'Email cannot be changed' : 'Email-ka lama bedeli karo'}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Phone Number' : 'Lambarka Telefoonka'}</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+252 XX XXX XXXX"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Save Changes' : 'Kaydi Isbedelka'}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {language === 'en' ? 'New Password' : 'Password Cusub'}
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'en' ? 'Confirm New Password' : 'Xaqiiji Password-ka Cusub'}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {language === 'en' 
                ? 'Password must be at least 8 characters long'
                : 'Password-ku waa inuu ahaadaa ugu yaraan 8 xaraf'}
            </p>

            <Button onClick={handleChangePassword} disabled={savingPassword} className="w-full">
              {savingPassword ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Change Password' : 'Bedel Password-ka'}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
