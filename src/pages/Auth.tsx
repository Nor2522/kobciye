import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const authSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().trim().min(1, 'Name is required').optional(),
});

export default function Auth() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check for password reset mode
  useEffect(() => {
    if (searchParams.get('mode') === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Handle password reset
    if (mode === 'reset') {
      if (formData.newPassword !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' });
        return;
      }
      if (formData.newPassword.length < 6) {
        setErrors({ newPassword: 'Password must be at least 6 characters' });
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (error) {
          toast({
            title: language === 'en' ? 'Error' : 'Khalad',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: language === 'en' ? 'Password Updated' : 'Password-ka waa la beddelay',
            description: language === 'en' 
              ? 'Your password has been successfully updated.'
              : 'Password-kaagii waa la beddelay si guul leh.',
          });
          navigate('/dashboard');
        }
      } catch (error) {
        toast({
          title: language === 'en' ? 'Error' : 'Khalad',
          description: language === 'en' ? 'Something went wrong.' : 'Wax qalad ah ayaa dhacay.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (mode === 'signup') {
        authSchema.parse({ ...formData, fullName: formData.fullName });
      } else {
        authSchema.omit({ fullName: true }).parse(formData);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: language === 'en' ? 'Login Failed' : 'Galitaankii waa fashilmay',
              description: language === 'en' ? 'Invalid email or password.' : 'Email ama password khalad ah.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: language === 'en' ? 'Error' : 'Khalad',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: language === 'en' ? 'Welcome Back!' : 'Ku soo dhawoow!',
            description: language === 'en' ? 'You have successfully logged in.' : 'Si guul leh ayaad u gashay.',
          });
          navigate('/dashboard');
        }
      } else {
        const { data, error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: language === 'en' ? 'Account Exists' : 'Akoon horay u jiray',
              description: language === 'en' ? 'This email is already registered. Please log in instead.' : 'Emailkan horay ayaa loo diiwaangeliyay. Fadlan gal.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: language === 'en' ? 'Error' : 'Khalad',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: language === 'en' ? 'Check Your Email' : 'Hubi Emailkaaga',
            description: language === 'en' 
              ? 'We sent you a confirmation link. Please verify your email to continue.'
              : 'Waxaan kuu soo dirnay xiriiriye xaqiijin. Fadlan xaqiiji emailkaaga si aad u sii wadato.',
          });
        }
      }
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Something went wrong. Please try again.' : 'Wax qalad ah ayaa dhacay. Fadlan mar kale isku day.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: language === 'en' ? 'Error' : 'Khalad',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Failed to sign in with Google.' : 'Galitaanka Google waa fashilmay.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">Kobciye</span>
              <span className="text-sm text-muted-foreground block -mt-1">International</span>
            </div>
          </a>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'reset'
              ? (language === 'en' ? 'Reset Password' : 'Bedel Password-ka')
              : mode === 'login' 
                ? (language === 'en' ? 'Welcome Back' : 'Ku soo dhawoow')
                : (language === 'en' ? 'Create Account' : 'Samayso Akoon')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === 'reset'
              ? (language === 'en' ? 'Enter your new password' : 'Geli password-kaaga cusub')
              : mode === 'login'
                ? (language === 'en' ? 'Sign in to continue your learning journey' : 'Gal si aad u sii wadato safarka waxbarashadaada')
                : (language === 'en' ? 'Start your educational journey today' : 'Bilow safarka waxbarashadaada maanta')}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'reset' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'en' ? 'New Password' : 'Password-ka Cusub'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'en' ? 'Confirm Password' : 'Xaqiiji Password-ka'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </>
            ) : (
              <>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Full Name' : 'Magaca Buuxa'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={language === 'en' ? 'John Doe' : 'Magacaaga'}
                        className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'en' ? 'Email Address' : 'Cinwaanka Emailka'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      {language === 'en' ? 'Password' : 'Furaha Sirta'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-accent hover:underline"
                      >
                        {language === 'en' ? 'Forgot password?' : 'Ma ilaawday password-ka?'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              </>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'reset'
                    ? (language === 'en' ? 'Update Password' : 'Cusbooneysii Password-ka')
                    : mode === 'login' 
                      ? (language === 'en' ? 'Sign In' : 'Gal')
                      : (language === 'en' ? 'Create Account' : 'Samayso Akoon')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">
                {language === 'en' ? 'Or continue with' : 'Ama ku sii wad'}
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          {/* Toggle Mode */}
          {mode !== 'reset' && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">
                    {language === 'en' ? 'Or continue with' : 'Ama ku sii wad'}
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <p className="text-center mt-6 text-muted-foreground">
                {mode === 'login' 
                  ? (language === 'en' ? "Don't have an account?" : "Ma lihid akoon?")
                  : (language === 'en' ? 'Already have an account?' : 'Horay u leedahay akoon?')}
                {' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-accent font-semibold hover:underline"
                >
                  {mode === 'login' 
                    ? (language === 'en' ? 'Sign Up' : 'Is Diiwaan Geli')
                    : (language === 'en' ? 'Sign In' : 'Gal')}
                </button>
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 relative bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30" />
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop"
            alt="Students learning"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-white text-center max-w-md">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'en' ? 'Start Your Journey Today' : 'Bilow Safarka Maanta'}
            </h2>
            <p className="text-lg text-white/80">
              {language === 'en'
                ? 'Join thousands of students who have transformed their careers with Kobciye International.'
                : 'Ku biir kumannaan arday oo beddelay shaqadooda Kobciye International.'}
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
