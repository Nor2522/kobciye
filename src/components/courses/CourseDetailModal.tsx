import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Star, Users, BookOpen, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Course, getCategoryColor } from '@/lib/courses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (course: Course) => void;
}

export function CourseDetailModal({ course, isOpen, onClose, onEnroll }: CourseDetailModalProps) {
  const { language, t } = useLanguage();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Course Image */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
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
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white text-left">
                {title}
              </DialogTitle>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Instructor & Stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <img
                src={course.instructor_avatar || '/placeholder.svg'}
                alt={course.instructor_name}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
              <span className="font-medium">{course.instructor_name}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{course.students_count.toLocaleString()} {language === 'en' ? 'students' : 'arday'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <Badge variant="secondary" className="text-xs">{level}</Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {language === 'en' ? 'About This Course' : 'Ku Saabsan Koorsadan'}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
          </div>

          {/* Learning Outcomes */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              {language === 'en' ? 'What You Will Learn' : 'Waxa Aad Baran Doontid'}
            </h3>
            <ul className="space-y-2">
              {learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  <span className="text-muted-foreground">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price & Enroll */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground">${course.price}</span>
              {course.is_online && (
                <Badge variant="outline" className="ml-2">
                  {language === 'en' ? 'Online' : 'Onlayn'}
                </Badge>
              )}
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => onEnroll(course)}
            >
              {t('nav.enroll')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
