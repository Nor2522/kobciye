import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface EnrollmentWithDetails {
  id: string;
  user_id: string;
  progress: number;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  course: {
    id: string;
    title: string;
  };
  profile: {
    full_name: string | null;
  } | null;
}

export function AdminEnrollments() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          id,
          user_id,
          progress,
          status,
          enrolled_at,
          completed_at,
          course:courses(id, title)
        `)
        .order('enrolled_at', { ascending: false });

      if (enrollmentError) throw enrollmentError;

      // Fetch profiles separately
      const userIds = [...new Set((enrollmentData || []).map(e => e.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const enrollmentsWithProfiles = (enrollmentData || []).map(e => ({
        ...e,
        course: e.course as unknown as { id: string; title: string },
        profile: profileMap.get(e.user_id) || null,
      }));

      setEnrollments(enrollmentsWithProfiles);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enrollment.profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Completed' : 'Dhammaad'}
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Active' : 'Firfircoon'}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Cancelled' : 'La joojiyey'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">{status}</Badge>
        );
    }
  };

  const handleUpdateStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      const updateData: { status: string; completed_at?: string | null } = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('id', enrollmentId);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Status Updated' : 'Xaaladda La Cusbooneysiiyey',
      });
      fetchEnrollments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (enrollmentId: string) => {
    if (!confirm(language === 'en' 
      ? 'Are you sure you want to delete this enrollment?' 
      : 'Ma hubtaa inaad tirtirto diiwaangelintaan?')) {
      return;
    }
    try {
      const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId);
      if (error) throw error;
      toast({
        title: language === 'en' ? 'Enrollment Deleted' : 'Diiwaangelinta La Tirtiray',
      });
      fetchEnrollments();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search enrollments...' : 'Raadi diiwaangelinta...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={language === 'en' ? 'Filter by status' : 'Shaandhayn xaalad'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'en' ? 'All Status' : 'Dhammaan'}</SelectItem>
            <SelectItem value="active">{language === 'en' ? 'Active' : 'Firfircoon'}</SelectItem>
            <SelectItem value="completed">{language === 'en' ? 'Completed' : 'Dhammaad'}</SelectItem>
            <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'La joojiyey'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'en' ? 'Student' : 'Arday'}</TableHead>
                <TableHead>{language === 'en' ? 'Course' : 'Koorso'}</TableHead>
                <TableHead>{language === 'en' ? 'Progress' : 'Horumar'}</TableHead>
                <TableHead>{language === 'en' ? 'Status' : 'Xaalad'}</TableHead>
                <TableHead>{language === 'en' ? 'Enrolled' : 'Is diiwaangeliyey'}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {language === 'en' ? 'No enrollments found' : 'Diiwaangelin lama helin'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{enrollment.profile?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {enrollment.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium line-clamp-1">{enrollment.course.title}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center justify-between text-xs">
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(enrollment.status || 'active')}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(enrollment.id, 'active')}>
                            <Clock className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Set Active' : 'Dhig Firfircoon'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(enrollment.id, 'completed')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Mark Completed' : 'Dhig Dhammaad'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(enrollment.id)}
                            className="text-destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Delete' : 'Tirtir'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
