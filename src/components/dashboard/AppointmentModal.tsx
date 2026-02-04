import React, { useState } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentModal({ isOpen, onClose, onSuccess }: AppointmentModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('10:00');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Please enter a title' : 'Fadlan geli cinwaan',
        variant: 'destructive',
      });
      return;
    }

    if (!date) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Please select a date' : 'Fadlan dooro taariikh',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from('appointments').insert({
        user_id: user!.id,
        title: title.trim(),
        description: description.trim() || null,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      // Create notification for the user
      await supabase.from('notifications').insert({
        user_id: user!.id,
        title: language === 'en' ? 'Appointment Booked' : 'Ballan La Xareeyay',
        message: language === 'en' 
          ? `Your appointment "${title}" has been scheduled for ${format(scheduledAt, 'PPP')} at ${time}`
          : `Ballankaaga "${title}" waxaa loo qorsheeyay ${format(scheduledAt, 'PPP')} markay tahay ${time}`,
        type: 'success',
      });

      toast({
        title: language === 'en' ? 'Appointment Booked!' : 'Ballan La Xareeyay!',
        description: language === 'en' 
          ? 'Your appointment has been scheduled successfully.'
          : 'Ballankaaga si guul leh ayaa loo qorsheeyay.',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setDate(undefined);
      setTime('10:00');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: error.message || (language === 'en' ? 'Failed to book appointment' : 'Xareynta ballanta waa fashilantay'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Disable past dates
  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {language === 'en' ? 'Book Appointment' : 'Xarey Ballan'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en' 
              ? 'Schedule a consultation or meeting with our team.'
              : 'Qorsheey la-tashiyo ama kulan kooxdayada.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>{language === 'en' ? 'Title' : 'Cinwaan'} *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'en' ? 'e.g., Career Consultation' : 'tusaale, La-tashi Shaqo'}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {language === 'en' ? 'Description (Optional)' : 'Sharaxaad (Ikhtiyaari)'}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'en' ? 'Describe what you want to discuss...' : 'Sharax waxa aad rabto inaad ka hadasho...'}
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>{language === 'en' ? 'Date' : 'Taariikh'} *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : (language === 'en' ? 'Select a date' : 'Dooro taariikh')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDates}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Time' : 'Waqtiga'}
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {language === 'en' ? 'Cancel' : 'Jooji'}
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              language === 'en' ? 'Book Appointment' : 'Xarey Ballan'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
