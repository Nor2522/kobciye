import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Clock, User, Star } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

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
    if (!user) {
      navigate('/auth');
    } else {
      navigate(`/checkout/${course.id}`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
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
                    className={selectedCategory === cat.en ? 'bg-accent hover:bg-accent/90' : ''}
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
      />
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  viewMode: 'grid' | 'list';
  onViewDetails: () => void;
}

function CourseCard({ course, viewMode, onViewDetails }: CourseCardProps) {
  const { language, t } = useLanguage();
  const title = language === 'en' ? course.title : (course.title_so || course.title);
  const category = language === 'en' ? course.category : (course.category_so || course.category);
  const level = language === 'en' ? course.level : (course.level_so || course.level);

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-48 h-32 sm:h-auto">
            <img
              src={course.image_url || '/placeholder.svg'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <Badge className={`${getCategoryColor(course.category)} text-white border-0 absolute top-2 left-2`}>
              {category}
            </Badge>
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
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
              <span className="text-xl font-bold text-accent">${course.price}</span>
              <Button onClick={onViewDetails} variant="outline">
                {t('courses.view_details')}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card h-full">
      <div className="relative overflow-hidden">
        <img
          src={course.image_url || '/placeholder.svg'}
          alt={title}
          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <Badge className={`${getCategoryColor(course.category)} text-white border-0 absolute top-4 left-4`}>
          {category}
        </Badge>
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-white font-medium">{course.rating}</span>
        </div>
        {!course.is_online && (
          <Badge className="absolute bottom-4 left-4 bg-orange-500 text-white border-0">
            {language === 'en' ? 'On Campus' : 'Kampaska'}
          </Badge>
        )}
      </div>
      <CardContent className="p-5 space-y-4">
        <h3 className="text-lg font-bold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>{course.instructor_name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {course.duration}
          </span>
          <Badge variant="secondary">{level}</Badge>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xl font-bold text-accent">${course.price}</span>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary hover:text-primary/80"
            onClick={onViewDetails}
          >
            {t('courses.view_details')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
