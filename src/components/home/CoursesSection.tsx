import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Clock, User, Star, CreditCard, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course, getCategoryColor } from '@/lib/courses';
import { CourseDetailModal } from '@/components/courses/CourseDetailModal';
import { EnrollmentModal } from '@/components/dashboard/EnrollmentModal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

function CourseCard({ 
  course, 
  index, 
  onViewDetails 
}: { 
  course: Course; 
  index: number; 
  onViewDetails: () => void;
}) {
  const { language, t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const title = language === 'en' ? course.title : (course.title_so || course.title);
  const category = language === 'en' ? course.category : (course.category_so || course.category);
  const level = language === 'en' ? course.level : (course.level_so || course.level);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden course-card h-full flex flex-col">
        <div className="relative overflow-hidden">
          <img
            src={course.image_url || '/placeholder.svg'}
            alt={title}
            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category badge */}
          <Badge className="bg-accent text-accent-foreground border-0 absolute top-3 left-3">
            {category}
          </Badge>
          
          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-foreground">{course.rating}</span>
          </div>

          {/* Lock icon */}
          {course.price && course.price > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-background/90 backdrop-blur-sm p-1.5 rounded-full">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-card-foreground line-clamp-2 group-hover:text-accent transition-colors mb-2">
            {title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <img 
              src={course.instructor_avatar || '/placeholder.svg'} 
              alt={course.instructor_name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="truncate">{course.instructor_name}</span>
          </div>

          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {level}
            </Badge>
          </div>

          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-accent" />
              <span className="text-lg font-bold text-foreground">{course.price}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-accent hover:text-accent/80 p-0 h-auto"
              onClick={onViewDetails}
            >
              {t('courses.view_details')}
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CoursesSection() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('students_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleEnroll = (course: Course) => {
    setIsModalOpen(false);
    if (!user) {
      navigate('/auth');
    } else {
      setSelectedCourse(course);
      setIsEnrollmentModalOpen(true);
    }
  };

  const handleEnrollmentSuccess = () => {
    toast({
      title: language === 'en' ? 'Success!' : 'Guul!',
      description: language === 'en' 
        ? 'You have been enrolled. Check your dashboard!'
        : 'Waad is diiwaangelisay. Eeg dashboard-kaaga!',
    });
  };

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('courses.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('courses.subtitle')}
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {courses.map((course, index) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              index={index}
              onViewDetails={() => handleViewDetails(course)}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button 
            size="lg" 
            className="group bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => navigate('/courses')}
          >
            {t('courses.explore')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      <CourseDetailModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnroll={handleEnroll}
      />

      <EnrollmentModal
        course={selectedCourse}
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        onSuccess={handleEnrollmentSuccess}
      />
    </section>
  );
}
