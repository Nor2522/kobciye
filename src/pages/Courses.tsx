import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Clock, User, Star, Play, Lock, CreditCard } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Course, getCategoryColor } from '@/lib/courses';
import { CourseDetailModal } from '@/components/courses/CourseDetailModal';
import { EnrollmentModal } from '@/components/dashboard/EnrollmentModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { en: 'All', so: 'Dhammaan' },
  { en: 'Health Science', so: 'Sayniska Caafimaadka' },
  { en: 'Technology', so: 'Tignoolajiyada' },
  { en: 'Language', so: 'Luqadaha' },
  { en: 'Business', so: 'Ganacsi' },
];

export default function Courses() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEnrollments() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setEnrolledCourseIds(new Set(data?.map(e => e.course_id) || []));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  }

  const filteredCourses = courses.filter(course => {
    const title = language === 'en' ? course.title : (course.title_so || course.title);
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    fetchEnrollments(); // Refresh enrollments
    toast({
      title: language === 'en' ? 'Success!' : 'Guul!',
      description: language === 'en' 
        ? 'You have been enrolled. Check your dashboard!'
        : 'Waad is diiwaangelisay. Eeg dashboard-kaaga!',
    });
  };

  const isEnrolled = (courseId: string) => enrolledCourseIds.has(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header */}
        <section className="bg-gradient-to-br from-kobciye-dark to-kobciye-slate dark:from-background dark:to-card text-white py-16">
          <div className="container-custom px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {language === 'en' ? 'Explore Our Courses' : 'Daawato Koorsadayada'}
              </h1>
              <p className="text-lg text-white/80">
                {language === 'en' 
                  ? 'Find the perfect course to advance your career and achieve your goals.'
                  : 'Hel koorso ku habboon si aad u horumariso shaqadaada oo aad u gaarto hadafyadaada.'}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-20 z-30 bg-background/95 backdrop-blur border-b border-border py-4">
          <div className="container-custom px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={language === 'en' ? 'Search courses...' : 'Raadi koorsooyin...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.en}
                    variant={selectedCategory === cat.en ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.en)}
                    className={selectedCategory === cat.en ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}
                  >
                    {language === 'en' ? cat.en : cat.so}
                  </Button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="section-padding">
          <div className="container-custom px-4">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  {language === 'en' ? 'No courses found.' : 'Lama helin koorsooyin.'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CourseCard 
                      course={course} 
                      viewMode={viewMode}
                      isEnrolled={isEnrolled(course.id)}
                      onViewDetails={() => handleViewDetails(course)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <CourseDetailModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnroll={handleEnroll}
        isEnrolled={selectedCourse ? isEnrolled(selectedCourse.id) : false}
      />

      <EnrollmentModal
        course={selectedCourse}
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        onSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  viewMode: 'grid' | 'list';
  isEnrolled: boolean;
  onViewDetails: () => void;
}

function CourseCard({ course, viewMode, isEnrolled, onViewDetails }: CourseCardProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const title = language === 'en' ? course.title : (course.title_so || course.title);
  const category = language === 'en' ? course.category : (course.category_so || course.category);
  const level = language === 'en' ? course.level : (course.level_so || course.level);

  const handleContinue = () => {
    navigate(`/learn/${course.id}`);
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow course-card">
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-48 h-32 sm:h-auto">
            <img
              src={course.image_url || '/placeholder.svg'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <Badge className="bg-accent text-accent-foreground border-0 absolute top-2 left-2">
              {category}
            </Badge>
            {isEnrolled && (
              <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
                <Badge className="bg-accent text-accent-foreground">
                  {language === 'en' ? 'Enrolled' : 'Is Diiwaangashan'}
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 text-card-foreground">{title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {course.instructor_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {course.rating}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              {isEnrolled ? (
                <Badge variant="outline" className="text-accent border-accent">
                  <Play className="w-3 h-3 mr-1" />
                  {language === 'en' ? 'Continue' : 'Sii Wad'}
                </Badge>
              ) : (
                <div className="flex items-center gap-1 text-accent font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>{course.price} credits</span>
                </div>
              )}
              <Button onClick={isEnrolled ? handleContinue : onViewDetails} variant="outline" className="gap-2">
                {isEnrolled ? (
                  <>
                    <Play className="w-4 h-4" />
                    {language === 'en' ? 'Continue' : 'Sii Wad'}
                  </>
                ) : (
                  t('courses.view_details')
                )}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
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

        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-accent text-accent-foreground gap-1">
              <Play className="w-3 h-3" />
              {language === 'en' ? 'Enrolled' : 'Is Diiwaangashan'}
            </Badge>
          </div>
        )}

        {/* Lock icon for non-enrolled */}
        {!isEnrolled && course.price && course.price > 0 && (
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
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {course.duration}
          </span>
          <Badge variant="secondary" className="text-xs">{level}</Badge>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          {isEnrolled ? (
            <Badge variant="outline" className="text-accent border-accent bg-accent/10">
              {language === 'en' ? 'Access Granted' : 'Waa Laguu Ogolaaday'}
            </Badge>
          ) : (
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-accent" />
              <span className="text-lg font-bold text-foreground">{course.price}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
          )}
          
          <Button 
            variant={isEnrolled ? "default" : "ghost"}
            size="sm"
            className={isEnrolled ? "bg-accent hover:bg-accent/90 text-accent-foreground gap-1" : "text-accent hover:text-accent/80 p-0 h-auto"}
            onClick={isEnrolled ? handleContinue : onViewDetails}
          >
            {isEnrolled ? (
              <>
                <Play className="w-3.5 h-3.5" />
                {language === 'en' ? 'Continue' : 'Sii Wad'}
              </>
            ) : (
              t('courses.view_details')
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
