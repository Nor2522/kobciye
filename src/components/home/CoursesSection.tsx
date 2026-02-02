import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Clock, User, Star } from 'lucide-react';
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
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card h-full">
        <div className="relative overflow-hidden">
          <img
            src={course.image_url || '/placeholder.svg'}
            alt={title}
            className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <Badge className={`${getCategoryColor(course.category)} text-white border-0`}>
              {category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-white font-medium">{course.rating}</span>
          </div>
        </div>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-lg font-bold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{course.instructor_name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <Badge variant="secondary">
              {level}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {course.students_count.toLocaleString()} {language === 'en' ? 'students' : 'arday'}
            </span>
            <Button 
              variant="link" 
              className="p-0 h-auto text-accent hover:text-accent/80"
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
            variant="outline" 
            className="group"
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
