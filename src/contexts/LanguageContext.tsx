import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'so';

interface Translations {
  [key: string]: {
    en: string;
    so: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', so: 'Guriga' },
  'nav.courses': { en: 'Courses', so: 'Koorsooyin' },
  'nav.about': { en: 'About', so: 'Ku Saabsan' },
  'nav.contact': { en: 'Contact', so: 'La Xiriir' },
  'nav.login': { en: 'Log In', so: 'Gal' },
  'nav.enroll': { en: 'Enroll Now', so: 'Hadda Is Diiwaan Geli' },

  // Hero Section
  'hero.title': { 
    en: 'Empower Your Future with World-Class Education', 
    so: 'Awood Mustaqbalkaaga Waxbarasho Caalamiga ah' 
  },
  'hero.subtitle': { 
    en: 'Join thousands of students achieving their dreams through our comprehensive courses in Health Sciences, Technology, and Languages.', 
    so: 'Ku biir kumannaan arday oo gaaraya riyooyinkooda iyagoo adeegsanaya koorsadayada dhammaystiran ee Sayniska Caafimaadka, Tignoolajiyada, iyo Luqadaha.' 
  },
  'hero.search': { en: 'Search for courses...', so: 'Raadi koorsooyin...' },
  'hero.browse': { en: 'Browse Courses', so: 'Daawado Koorsooyin' },
  'hero.learn_more': { en: 'Learn More', so: 'Wax Badan Baro' },
  'hero.joined': { en: 'Joined by', so: 'Ku biirtay' },
  'hero.students': { en: 'students worldwide', so: 'arday adduunka oo dhan' },

  // Stats
  'stats.students': { en: 'Students Enrolled', so: 'Arday La Diiwaangeliyay' },
  'stats.teachers': { en: 'Expert Teachers', so: 'Macalimiinta Khibrada' },
  'stats.courses': { en: 'Active Courses', so: 'Koorsooyin Firfircoon' },
  'stats.years': { en: 'Years Experience', so: 'Sanado Khibrad' },

  // Courses Section
  'courses.title': { en: 'Our Popular Courses', so: 'Koorsadayada Caanka Ah' },
  'courses.subtitle': { 
    en: 'Discover a wide range of courses designed to help you achieve your academic and professional goals.', 
    so: 'Hel koorsooyin kala duwan oo loo qaabeeyey inay kaa caawiyaan inaad gaaraysid hadafyadaada tacliimeed iyo xirfadeed.' 
  },
  'courses.explore': { en: 'Explore All Courses', so: 'Daawo Dhammaan Koorsoyinka' },
  'courses.view_details': { en: 'View Details', so: 'Faahfaahin Daawado' },
  'courses.duration': { en: 'Duration', so: 'Muddada' },
  'courses.level': { en: 'Level', so: 'Heerka' },

  // Categories
  'category.health': { en: 'Health Science', so: 'Sayniska Caafimaadka' },
  'category.technology': { en: 'Technology', so: 'Tignoolajiyada' },
  'category.language': { en: 'Language', so: 'Luqadaha' },
  'category.business': { en: 'Business', so: 'Ganacsi' },

  // Footer
  'footer.description': { 
    en: 'Empowering students with quality education and practical skills for a better future.', 
    so: 'Arday la siinayo awood waxbarasho tayo sare leh iyo xirfado la isla shaqeeyn karo mustaqbal wanaagsan.' 
  },
  'footer.quick_links': { en: 'Quick Links', so: 'Xiriiriyeyaasha Dhakhsaha' },
  'footer.contact_info': { en: 'Contact Info', so: 'Macluumaadka Xiriirka' },
  'footer.newsletter': { en: 'Newsletter', so: 'Wargeysyada' },
  'footer.newsletter_text': { 
    en: 'Subscribe to get updates on new courses and offers.', 
    so: 'Iska diiwaan geli si aad u hesho cusboonaysiinta koorsooyin cusub iyo heshiisyo.' 
  },
  'footer.subscribe': { en: 'Subscribe', so: 'Iska Diiwaan Geli' },
  'footer.email_placeholder': { en: 'Enter your email', so: 'Geli emailkaaga' },
  'footer.rights': { en: 'All rights reserved.', so: 'Dhammaan xuquuqda waa la xafidey.' },
  'footer.privacy': { en: 'Privacy Policy', so: 'Shuruucda Asturnaanta' },
  'footer.terms': { en: 'Terms of Service', so: 'Shuruudaha Adeegga' },

  // Testimonials
  'testimonials.title': { en: 'Student Success Stories', so: 'Sheekooyin Guuleed Arday' },
  'testimonials.subtitle': { 
    en: 'Hear from our students about their transformative learning experiences.', 
    so: 'Ka maqal ardayda khibradooda waxbarasho oo isbedel leh.' 
  },

  // About
  'about.title': { en: 'About Kobciye International', so: 'Ku Saabsan Kobciye International' },
  'about.mission': { en: 'Our Mission', so: 'Hawlgalkeena' },
  'about.vision': { en: 'Our Vision', so: 'Aragtideena' },

  // Contact
  'contact.title': { en: 'Get in Touch', so: 'Nala Xiriir' },
  'contact.name': { en: 'Full Name', so: 'Magaca Buuxa' },
  'contact.email': { en: 'Email Address', so: 'Cinwaanka Emailka' },
  'contact.phone': { en: 'Phone Number', so: 'Lambar Telefoon' },
  'contact.message': { en: 'Your Message', so: 'Fariintaada' },
  'contact.send': { en: 'Send Message', so: 'Dir Fariinta' },

  // Common
  'common.loading': { en: 'Loading...', so: 'Soo dejinaya...' },
  'common.error': { en: 'Something went wrong', so: 'Wax qalad ah ayaa dhacay' },
  'common.success': { en: 'Success!', so: 'Guul!' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('kobciye-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('kobciye-language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'so' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
