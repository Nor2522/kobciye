import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, Users, GraduationCap, Wallet, TrendingUp, 
  Video, Calendar, BarChart3, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalCourses: number;
  publishedCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  activeEnrollments: number;
  totalCredits: number;
  totalPlaylists: number;
  totalVideos: number;
  pendingBookings: number;
}

export function AdminOverview() {
  const { language } = useLanguage();
  const [, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    totalCredits: 0,
    totalPlaylists: 0,
    totalVideos: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Fetch all stats in parallel
      const [
        { data: courses },
        { data: profiles },
        { data: enrollments },
        { count: playlistCount },
        { count: videoCount },
        { count: pendingBookingsCount },
      ] = await Promise.all([
        supabase.from('courses').select('id, is_published'),
        supabase.from('profiles').select('id, credits'),
        supabase.from('enrollments').select('id, status'),
        supabase.from('playlists').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalCourses: courses?.length || 0,
        publishedCourses: courses?.filter(c => c.is_published).length || 0,
        totalUsers: profiles?.length || 0,
        totalEnrollments: enrollments?.length || 0,
        activeEnrollments: enrollments?.filter(e => e.status === 'active').length || 0,
        totalCredits: profiles?.reduce((sum, p) => sum + (p.credits || 0), 0) || 0,
        totalPlaylists: playlistCount || 0,
        totalVideos: videoCount || 0,
        pendingBookings: pendingBookingsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const navigateToTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const statCards = [
    {
      title: language === 'en' ? 'Total Courses' : 'Koorsooyin Guud',
      value: stats.totalCourses,
      subtitle: language === 'en' 
        ? `${stats.publishedCourses} published` 
        : `${stats.publishedCourses} la daabacay`,
      icon: BookOpen,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: language === 'en' ? 'Total Users' : 'Isticmaalayaal',
      value: stats.totalUsers,
      subtitle: language === 'en' ? 'Registered students' : 'Arday diiwaangashan',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: language === 'en' ? 'Enrollments' : 'Diiwaangelinta',
      value: stats.totalEnrollments,
      subtitle: language === 'en' 
        ? `${stats.activeEnrollments} active` 
        : `${stats.activeEnrollments} firfircoon`,
      icon: GraduationCap,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: language === 'en' ? 'Total Credits' : 'Credits Guud',
      value: stats.totalCredits.toLocaleString(),
      subtitle: language === 'en' ? 'In circulation' : 'Wareegaya',
      icon: Wallet,
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  const secondaryStats = [
    {
      title: language === 'en' ? 'Playlists' : 'Playlists',
      value: stats.totalPlaylists,
      icon: Video,
    },
    {
      title: language === 'en' ? 'Videos' : 'Fiidiyowyada',
      value: stats.totalVideos,
      icon: TrendingUp,
    },
    {
      title: language === 'en' ? 'Pending Bookings' : 'Ballamo Sugaya',
      value: stats.pendingBookings,
      icon: Calendar,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {secondaryStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Ficilada Degdega'}</CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Common administrative tasks' 
              : 'Hawlaha maamulka ee caadiga ah'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card 
              className="border border-dashed cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigateToTab('courses')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{language === 'en' ? 'Add Course' : 'Koorso Cusub'}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Create new course' : 'Samee koorso cusub'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="border border-dashed cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigateToTab('playlists')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{language === 'en' ? 'Upload Videos' : 'Soo Geli Fiidiyowyada'}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Add course content' : 'Dar nuxurka koorsada'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="border border-dashed cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigateToTab('users')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{language === 'en' ? 'Manage Users' : 'Maaree Isticmaalayaasha'}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'View all users' : 'Eeg dhammaan'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="border border-dashed cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigateToTab('bookings')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">{language === 'en' ? 'Bookings' : 'Ballannimo'}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingBookings > 0 
                      ? `${stats.pendingBookings} ${language === 'en' ? 'pending' : 'sugaya'}`
                      : language === 'en' ? 'View all' : 'Eeg dhammaan'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="border border-dashed cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigateToTab('reports')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">{language === 'en' ? 'View Reports' : 'Eeg Warbixinaha'}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Analytics & insights' : 'Falanqeyn'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
