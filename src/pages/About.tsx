import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Target, Eye, Award, Users, BookOpen, Globe, Heart } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const team = [
  {
    name: 'Dr. Abdikarim Mohamed',
    role: { en: 'Founder & CEO', so: 'Aasaasaha & CEO' },
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
    bio: { 
      en: '20+ years in education leadership', 
      so: '20+ sano oo hogaaminta waxbarashada' 
    }
  },
  {
    name: 'Dr. Fatima Ali',
    role: { en: 'Academic Director', so: 'Agaasimaha Waxbarashada' },
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces',
    bio: { 
      en: 'PhD in Health Sciences Education', 
      so: 'PhD Waxbarashada Sayniska Caafimaadka' 
    }
  },
  {
    name: 'Ahmed Hassan',
    role: { en: 'Technology Director', so: 'Agaasimaha Tignoolajiyada' },
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces',
    bio: { 
      en: 'Former Tech Lead at major companies', 
      so: 'Hoggaamiyaha Tignoolajiyada hore shirkado waaweyn' 
    }
  },
  {
    name: 'Halima Osman',
    role: { en: 'Student Affairs', so: 'Arrimaha Ardayda' },
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=faces',
    bio: { 
      en: '15+ years in student services', 
      so: '15+ sano oo adeegyada ardayda' 
    }
  },
];

const values = [
  {
    icon: GraduationCap,
    title: { en: 'Excellence', so: 'Waxtarnimo' },
    description: { 
      en: 'Committed to the highest standards of education', 
      so: 'Ku deeqan heerarka ugu sarreeya ee waxbarashada' 
    }
  },
  {
    icon: Heart,
    title: { en: 'Integrity', so: 'Daacadnimo' },
    description: { 
      en: 'Operating with honesty and transparency', 
      so: 'Ka shaqayn run iyo caddaalad' 
    }
  },
  {
    icon: Users,
    title: { en: 'Community', so: 'Bulsho' },
    description: { 
      en: 'Building strong educational community', 
      so: 'Dhisidda bulsho waxbarasho oo adag' 
    }
  },
  {
    icon: Globe,
    title: { en: 'Innovation', so: 'Hal-abuur' },
    description: { 
      en: 'Embracing modern teaching methods', 
      so: 'Qaadashada habab casri ah oo waxbarid' 
    }
  },
];

export default function About() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary to-primary/80 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
          </div>
          <div className="container-custom px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                {language === 'en' 
                  ? 'About Kobciye International' 
                  : 'Ku Saabsan Kobciye International'}
              </h1>
              <p className="text-xl text-white/80">
                {language === 'en'
                  ? 'Empowering students since 2014 with quality education and practical skills for a better future.'
                  : 'Arday siinaya awood tan iyo 2014 waxbarasho tayo sare leh iyo xirfado wax ku ool ah mustaqbal wanaagsan.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding bg-background">
          <div className="container-custom px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-l-4 border-l-primary">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">
                        {language === 'en' ? 'Our Mission' : 'Howlgalkeena'}
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      {language === 'en'
                        ? 'To provide accessible, high-quality education that empowers individuals with the knowledge and skills needed to succeed in their careers and contribute positively to society.'
                        : 'In la bixiyo waxbarasho tayo sare leh oo la gaari karo oo siisa shakhsiyaadka aqoonta iyo xirfadaha loo baahan yahay si ay ugu guulaystaan shaqadooda oo ay si togan ugu tabarucaan bulshada.'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-l-4 border-l-accent">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-accent" />
                      </div>
                      <h2 className="text-2xl font-bold">
                        {language === 'en' ? 'Our Vision' : 'Aragtideena'}
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      {language === 'en'
                        ? 'To become the leading educational institution in the Horn of Africa, recognized for excellence in education, innovation, and producing graduates who drive positive change.'
                        : 'In noqono hay\'adda waxbarashada ee ugu horeysa Geeska Afrika, lagu aqoonsan tahay waxtarnaanshaha waxbarashada, hal-abuurka, iyo soo saarista ardayda wax ka bedeli kara.'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-primary text-white">
          <div className="container-custom px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '5,000+', label: language === 'en' ? 'Students Enrolled' : 'Arday La Diiwaangeliyay' },
                { value: '50+', label: language === 'en' ? 'Expert Teachers' : 'Macalimiinta Khibrada' },
                { value: '20+', label: language === 'en' ? 'Programs Offered' : 'Barnaamijyo La Bixiyo' },
                { value: '10+', label: language === 'en' ? 'Years Experience' : 'Sanado Khibrad' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-secondary/30">
          <div className="container-custom px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {language === 'en' ? 'Our Core Values' : 'Qiyamkeena Aasaasiga'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {language === 'en'
                  ? 'These principles guide everything we do at Kobciye International.'
                  : 'Mabaadii\'dan ayaa haga wax walba aan ku samayno Kobciye International.'}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <value.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {language === 'en' ? value.title.en : value.title.so}
                      </h3>
                      <p className="text-muted-foreground">
                        {language === 'en' ? value.description.en : value.description.so}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding bg-background">
          <div className="container-custom px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {language === 'en' ? 'Meet Our Leadership' : 'La Kulan Hogaamiyeyaasheena'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {language === 'en'
                  ? 'Dedicated professionals committed to your educational success.'
                  : 'Xirfadleyaal u heellan guusha waxbarashadaada.'}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
                    <div className="relative overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-5 text-center">
                      <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                      <p className="text-accent font-medium mb-2">
                        {language === 'en' ? member.role.en : member.role.so}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? member.bio.en : member.bio.so}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* History */}
        <section className="section-padding bg-secondary/30">
          <div className="container-custom px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  {language === 'en' ? 'Our Story' : 'Sheekooyinkeena'}
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    {language === 'en'
                      ? 'Founded in 2014, Kobciye International College began with a simple mission: to provide quality education accessible to all Somalis.'
                      : 'La aasaasay 2014, Kulliyadda Kobciye International waxay ku bilowday hawl fudud: in la bixiyo waxbarasho tayo sare leh oo u furan dhammaan Soomaalida.'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Over the years, we have grown from a small training center to a comprehensive educational institution offering programs in Health Sciences, Technology, Business, and Languages.'
                      : 'Sanadaha la soo dhaafay, waxaan ka soo kobcinay xarun tababar yar ilaa hay\'ad waxbarasho dhammaystiran oo bixisa barnaamijyo Sayniska Caafimaadka, Tignoolajiyada, Ganacsi, iyo Luqadaha.'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Today, we proudly serve over 5,000 students and continue to expand our reach through both on-campus and online learning options.'
                      : 'Maanta, waxaan si sharaf leh u adeegnaa in ka badan 5,000 arday waxaanan sii wadaynaa inaan ballaarino gacanteena ayna ka dhan tahay waxbarashada kampaska iyo onlaynka.'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                  alt="Campus"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-accent text-white p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold">10+</div>
                  <div className="text-sm">
                    {language === 'en' ? 'Years of Excellence' : 'Sanado Waxtarnimo'}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
