import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, DollarSign, Check, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';

const creditPackages = [
  { id: 1, credits: 50, price: 50, popular: false },
  { id: 2, credits: 100, price: 90, popular: true, savings: 10 },
  { id: 3, credits: 200, price: 170, popular: false, savings: 30 },
  { id: 4, credits: 500, price: 400, popular: false, savings: 100 },
];

const paymentMethods = [
  { id: 'evc', name: 'EVC Plus', icon: Phone, color: 'bg-orange-500' },
  { id: 'zaad', name: 'ZAAD', icon: Phone, color: 'bg-green-500' },
  { id: 'sahal', name: 'Sahal', icon: Phone, color: 'bg-blue-500' },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-purple-500' },
];

export default function BuyCredits() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState<number | null>(2);
  const [selectedPayment, setSelectedPayment] = useState<string>('evc');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPayment) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Please select a package and payment method.' : 'Fadlan dooro xirmo iyo hab lacag bixin.',
        variant: 'destructive',
      });
      return;
    }

    const pkg = creditPackages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    if (['evc', 'zaad', 'sahal'].includes(selectedPayment) && !phoneNumber) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Please enter your phone number.' : 'Fadlan geli lambarka telefoonkaaga.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing (in production, integrate with actual payment gateway)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Get current credits and add new ones
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: (currentProfile?.credits || 0) + pkg.credits })
        .eq('user_id', user!.id);

      if (updateError) throw updateError;

      toast({
        title: language === 'en' ? 'Success!' : 'Guul!',
        description: language === 'en' 
          ? `${pkg.credits} credits have been added to your account.`
          : `${pkg.credits} credit ayaa lagu daray akoonkaaga.`,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Payment failed. Please try again.' : 'Lacag bixintu waa fashilantay. Fadlan mar kale isku day.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back' : 'Dib'}
            </Button>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Buy Credits' : 'Iibso Credits'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Purchase credits to enroll in courses.'
                : 'Iibso credits si aad uga qeyb qaadato koorsooyin.'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Credit Packages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    {language === 'en' ? 'Select Credit Package' : 'Dooro Xirmada Credit-ka'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {creditPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPackage === pkg.id
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                            {language === 'en' ? 'Popular' : 'Caansan'}
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary mb-1">
                            {pkg.credits}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {language === 'en' ? 'Credits' : 'Credit'}
                          </div>
                          <div className="text-2xl font-semibold">
                            ${pkg.price}
                          </div>
                          {pkg.savings && (
                            <div className="text-sm text-green-600 mt-1">
                              {language === 'en' ? `Save $${pkg.savings}` : `Kaydso $${pkg.savings}`}
                            </div>
                          )}
                        </div>
                        {selectedPackage === pkg.id && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                            <Check className="w-4 h-4 text-accent-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {language === 'en' ? 'Payment Method' : 'Habka Lacag Bixinta'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <Label
                          key={method.id}
                          htmlFor={method.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedPayment === method.id
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                          <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                            <method.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium">{method.name}</span>
                          {selectedPayment === method.id && (
                            <Check className="w-5 h-5 text-accent ml-auto" />
                          )}
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>

                  {['evc', 'zaad', 'sahal'].includes(selectedPayment) && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium mb-2">
                        {language === 'en' ? 'Phone Number' : 'Lambarka Telefoonka'}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+252 XX XXX XXXX"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    {language === 'en' ? 'Order Summary' : 'Kooban Dalabka'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPackage && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {language === 'en' ? 'Credits' : 'Credits'}
                        </span>
                        <span className="font-semibold">
                          {creditPackages.find(p => p.id === selectedPackage)?.credits}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {language === 'en' ? 'Price' : 'Qiimaha'}
                        </span>
                        <span className="font-semibold">
                          ${creditPackages.find(p => p.id === selectedPackage)?.price}
                        </span>
                      </div>
                      {creditPackages.find(p => p.id === selectedPackage)?.savings && (
                        <div className="flex justify-between text-green-600">
                          <span>{language === 'en' ? 'Savings' : 'Kaydso'}</span>
                          <span>-${creditPackages.find(p => p.id === selectedPackage)?.savings}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>{language === 'en' ? 'Total' : 'Wadarta'}</span>
                          <span>${creditPackages.find(p => p.id === selectedPackage)?.price}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90"
                    onClick={handlePurchase}
                    disabled={!selectedPackage || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      language === 'en' ? 'Complete Purchase' : 'Dhamaystir Iibsashada'
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {language === 'en'
                      ? 'By completing this purchase, you agree to our Terms of Service.'
                      : 'Iibsashadani waxa ay noqon doontaa xeerka adeegga.'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
