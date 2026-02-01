import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Calendar, Clock, Award, TrendingUp, 
  User, Settings, LogOut, ChevronRight, Play, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';

interface Enrollment {
  id: string;
  progress: number;
  status: string;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    title_so: string | null;
    image_url: string | null;
    instructor_name: string;
    duration: string | null;
    category: string;
  };
}

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export default function Dashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  async function fetchUserData() {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user!.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch enrollments with course data
      const { data: enrollmentData, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          progress,
          status,
          enrolled_at,
          course:courses(
            id,
            title,
            title_so,
            image_url,
            instructor_name,
            duration,
            category
          )
        `)
        .eq('user_id', user!.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to handle the nested course object
      const typedEnrollments = (enrollmentData || []).map(e => ({
        ...e,
        course: e.course as unknown as Enrollment['course']
      }));
      
      setEnrollments(typedEnrollments);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: language === 'en' ? 'Signed Out' : 'Baxday',
      description: language === 'en' ? 'You have been signed out successfully.' : 'Si guul leh ayaad u baxday.',
    });
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Student';
  const initials = displayName.slice(0, 2).toUpperCase();
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container-custom">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {language === 'en' ? 'Welcome back,' : 'Ku soo dhawoow,'} {displayName}!
                  </h1>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Continue your learning journey' : 'Sii wado safarka waxbarashadaada'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Sign Out' : 'Ka Bax'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Enrolled Courses' : 'Koorsooyin La Qoray'}
                  </p>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'In Progress' : 'Socda'}
                  </p>
                  <p className="text-2xl font-bold">{inProgressCourses}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Completed' : 'La Dhammeeyey'}
                  </p>
                  <p className="text-2xl font-bold">{completedCourses}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Appointments' : 'Ballamo'}
                  </p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* My Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    {language === 'en' ? 'My Courses' : 'Koorsadayda'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                    {language === 'en' ? 'Browse More' : 'Daawado Badan'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {enrollments.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {language === 'en' ? 'No courses yet' : 'Weli koorso ma jirto'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {language === 'en' 
                          ? 'Start your learning journey by enrolling in a course.'
                          : 'Bilow safarka waxbarashadaada adoo is diiwaangelinaya koorso.'}
                      </p>
                      <Button onClick={() => navigate('/courses')} className="bg-accent hover:bg-accent/90">
                        {language === 'en' ? 'Explore Courses' : 'Daawado Koorsooyin'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                        >
                          <img
                            src={enrollment.course.image_url || '/placeholder.svg'}
                            alt={enrollment.course.title}
                            className="w-20 h-14 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {language === 'en' ? enrollment.course.title : (enrollment.course.title_so || enrollment.course.title)}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{enrollment.course.instructor_name}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{enrollment.course.duration}</span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">
                                  {language === 'en' ? 'Progress' : 'Horumarka'}
                                </span>
                                <span className="font-medium">{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0">
                            <Play className="w-4 h-4 mr-1" />
                            {language === 'en' ? 'Continue' : 'Sii Wado'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions & Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'en' ? 'Quick Actions' : 'Ficilada Degdegga'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/courses')}>
                    <BookOpen className="w-4 h-4 mr-3" />
                    {language === 'en' ? 'Browse Courses' : 'Daawado Koorsooyin'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-3" />
                    {language === 'en' ? 'Book Appointment' : 'Ballanse'}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-3" />
                    {language === 'en' ? 'View Certificates' : 'Eeg Shahaadooyinka'}
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'en' ? 'Your Profile' : 'Profile-kaaga'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                    <Badge variant="secondary">
                      {language === 'en' ? 'Student' : 'Arday'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
