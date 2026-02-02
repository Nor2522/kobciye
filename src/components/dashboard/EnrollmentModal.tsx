import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, Check, ArrowRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/lib/courses';

interface EnrollmentModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnrollmentModal({ course, isOpen, onClose, onSuccess }: EnrollmentModalProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userCredits, setUserCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'success' | 'insufficient'>('idle');

  useEffect(() => {
    if (isOpen && user) {
      fetchUserCredits();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setEnrollmentStatus('idle');
    }
  }, [isOpen]);

  async function fetchUserCredits() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setUserCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }

  const handleEnroll = async () => {
    if (!course || !user) return;

    const coursePrice = course.price || 0;

    if (userCredits < coursePrice) {
      setEnrollmentStatus('insufficient');
      return;
    }

    setIsLoading(true);

    try {
      // Call the database function to enroll with credit deduction
      const { data, error } = await supabase.rpc('enroll_with_credits', {
        _user_id: user.id,
        _course_id: course.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; credits_remaining?: number };

      if (result.success) {
        setEnrollmentStatus('success');
        setUserCredits(result.credits_remaining || 0);
        toast({
          title: language === 'en' ? 'Enrolled Successfully!' : 'Is-diiwaangelinta waa lagu guuleystay!',
          description: language === 'en' 
            ? `You are now enrolled in ${course.title}`
            : `Hadda waad ka qeyb qaadatay ${course.title_so || course.title}`,
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        if (result.error === 'Insufficient credits') {
          setEnrollmentStatus('insufficient');
        } else if (result.error === 'Already enrolled in this course') {
          toast({
            title: language === 'en' ? 'Already Enrolled' : 'Horay u diiwaangashay',
            description: language === 'en' 
              ? 'You are already enrolled in this course.'
              : 'Koorsadan horay ayaad uga qeyb qaadatay.',
            variant: 'destructive',
          });
        } else {
          throw new Error(result.error || 'Enrollment failed');
        }
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: error.message || (language === 'en' ? 'Failed to enroll.' : 'Is-diiwaangelintii waa fashilantay.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) return null;

  const coursePrice = course.price || 0;
  const hasEnoughCredits = userCredits >= coursePrice;
  const title = language === 'en' ? course.title : (course.title_so || course.title);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {enrollmentStatus === 'success' 
              ? (language === 'en' ? 'Enrollment Complete!' : 'Is-diiwaangelinta waa la dhammeeyey!')
              : (language === 'en' ? 'Enroll in Course' : 'Ka qeyb qaado Koorsada')}
          </DialogTitle>
          <DialogDescription>
            {enrollmentStatus === 'idle' && title}
          </DialogDescription>
        </DialogHeader>

        {enrollmentStatus === 'success' ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {language === 'en' ? 'Welcome to the course!' : 'Ku soo dhawoow koorsada!'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'You can now access all course materials from your dashboard.'
                : 'Hadda waad geli kartaa dhammaan agabka koorsada dashboard-kaaga.'}
            </p>
          </motion.div>
        ) : enrollmentStatus === 'insufficient' ? (
          <div className="py-6 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-8 h-8 text-destructive shrink-0" />
              <div>
                <h4 className="font-semibold text-destructive">
                  {language === 'en' ? 'Insufficient Credits' : 'Credit ku filna ma jirto'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? `You need ${coursePrice - userCredits} more credits to enroll.`
                    : `Waxaad u baahan tahay ${coursePrice - userCredits} credit oo dheeraad ah.`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Your Balance' : 'Dheelitirkaaga'}
                </span>
              </div>
              <span className="font-semibold">{userCredits} credits</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Course Price' : 'Qiimaha Koorsada'}
                </span>
              </div>
              <span className="font-semibold">{coursePrice} credits</span>
            </div>

            <Button
              size="lg"
              className="w-full bg-accent hover:bg-accent/90"
              onClick={() => {
                onClose();
                navigate('/buy-credits');
              }}
            >
              {language === 'en' ? 'Buy Credits' : 'Iibso Credits'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Your Balance' : 'Dheelitirkaaga'}
                </span>
              </div>
              <span className={`font-semibold ${hasEnoughCredits ? 'text-green-600' : 'text-destructive'}`}>
                {userCredits} credits
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Course Price' : 'Qiimaha Koorsada'}
                </span>
              </div>
              <span className="font-semibold">{coursePrice} credits</span>
            </div>

            {hasEnoughCredits && (
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <span className="text-sm">
                  {language === 'en' ? 'Remaining after enrollment' : 'Hadhaya kadib is-diiwaangelinta'}
                </span>
                <span className="font-semibold text-green-600">
                  {userCredits - coursePrice} credits
                </span>
              </div>
            )}

            <Button
              size="lg"
              className="w-full bg-accent hover:bg-accent/90"
              onClick={handleEnroll}
              disabled={isLoading || !hasEnoughCredits}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {hasEnoughCredits 
                    ? (language === 'en' ? 'Confirm Enrollment' : 'Xaqiiji Is-diiwaangelinta')
                    : (language === 'en' ? 'Not Enough Credits' : 'Credit ku filna ma jirto')}
                </>
              )}
            </Button>

            {!hasEnoughCredits && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onClose();
                  navigate('/buy-credits');
                }}
              >
                {language === 'en' ? 'Buy More Credits' : 'Iibso Credit Dheeraad Ah'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
