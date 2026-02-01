import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, Globe, GraduationCap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.courses', href: '/courses' },
  { key: 'nav.about', href: '/about' },
  { key: 'nav.contact', href: '/contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary dark:text-primary-foreground">
                Kobciye
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                International
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.href}
                className={`text-sm font-medium transition-colors relative group ${
                  location.pathname === link.href
                    ? 'text-primary dark:text-accent'
                    : 'text-foreground/80 hover:text-primary dark:hover:text-accent'
                }`}
              >
                {t(link.key)}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
                    location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="hidden sm:flex"
              title={language === 'en' ? 'Switch to Somali' : 'Switch to English'}
            >
              <Globe className="w-5 h-5" />
              <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Login/Dashboard Button */}
            {user ? (
              <Button 
                variant="ghost" 
                className="hidden sm:flex"
                onClick={() => navigate('/dashboard')}
              >
                <User className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Dashboard' : 'Dashboard'}
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                className="hidden sm:flex"
                onClick={() => navigate('/auth')}
              >
                {t('nav.login')}
              </Button>
            )}

            {/* CTA Button */}
            <Button 
              className="hidden md:flex bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => navigate(user ? '/courses' : '/auth')}
            >
              {t('nav.enroll')}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="container-custom px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.href}
                  className={`block py-2 text-lg font-medium ${
                    location.pathname === link.href
                      ? 'text-primary dark:text-accent'
                      : 'text-foreground/80'
                  }`}
                >
                  {t(link.key)}
                </Link>
              ))}
              
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex-1"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Somali' : 'English'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" /> Light
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" /> Dark
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Dashboard' : 'Dashboard'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    {t('nav.login')}
                  </Button>
                )}
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => navigate(user ? '/courses' : '/auth')}
                >
                  {t('nav.enroll')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
