import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().trim().max(20, 'Phone number too long').optional(),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message too long'),
});

const faqs = [
  {
    question: { en: 'How do I enroll in a course?', so: 'Sideen ugu qoran karaa koorso?' },
    answer: { 
      en: 'You can enroll by creating an account, selecting your desired course, and completing the payment process. Our team will then contact you with further details.', 
      so: 'Waxaad is diiwaan gelin kartaa adoo samaysanaya akoon, dooranaya koorsada aad rabto, oo dhammaystiraya habka lacag bixinta. Kooxdayadu ayaa kula soo xiriiri doonta faahfaahin dheeraad ah.' 
    }
  },
  {
    question: { en: 'What payment methods do you accept?', so: 'Habab lacag bixin oo kale ayaad aqbashaan?' },
    answer: { 
      en: 'We accept EVC Plus, ZAAD, Sahal, Dahabshiil, and bank cards. Choose the option most convenient for you during checkout.', 
      so: 'Waxaan aqbalaa EVC Plus, ZAAD, Sahal, Dahabshiil, iyo kaadhadhka bangiyada. Dooro doorashada kuugu habboon inta lagu jiro checkout-ka.' 
    }
  },
  {
    question: { en: 'Are courses available online?', so: 'Koorsoyinka ma la heli karaa onlayn?' },
    answer: { 
      en: 'Yes! Most of our courses are available both online and on-campus. Online courses include video lessons, live sessions, and downloadable materials.', 
      so: 'Haa! Inta badan koorsadayada waxaa la heli karaa onlayn iyo kampaska labadaba. Koorsoyinka onlaynka waxaa ku jira casharro video ah, kulamo toos ah, iyo agab la soo degsan karo.' 
    }
  },
  {
    question: { en: 'How long does it take to complete a course?', so: 'Intee le\'eg ayay qaadataa in la dhammaystiranayo koorso?' },
    answer: { 
      en: 'Course duration varies from 3 months to 12 months depending on the program. Each course page shows the specific duration.', 
      so: 'Muddada koorsadu way kala duwan tahay 3 bilood ilaa 12 bilood iyadoo ku xiran barnaamijka. Bogga koorso kasta ayaa muujinaya muddada gaarka ah.' 
    }
  },
  {
    question: { en: 'Do you provide certificates?', so: 'Ma bixisaan shahaadooyin?' },
    answer: { 
      en: 'Yes, upon successful completion of any course, you will receive an official Kobciye International certificate recognized by employers.', 
      so: 'Haa, marka aad si guul leh u dhammaystirto koorso kasta, waxaad heli doontaa shahaado rasmi ah oo Kobciye International oo ay aqoonsan yihiin shaqo bixiyeyaasha.' 
    }
  },
];

const contactInfo = [
  {
    icon: Phone,
    title: { en: 'Phone', so: 'Telefoon' },
    value: '+252 61 234 5678',
    link: 'tel:+252612345678'
  },
  {
    icon: Mail,
    title: { en: 'Email', so: 'Iimeel' },
    value: 'info@kobciye.edu.so',
    link: 'mailto:info@kobciye.edu.so'
  },
  {
    icon: MapPin,
    title: { en: 'Address', so: 'Cinwaan' },
    value: { en: 'Mogadishu, Somalia', so: 'Muqdisho, Soomaaliya' },
    link: 'https://maps.google.com'
  },
  {
    icon: Clock,
    title: { en: 'Working Hours', so: 'Saacadaha Shaqada' },
    value: { en: 'Sat-Thu: 8AM - 6PM', so: 'Sab-Kha: 8AM - 6PM' },
    link: null
  },
];

export default function Contact() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      contactSchema.parse(formData);
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

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: language === 'en' ? 'Message Sent!' : 'Fariinta La Diray!',
      description: language === 'en' 
        ? 'Thank you for contacting us. We will get back to you soon.'
        : 'Waad ku mahadsan tahay inaad nala soo xiriirtay. Dhawaan ayaan kugu soo celin doonnaa.',
    });
    
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
          <div className="container-custom px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {language === 'en' ? 'Get in Touch' : 'Nala Soo Xiriir'}
              </h1>
              <p className="text-lg text-white/80">
                {language === 'en'
                  ? 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'
                  : 'Su\'aalo ma qabtaa? Waxaan jeclaan lahayn inaan kaa maqalno. Noo soo dir fariin waxaanan kugu jawaabi doonaa sida ugu dhakhsaha badan.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section-padding bg-background">
          <div className="container-custom px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">
                        {language === 'en' ? 'Send Us a Message' : 'Noo Soo Dir Fariin'}
                      </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.name')} *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={language === 'en' ? 'John Doe' : 'Magacaaga'}
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.email')} *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.phone')}
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+252 61 XXX XXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('contact.message')} *
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder={language === 'en' ? 'Your message here...' : 'Fariintaada halkan...'}
                          rows={5}
                          className={errors.message ? 'border-red-500' : ''}
                        />
                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-accent hover:bg-accent/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {language === 'en' ? 'Sending...' : 'Diraya...'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            {t('contact.send')}
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">
                  {language === 'en' ? 'Contact Information' : 'Macluumaadka Xiriirka'}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <info.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              {language === 'en' ? info.title.en : info.title.so}
                            </h3>
                            {info.link ? (
                              <a 
                                href={info.link}
                                className="text-muted-foreground hover:text-primary transition-colors"
                                target={info.link.startsWith('http') ? '_blank' : undefined}
                                rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                              >
                                {typeof info.value === 'string' ? info.value : (language === 'en' ? info.value.en : info.value.so)}
                              </a>
                            ) : (
                              <p className="text-muted-foreground">
                                {typeof info.value === 'string' ? info.value : (language === 'en' ? info.value.en : info.value.so)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Map Placeholder */}
                <Card className="overflow-hidden">
                  <div className="h-64 bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{language === 'en' ? 'Map Location' : 'Goobta Khariidadda'}</p>
                      <p className="text-sm">Mogadishu, Somalia</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-secondary/30">
          <div className="container-custom px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {language === 'en' ? 'Frequently Asked Questions' : 'Su\'aalaha Badanaa La Is Weydiiyo'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {language === 'en'
                  ? 'Find answers to common questions about our courses and enrollment process.'
                  : 'Hel jawaabaha su\'aalaha caadiga ah ee ku saabsan koorsadayada iyo habka is diiwaangelinta.'}
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AccordionItem value={`item-${index}`} className="bg-card rounded-lg border border-border px-6">
                      <AccordionTrigger className="text-left font-semibold hover:no-underline">
                        {language === 'en' ? faq.question.en : faq.question.so}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {language === 'en' ? faq.answer.en : faq.answer.so}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
