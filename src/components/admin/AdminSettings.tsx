import React, { useEffect, useState, useCallback } from 'react';
import { Settings, Save, RefreshCw, Shield, Bell, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneralSettings {
  site_name: string;
  maintenance_mode: boolean;
  allow_registrations: boolean;
}

interface CourseSettings {
  require_enrollment: boolean;
  free_preview_enabled: boolean;
  auto_complete_threshold: number;
}

interface NotificationSettings {
  email_notifications: boolean;
  enrollment_notifications: boolean;
  completion_notifications: boolean;
}

export function AdminSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    site_name: 'Kobciye',
    maintenance_mode: false,
    allow_registrations: true,
  });
  
  const [courseSettings, setCourseSettings] = useState<CourseSettings>({
    require_enrollment: true,
    free_preview_enabled: true,
    auto_complete_threshold: 90,
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    enrollment_notifications: true,
    completion_notifications: true,
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (error) throw error;

      data?.forEach((setting) => {
        const value = setting.value as Record<string, any>;
        switch (setting.key) {
          case 'general':
            setGeneralSettings(value as GeneralSettings);
            break;
          case 'courses':
            setCourseSettings(value as CourseSettings);
            break;
          case 'notifications':
            setNotificationSettings(value as NotificationSettings);
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Failed to load settings' : 'Qaabeynta lama soo dejin karin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [language, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Upsert all settings using JSON.parse/stringify to ensure proper JSON type
      const updates = [
        { key: 'general', value: JSON.parse(JSON.stringify(generalSettings)) },
        { key: 'courses', value: JSON.parse(JSON.stringify(courseSettings)) },
        { key: 'notifications', value: JSON.parse(JSON.stringify(notificationSettings)) },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ value: update.value })
          .eq('key', update.key);
        
        if (error) throw error;
      }

      toast({
        title: language === 'en' ? 'Settings Saved' : 'Qaabeynta La Keydiyey',
        description: language === 'en' 
          ? 'Your settings have been saved successfully.'
          : 'Qaabeyntaada si guul leh ayaa loo keydiyey.',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: error.message || (language === 'en' ? 'Failed to save settings' : 'Qaabeynta lama keydin karin'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {language === 'en' ? 'System Settings' : 'Qaabeynta Nidaamka'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Refresh' : 'Cusbooneysi'}
          </Button>
          <Button size="sm" onClick={saveSettings} disabled={saving}>
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {language === 'en' ? 'Save All' : 'Kaydi Dhammaan'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">
                {language === 'en' ? 'General Settings' : 'Qaabeynta Guud'}
              </CardTitle>
            </div>
            <CardDescription>
              {language === 'en' ? 'Core platform configuration' : 'Qaabeynta aasaasiga ah'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Site Name' : 'Magaca Websaydka'}</Label>
              <Input
                value={generalSettings.site_name}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, site_name: e.target.value }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{language === 'en' ? 'Maintenance Mode' : 'Habka Dayactirka'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Disable access for regular users' : 'Jooji gelitaanka isticmaalayaasha'}
                </p>
              </div>
              <Switch
                checked={generalSettings.maintenance_mode}
                onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, maintenance_mode: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{language === 'en' ? 'Allow Registrations' : 'Ogolow Diiwaangelinta'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Allow new users to sign up' : 'U ogolow isticmaalayaasha cusub inay is-diiwaangeliyaan'}
                </p>
              </div>
              <Switch
                checked={generalSettings.allow_registrations}
                onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, allow_registrations: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <CardTitle className="text-lg">
                {language === 'en' ? 'Course Settings' : 'Qaabeynta Koorsooyin'}
              </CardTitle>
            </div>
            <CardDescription>
              {language === 'en' ? 'Configure course behavior' : 'Habee dhaqanka koorsada'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{language === 'en' ? 'Require Enrollment' : 'U Baahan Diiwaangelin'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Users must enroll to access courses' : 'Isticmaalayaashu waa inay is-diiwaangeliyaan'}
                </p>
              </div>
              <Switch
                checked={courseSettings.require_enrollment}
                onCheckedChange={(checked) => setCourseSettings(prev => ({ ...prev, require_enrollment: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{language === 'en' ? 'Free Preview' : 'Daawasho Bilaash'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Allow free videos without enrollment' : 'U ogolow fiidiyowyada bilaashka ah'}
                </p>
              </div>
              <Switch
                checked={courseSettings.free_preview_enabled}
                onCheckedChange={(checked) => setCourseSettings(prev => ({ ...prev, free_preview_enabled: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Auto-Complete Threshold (%)' : 'Xadka Dhamaystirka Tooska ah (%)'}</Label>
              <Input
                type="number"
                min="50"
                max="100"
                value={courseSettings.auto_complete_threshold}
                onChange={(e) => setCourseSettings(prev => ({ ...prev, auto_complete_threshold: parseInt(e.target.value) || 90 }))}
              />
              <p className="text-xs text-muted-foreground">
                {language === 'en' 
                  ? 'Videos are marked complete when watched to this percentage'
                  : 'Fiidiyowyada waxaa lagu calaamdeeya dhammaystiran marka la daawado ilaa boqolkiiba tan'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-lg">
                {language === 'en' ? 'Notification Settings' : 'Qaabeynta Ogeysiisyada'}
              </CardTitle>
            </div>
            <CardDescription>
              {language === 'en' ? 'Configure system notifications' : 'Habee ogeysiisyada nidaamka'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <div className="space-y-0.5">
                  <Label>{language === 'en' ? 'Email Notifications' : 'Ogeysiisyada Email'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Send email alerts' : 'Dir ogeysiis email'}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <div className="space-y-0.5">
                  <Label>{language === 'en' ? 'Enrollment Notifications' : 'Ogeysiisyada Diiwaangelinta'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Notify on new enrollments' : 'U sheeg diiwaangelinta cusub'}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.enrollment_notifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enrollment_notifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                <div className="space-y-0.5">
                  <Label>{language === 'en' ? 'Completion Notifications' : 'Ogeysiisyada Dhamaystirka'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Notify on course completion' : 'U sheeg dhamaystirka koorsada'}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.completion_notifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, completion_notifications: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
