import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Calendar, Clock, Award, TrendingUp, 
  User, Settings, LogOut, ChevronRight, Play, Bell, Wallet, CreditCard,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import { NotificationsModal } from '@/components/dashboard/NotificationsModal';
import { SettingsModal } from '@/components/dashboard/SettingsModal';
import { AppointmentModal } from '@/components/dashboard/AppointmentModal';
import { CertificatesModal } from '@/components/dashboard/CertificatesModal';

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
  credits: number;
}

export default function Dashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, isAdmin, isSuperAdmin } = useUserRole();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);

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
        .select('full_name, avatar_url, credits')
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

      // Fetch appointments count
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      
      setAppointmentsCount(appointmentCount || 0);

      // Fetch unread notifications count
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);
      
      setUnreadNotifications(notifCount || 0);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading your dashboard...' : 'Waxaa la soo gelayaa dashboard-kaaga...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Student';
  const initials = displayName.slice(0, 2).toUpperCase();
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const userCredits = profile?.credits || 0;

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'super_admin': return 'bg-red-500 text-white';
      case 'admin': return 'bg-purple-500 text-white';
      case 'instructor': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'super_admin': return language === 'en' ? 'Super Admin' : 'Maamulaha Sare';
      case 'admin': return language === 'en' ? 'Admin' : 'Maamule';
      case 'instructor': return language === 'en' ? 'Instructor' : 'Macalin';
      default: return language === 'en' ? 'Student' : 'Arday';
    }
  };

  return (
    <>
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container-custom max-w-7xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 via-accent/5 to-secondary">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Profile Info */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-background shadow-xl">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                          {displayName}
                        </h1>
                        <Badge className={getRoleBadgeColor()}>
                          {getRoleLabel()}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' 
                          ? `Member since ${new Date(user.created_at || '').toLocaleDateString()}`
                          : `Xubin tan iyo ${new Date(user.created_at || '').toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 relative"
                      onClick={() => setShowNotifications(true)}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                      )}
                      <span className="hidden sm:inline">
                        {language === 'en' ? 'Notifications' : 'Ogeysiisyo'}
                      </span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowSettings(true)}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {language === 'en' ? 'Settings' : 'Qaabeynta'}
                      </span>
                    </Button>
                    {isAdmin() && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                        onClick={() => navigate('/admin')}
                      >
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {language === 'en' ? 'Admin Panel' : 'Maamulka'}
                        </span>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {language === 'en' ? 'Sign Out' : 'Ka Bax'}
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            {/* Credits Card - Highlighted */}
            <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground border-0 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Wallet className="w-8 h-8 opacity-80" />
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs h-7"
                    onClick={() => navigate('/buy-credits')}
                  >
                    {language === 'en' ? 'Buy' : 'Iibso'}
                  </Button>
                </div>
                <p className="text-3xl font-bold">{userCredits}</p>
                <p className="text-sm opacity-80">
                  {language === 'en' ? 'Available Credits' : 'Credit-ka Jira'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Enrolled' : 'Koorsooyin'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCourses}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'In Progress' : 'Socda'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCourses}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Completed' : 'Dhammaad'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appointmentsCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Appointments' : 'Ballamo'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* My Courses - Takes 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <CardTitle>
                        {language === 'en' ? 'My Courses' : 'Koorsadayda'}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                      {language === 'en' ? 'Browse All' : 'Eeg Dhammaan'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <CardDescription>
                    {language === 'en' 
                      ? 'Continue learning where you left off'
                      : 'Sii wado waxbarashadaada'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollments.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {language === 'en' ? 'No courses yet' : 'Weli koorso ma jirto'}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        {language === 'en' 
                          ? 'Start your learning journey by enrolling in your first course.'
                          : 'Bilow safarka waxbarashadaada adoo is diiwaangelinaya koorso.'}
                      </p>
                      <Button onClick={() => navigate('/courses')} className="bg-accent hover:bg-accent/90">
                        {language === 'en' ? 'Explore Courses' : 'Daawado Koorsooyin'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.slice(0, 4).map((enrollment, index) => (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                        >
                          <img
                            src={enrollment.course.image_url || '/placeholder.svg'}
                            alt={enrollment.course.title}
                            className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {language === 'en' ? enrollment.course.title : (enrollment.course.title_so || enrollment.course.title)}
                            </h4>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{enrollment.course.instructor_name}</span>
                              <span className="hidden sm:inline">•</span>
                              <Clock className="w-3 h-3 hidden sm:block" />
                              <span className="hidden sm:inline">{enrollment.course.duration}</span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">
                                  {language === 'en' ? 'Progress' : 'Horumarka'}
                                </span>
                                <span className="font-medium">{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-1.5" />
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0 hidden sm:flex">
                            <Play className="w-4 h-4 mr-1" />
                            {language === 'en' ? 'Continue' : 'Sii Wado'}
                          </Button>
                        </motion.div>
                      ))}
                      {enrollments.length > 4 && (
                        <Button variant="outline" className="w-full" onClick={() => navigate('/courses')}>
                          {language === 'en' 
                            ? `View all ${enrollments.length} courses`
                            : `Eeg dhammaan ${enrollments.length} koorsooyin`}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Actions Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {language === 'en' ? 'Quick Actions' : 'Ficilada Degdegga'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-11" 
                    onClick={() => navigate('/courses')}
                  >
                    <BookOpen className="w-4 h-4 mr-3" />
                    {language === 'en' ? 'Browse Courses' : 'Daawado Koorsooyin'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-11"
                    onClick={() => navigate('/buy-credits')}
                  >
                    <CreditCard className="w-4 h-4 mr-3" />
                    {language === 'en' ? 'Buy Credits' : 'Iibso Credits'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-11"
                    onClick={() => setShowAppointment(true)}
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    {language === 'en' ? 'Book Appointment' : 'Ballanse'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-11"
                    onClick={() => setShowCertificates(true)}
                  >
                    <Award className="w-4 h-4 mr-3" />
                    {language === 'en' ? 'View Certificates' : 'Eeg Shahaadooyinka'}
                  </Button>
                </CardContent>
              </Card>

              {/* Recommended Courses */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {language === 'en' ? 'Continue Learning' : 'Sii Wado Waxbarasho'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'en' ? 'Pick up where you left off' : 'Ka bilow meesha aad joogsatay'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {language === 'en' 
                        ? 'Enroll in courses to see them here'
                        : 'Iska diiwaan geli koorsooyin si aad halkan uga aragto'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {enrollments.slice(0, 2).map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center gap-3">
                          <img
                            src={enrollment.course.image_url || '/placeholder.svg'}
                            alt={enrollment.course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {language === 'en' ? enrollment.course.title : (enrollment.course.title_so || enrollment.course.title)}
                            </p>
                            <Progress value={enrollment.progress} className="h-1 mt-1" />
                          </div>
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>

      {/* Modals */}
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => {
          setShowNotifications(false);
          // Refresh unread count
          fetchUserData();
        }} 
      />
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onProfileUpdate={fetchUserData}
      />
      <AppointmentModal 
        isOpen={showAppointment} 
        onClose={() => setShowAppointment(false)}
        onSuccess={fetchUserData}
      />
      <CertificatesModal 
        isOpen={showCertificates} 
        onClose={() => setShowCertificates(false)} 
      />
    </>
  );
}
