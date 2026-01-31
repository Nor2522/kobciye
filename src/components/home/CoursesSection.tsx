import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Clock, User, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Course {
  id: string;
  title: string;
  titleSo: string;
  category: string;
  categorySo: string;
  categoryColor: string;
  instructor: string;
  duration: string;
  level: string;
  levelSo: string;
  rating: number;
  students: number;
  image: string;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Nursing & Healthcare Fundamentals',
    titleSo: 'Aasaaska Kalkaalinta & Daryeelka Caafimaadka',
    category: 'Health Science',
    categorySo: 'Sayniska Caafimaadka',
    categoryColor: 'bg-red-500',
    instructor: 'Dr. Amina Hassan',
    duration: '6 months',
    level: 'Beginner',
    levelSo: 'Bilowga',
    rating: 4.9,
    students: 450,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'Full-Stack Web Development',
    titleSo: 'Horumarinta Shabakadda Full-Stack',
    category: 'Technology',
    categorySo: 'Tignoolajiyada',
    categoryColor: 'bg-blue-500',
    instructor: 'Mohamed Ali',
    duration: '8 months',
    level: 'Intermediate',
    levelSo: 'Dhexe',
    rating: 4.8,
    students: 380,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'English Language Proficiency',
    titleSo: 'Xirfadda Luuqadda Ingiriisiga',
    category: 'Language',
    categorySo: 'Luqadaha',
    categoryColor: 'bg-green-500',
    instructor: 'Sarah Johnson',
    duration: '4 months',
    level: 'All Levels',
    levelSo: 'Heerarka Dhan',
    rating: 4.7,
    students: 620,
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    title: 'Medical Laboratory Technology',
    titleSo: 'Tignoolajiyada Sheybaarka Caafimaadka',
    category: 'Health Science',
    categorySo: 'Sayniska Caafimaadka',
    categoryColor: 'bg-red-500',
    instructor: 'Dr. Fatima Omar',
    duration: '12 months',
    level: 'Advanced',
    levelSo: 'Sare',
    rating: 4.9,
    students: 280,
    image: 'https://images.unsplash.com/photo-1579165466949-3180a3d056d5?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    title: 'Digital Marketing & SEO',
    titleSo: 'Suuq-geynta Dhijitaalka & SEO',
    category: 'Business',
    categorySo: 'Ganacsi',
    categoryColor: 'bg-purple-500',
    instructor: 'Ahmed Ibrahim',
    duration: '3 months',
    level: 'Beginner',
    levelSo: 'Bilowga',
    rating: 4.6,
    students: 520,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    id: '6',
    title: 'Pharmacy Assistant Training',
    titleSo: 'Tababarka Caawiyaha Farmashiyaha',
    category: 'Health Science',
    categorySo: 'Sayniska Caafimaadka',
    categoryColor: 'bg-red-500',
    instructor: 'Dr. Hassan Yusuf',
    duration: '10 months',
    level: 'Intermediate',
    levelSo: 'Dhexe',
    rating: 4.8,
    students: 340,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop',
  },
];

function CourseCard({ course, index }: { course: Course; index: number }) {
  const { language, t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card">
        <div className="relative overflow-hidden">
          <img
            src={course.image}
            alt={language === 'en' ? course.title : course.titleSo}
            className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <Badge className={`${course.categoryColor} text-white border-0`}>
              {language === 'en' ? course.category : course.categorySo}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-white font-medium">{course.rating}</span>
          </div>
        </div>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-lg font-bold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {language === 'en' ? course.title : course.titleSo}
          </h3>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{course.instructor}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <Badge variant="secondary">
              {language === 'en' ? course.level : course.levelSo}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {course.students.toLocaleString()} students
            </span>
            <Button variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
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
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline" className="group">
            {t('courses.explore')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
