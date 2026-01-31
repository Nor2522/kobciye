import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  roleSo: string;
  content: string;
  contentSo: string;
  image: string;
  rating: number;
  video?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Fadumo Ahmed',
    role: 'Healthcare Graduate',
    roleSo: 'Qalin-jabiyaha Daryeelka Caafimaadka',
    content: 'Kobciye International transformed my career. The nursing program gave me practical skills that helped me land my dream job at Mogadishu General Hospital.',
    contentSo: 'Kobciye International waxay beddeshay xirfaddayda. Barnaamijka kalkaaliyaha wuxuu i siiyay xirfado la shaqayn karo oo naga caawiyay inaan helo shaqadayda riyada ah Isbitaalka Guud ee Muqdisho.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
    rating: 5,
    video: true,
  },
  {
    id: '2',
    name: 'Abdi Mohamed',
    role: 'Software Developer',
    roleSo: 'Horumariyaha Software-ka',
    content: 'The web development course was comprehensive and up-to-date. I went from knowing nothing about coding to building full-stack applications in just 8 months.',
    contentSo: 'Koorsada horumarinta shabakadda waxay ahayd mid dhamaystiran oo casri ah. Waxaan ka tegay inaan waxba ka aqoon koodhka ilaa dhisidda codsiyada full-stack 8 bilood gudahood.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    rating: 5,
  },
  {
    id: '3',
    name: 'Halima Osman',
    role: 'Laboratory Technician',
    roleSo: 'Farsamada Sheybaarka',
    content: 'The instructors at Kobciye are exceptional. They provided hands-on training that prepared me well for real-world laboratory work.',
    contentSo: 'Macalimiinta Kobciye waa kuwo aan caadi ahayn. Waxay bixiyeen tababar gacanta ku jira oo si wanaagsan iigu diyaariyay shaqada sheybaarka dhabta ah.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    rating: 5,
    video: true,
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const { language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <Card className="h-full bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6 space-y-4">
          <Quote className="w-10 h-10 text-accent/30" />
          
          <p className="text-muted-foreground leading-relaxed">
            "{language === 'en' ? testimonial.content : testimonial.contentSo}"
          </p>

          <div className="flex items-center gap-1">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <div className="relative">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {testimonial.video && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? testimonial.role : testimonial.roleSo}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="section-padding bg-secondary/50 dark:bg-secondary/20">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
