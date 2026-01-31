import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  { en: 'Expert instructors with years of experience', so: 'Macalimiin khibrad sanado badan leh' },
  { en: 'Hands-on practical training', so: 'Tababar gacanta ku jira' },
  { en: 'Industry-recognized certificates', so: 'Shahaadooyin ay warshadaha aqoonsadeen' },
  { en: 'Flexible learning schedules', so: 'Jadwalka waxbarashada ee dabacsanaan leh' },
  { en: 'Career guidance and placement support', so: 'Hagitaanka xirfadeed iyo taageerada shaqaalaysashada' },
];

export function CTASection() {
  const { language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="section-padding bg-gradient-to-br from-primary via-primary to-kobciye-blue-light overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              {language === 'en' 
                ? 'Ready to Start Your Learning Journey?' 
                : 'Ma Diyaar u Tahay Inaad Bilowdo Safarka Waxbarashadaada?'}
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              {language === 'en'
                ? 'Join thousands of successful graduates who have transformed their careers through our world-class education programs.'
                : 'Ku biir kumannaan qalin-jabiyayaal guul gaaray oo beddeley xirfadooda iyagoo adeegsanaya barnaamijyadeena waxbarasho ee caalamiga ah.'}
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-white/90">
                    {language === 'en' ? feature.en : feature.so}
                  </span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                {language === 'en' ? 'Enroll Now' : 'Hadda Is Diiwaan Geli'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                {language === 'en' ? 'Schedule Consultation' : 'Ballan La Xirir'}
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 rounded-2xl bg-white/10">
                  <p className="text-4xl font-bold text-white mb-2">95%</p>
                  <p className="text-white/70 text-sm">
                    {language === 'en' ? 'Employment Rate' : 'Heerka Shaqaynta'}
                  </p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-white/10">
                  <p className="text-4xl font-bold text-white mb-2">4.9</p>
                  <p className="text-white/70 text-sm">
                    {language === 'en' ? 'Student Rating' : 'Qiimaha Ardayda'}
                  </p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-white/10">
                  <p className="text-4xl font-bold text-white mb-2">24/7</p>
                  <p className="text-white/70 text-sm">
                    {language === 'en' ? 'Learning Access' : 'Marin Waxbarasho'}
                  </p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-white/10">
                  <p className="text-4xl font-bold text-white mb-2">Free</p>
                  <p className="text-white/70 text-sm">
                    {language === 'en' ? 'Career Support' : 'Taageero Xirfad'}
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-accent/20 border border-accent/30">
                <p className="text-center text-white font-medium">
                  🎓 {language === 'en' 
                    ? 'Next enrollment opens February 2026!' 
                    : 'Diiwaangelinta xigta waxay furmeysaa Febraayo 2026!'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
