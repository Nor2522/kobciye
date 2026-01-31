import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

const quickLinks = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.courses', href: '/courses' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.contact', href: '/contact' },
];

const courseLinks = [
  { en: 'Health Sciences', so: 'Sayniska Caafimaadka', href: '/courses?category=health' },
  { en: 'Technology', so: 'Tignoolajiyada', href: '/courses?category=technology' },
  { en: 'Languages', so: 'Luqadaha', href: '/courses?category=language' },
  { en: 'Business', so: 'Ganacsi', href: '/courses?category=business' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="container-custom section-padding pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold">Kobciye</span>
                <span className="block text-sm text-white/70 -mt-1">International</span>
              </div>
            </Link>
            <p className="text-white/70 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.quick_links')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('nav.courses')}</h3>
            <ul className="space-y-3">
              {courseLinks.map((link) => (
                <li key={link.en}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {language === 'en' ? link.en : link.so}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.contact_info')}</h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Mogadishu, Somalia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-white/70">+252 61 XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-white/70">info@kobciye.edu</span>
              </li>
            </ul>

            <h4 className="font-semibold mb-3">{t('footer.newsletter')}</h4>
            <p className="text-white/70 text-sm mb-4">{t('footer.newsletter_text')}</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t('footer.email_placeholder')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-accent"
              />
              <Button className="bg-accent hover:bg-accent/90 text-white px-4">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Kobciye International. {t('footer.rights')}
            </p>
            <div className="flex gap-6 text-sm text-white/60">
              <Link to="/privacy" className="hover:text-white transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
