import React, { useEffect, useState } from 'react';
import { Download, TrendingUp, Users, BookOpen, GraduationCap, BarChart3, PieChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from 'recharts';

interface CourseStats {
  id: string;
  title: string;
  enrollments: number;
  completions: number;
  avgProgress: number;
}

interface DailyStats {
  date: string;
  enrollments: number;
  completions: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10B981', '#F59E0B', '#6366F1'];

export function AdminReports() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    activeUsers: 0,
  });
  
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  async function fetchReports() {
    try {
      setLoading(true);
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Fetch basic stats
      const [
        { data: profiles },
        { data: courses },
        { data: enrollments },
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('courses').select('id, title, category, is_published'),
        supabase.from('enrollments').select('id, course_id, status, enrolled_at, completed_at'),
      ]);

      // Calculate stats
      const totalUsers = profiles?.length || 0;
      const totalCourses = courses?.filter(c => c.is_published).length || 0;
      const totalEnrollments = enrollments?.length || 0;
      const completedEnrollments = enrollments?.filter(e => e.status === 'completed').length || 0;
      const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
      
      // Active users (enrolled in last 30 days)
      const recentEnrollments = enrollments?.filter(e => 
        new Date(e.enrolled_at) >= startDate
      ) || [];
      const activeUserIds = new Set(recentEnrollments.map(e => e.course_id));
      
      setStats({
        totalUsers,
        totalCourses,
        totalEnrollments,
        completionRate,
        activeUsers: activeUserIds.size,
      });

      // Course stats
      const courseStatsMap = new Map<string, CourseStats>();
      courses?.forEach(course => {
        courseStatsMap.set(course.id, {
          id: course.id,
          title: course.title,
          enrollments: 0,
          completions: 0,
          avgProgress: 0,
        });
      });

      enrollments?.forEach(enrollment => {
        const stat = courseStatsMap.get(enrollment.course_id);
        if (stat) {
          stat.enrollments++;
          if (enrollment.status === 'completed') {
            stat.completions++;
          }
        }
      });

      const sortedCourseStats = Array.from(courseStatsMap.values())
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 10);
      setCourseStats(sortedCourseStats);

      // Daily stats for chart
      const dailyMap = new Map<string, DailyStats>();
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap.set(date, { date, enrollments: 0, completions: 0 });
      }

      enrollments?.forEach(enrollment => {
        const enrollDate = format(new Date(enrollment.enrolled_at), 'yyyy-MM-dd');
        if (dailyMap.has(enrollDate)) {
          dailyMap.get(enrollDate)!.enrollments++;
        }
        if (enrollment.completed_at) {
          const completeDate = format(new Date(enrollment.completed_at), 'yyyy-MM-dd');
          if (dailyMap.has(completeDate)) {
            dailyMap.get(completeDate)!.completions++;
          }
        }
      });

      setDailyStats(Array.from(dailyMap.values()));

      // Category distribution
      const categoryMap = new Map<string, number>();
      courses?.forEach(course => {
        const count = categoryMap.get(course.category) || 0;
        categoryMap.set(course.category, count + 1);
      });
      setCategoryDistribution(
        Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
      );

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    const headers = ['Course', 'Enrollments', 'Completions', 'Completion Rate'];
    const csvContent = [
      headers.join(','),
      ...courseStats.map(c => [
        `"${c.title}"`,
        c.enrollments,
        c.completions,
        c.enrollments > 0 ? `${Math.round((c.completions / c.enrollments) * 100)}%` : '0%',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simple HTML to PDF approach
    const printContent = `
      <html>
        <head>
          <title>Kobciye Report - ${format(new Date(), 'PPP')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f9f9f9; padding: 15px; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Kobciye Learning Platform Report</h1>
          <p>Generated: ${format(new Date(), 'PPPp')}</p>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.totalUsers}</div>
              <div>Total Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.totalCourses}</div>
              <div>Total Courses</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.totalEnrollments}</div>
              <div>Total Enrollments</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.completionRate}%</div>
              <div>Completion Rate</div>
            </div>
          </div>

          <h2>Course Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Enrollments</th>
                <th>Completions</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              ${courseStats.map(c => `
                <tr>
                  <td>${c.title}</td>
                  <td>${c.enrollments}</td>
                  <td>${c.completions}</td>
                  <td>${c.enrollments > 0 ? Math.round((c.completions / c.enrollments) * 100) : 0}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-40 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{language === 'en' ? 'Analytics & Reports' : 'Falanqeyn & Warbixino'}</h2>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Platform performance insights' : 'Waxqabadka nidaamka'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{language === 'en' ? 'Last 7 days' : '7 maalmood'}</SelectItem>
              <SelectItem value="30">{language === 'en' ? 'Last 30 days' : '30 maalmood'}</SelectItem>
              <SelectItem value="90">{language === 'en' ? 'Last 90 days' : '90 maalmood'}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF} className="gap-2">
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">{language === 'en' ? 'Total Users' : 'Isticmaalayaal'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-xs text-muted-foreground">{language === 'en' ? 'Courses' : 'Koorsooyin'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                <p className="text-xs text-muted-foreground">{language === 'en' ? 'Enrollments' : 'Diiwaangelin'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">{language === 'en' ? 'Completion' : 'Dhammaystir'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">{language === 'en' ? 'Active' : 'Firfircoon'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {language === 'en' ? 'Enrollment Trend' : 'Isbeddelka Diiwaangelinta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="completions" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {language === 'en' ? 'Courses by Category' : 'Koorsooyin Qaybta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {language === 'en' ? 'Top Courses by Enrollment' : 'Koorsooyin Ugu Sarreeya'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={courseStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="title" 
                width={200}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => value.length > 25 ? `${value.slice(0, 25)}...` : value}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="enrollments" fill="hsl(var(--primary))" name="Enrollments" radius={[0, 4, 4, 0]} />
              <Bar dataKey="completions" fill="hsl(var(--accent))" name="Completions" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
