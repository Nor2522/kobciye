import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Star, Users, BookOpen, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Course, getCategoryColor } from '@/lib/courses';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (course: Course) => void;
}

export function CourseDetailModal({ course, isOpen, onClose, onEnroll }: CourseDetailModalProps) {
  const { language, t } = useLanguage();

  if (!course) return null;

  const title = language === 'en' ? course.title : (course.title_so || course.title);
  const description = language === 'en' ? course.description : (course.description_so || course.description);
  const category = language === 'en' ? course.category : (course.category_so || course.category);
  const level = language === 'en' ? course.level : (course.level_so || course.level);

  const learningOutcomes = [
    language === 'en' ? 'Master core concepts and fundamentals' : 'Baro fikradaha aasaasiga ah',
    language === 'en' ? 'Hands-on practical experience' : 'Khibrad la taaban karo',
    language === 'en' ? 'Industry-recognized certification' : 'Shahaado la aqoonsan yahay warshadaha',
    language === 'en' ? 'Job placement assistance' : 'Caawinta helitaanka shaqo',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl z-50 border border-border"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Course Image */}
            <div className="relative h-64 overflow-hidden rounded-t-2xl">
              <img
                src={course.image_url || '/placeholder.svg'}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className={`${getCategoryColor(course.category)} text-white border-0 mb-2`}>
                  {category}
                </Badge>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Instructor & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <img
                    src={course.instructor_avatar || '/placeholder.svg'}
                    alt={course.instructor_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{course.instructor_name}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{course.students_count.toLocaleString()} {language === 'en' ? 'students' : 'arday'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{course.rating}</span>
                </div>
                <Badge variant="secondary">{level}</Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {language === 'en' ? 'About This Course' : 'Ku Saabsan Koorsadan'}
                </h3>
                <p className="text-muted-foreground">{description}</p>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  {language === 'en' ? 'What You Will Learn' : 'Waxa Aad Baran Doontid'}
                </h3>
                <ul className="space-y-2">
                  {learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-muted-foreground">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & Enroll */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-accent" />
                  <span className="text-3xl font-bold text-foreground">${course.price}</span>
                  {course.is_online && (
                    <Badge variant="outline" className="ml-2">
                      {language === 'en' ? 'Online' : 'Onlayn'}
                    </Badge>
                  )}
                </div>
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => onEnroll(course)}
                >
                  {t('nav.enroll')}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
