import React, { useEffect, useState } from 'react';
import { Search, Check, X, Clock, Calendar, MoreHorizontal, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  status: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export function AdminBookings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  async function fetchBookings() {
    try {
      setLoading(true);
      let query = supabase
        .from('appointments')
        .select('*')
        .order('scheduled_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles for each booking
      const bookingsWithUsers = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', booking.user_id)
            .single();
          return {
            ...booking,
            user_name: profile?.full_name || 'Unknown',
          };
        })
      );

      setBookings(bookingsWithUsers);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = bookings.filter(booking =>
    booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    total: bookings.length,
  };

  const updateBookingStatus = async (bookingId: string, userId: string, newStatus: string, note?: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', bookingId);
      
      if (error) throw error;

      // Create notification for user
      const statusMessages: Record<string, string> = {
        confirmed: language === 'en' ? 'Your booking has been confirmed!' : 'Ballankaaga waa la xaqiijiyey!',
        cancelled: language === 'en' ? 'Your booking has been cancelled.' : 'Ballankaaga waa la tirtiiray.',
        rescheduled: note || (language === 'en' ? 'Your booking has been rescheduled.' : 'Ballankaaga waa la bedelay.'),
      };

      await supabase.from('notifications').insert({
        user_id: userId,
        title: language === 'en' ? 'Booking Update' : 'Cusboonaysiinta Ballanka',
        message: statusMessages[newStatus] || `Status updated to ${newStatus}`,
        type: newStatus === 'confirmed' ? 'success' : newStatus === 'cancelled' ? 'error' : 'info',
        link: '/dashboard',
      });

      toast({
        title: language === 'en' ? 'Booking Updated' : 'Ballan La Cusbooneysiiyey',
        description: `Status changed to ${newStatus}`,
      });

      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' ? 'Failed to update booking' : 'Waa lagu guul daraystay',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !newDateTime) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          scheduled_at: new Date(newDateTime).toISOString(),
          status: 'confirmed'
        })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: selectedBooking.user_id,
        title: language === 'en' ? 'Booking Rescheduled' : 'Ballan La Bedelay',
        message: rescheduleNote || (language === 'en' 
          ? `Your booking has been rescheduled to ${format(new Date(newDateTime), 'PPP p')}`
          : `Ballankaaga waxaa la bedelay ${format(new Date(newDateTime), 'PPP p')}`),
        type: 'info',
        link: '/dashboard',
      });

      toast({ title: language === 'en' ? 'Booking Rescheduled' : 'Ballan La Bedelay' });
      setRescheduleDialogOpen(false);
      setSelectedBooking(null);
      setNewDateTime('');
      setRescheduleNote('');
      fetchBookings();
    } catch (error) {
      console.error('Error rescheduling:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Title', 'Scheduled At', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(b => [
        b.id,
        b.user_name,
        `"${b.title}"`,
        format(new Date(b.scheduled_at), 'yyyy-MM-dd HH:mm'),
        b.status,
        format(new Date(b.created_at), 'yyyy-MM-dd HH:mm'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'confirmed' && <Check className="w-3 h-3 mr-1" />}
        {status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total' : 'Wadarta'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Pending' : 'Sugaya'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Confirmed' : 'La xaqiijiyey'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'Cancelled' : 'La tirtiiray'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search bookings...' : 'Raadi ballannimo...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All' : 'Dhamaan'}</SelectItem>
              <SelectItem value="pending">{language === 'en' ? 'Pending' : 'Sugaya'}</SelectItem>
              <SelectItem value="confirmed">{language === 'en' ? 'Confirmed' : 'La xaqiijiyey'}</SelectItem>
              <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'La tirtiiray'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="w-4 h-4" />
          {language === 'en' ? 'Export CSV' : 'Soo dhig CSV'}
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'en' ? 'User' : 'Isticmaale'}</TableHead>
                <TableHead>{language === 'en' ? 'Title' : 'Cinwaan'}</TableHead>
                <TableHead>{language === 'en' ? 'Scheduled' : 'Wakhtiga'}</TableHead>
                <TableHead>{language === 'en' ? 'Status' : 'Xaalad'}</TableHead>
                <TableHead>{language === 'en' ? 'Created' : 'La sameeyey'}</TableHead>
                <TableHead className="w-[100px]"></TableHead>
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
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {language === 'en' ? 'No bookings found' : 'Ballan lama helin'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.user_name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.title}</p>
                        {booking.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {booking.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(booking.scheduled_at), 'MMM d, yyyy')}
                        <span className="text-muted-foreground">
                          {format(new Date(booking.scheduled_at), 'h:mm a')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status || 'pending')}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {booking.status === 'pending' && (
                            <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, booking.user_id, 'confirmed')}>
                              <Check className="w-4 h-4 mr-2 text-green-600" />
                              {language === 'en' ? 'Confirm' : 'Xaqiiji'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => {
                            setSelectedBooking(booking);
                            setRescheduleDialogOpen(true);
                          }}>
                            <Calendar className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Reschedule' : 'Bedel wakhtiga'}
                          </DropdownMenuItem>
                          {booking.status !== 'cancelled' && (
                            <DropdownMenuItem 
                              onClick={() => updateBookingStatus(booking.id, booking.user_id, 'cancelled')}
                              className="text-destructive"
                            >
                              <X className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Cancel' : 'Tirtir'}
                            </DropdownMenuItem>
                          )}
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

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Reschedule Booking' : 'Bedel Wakhtiga Ballanka'}</DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Select a new date and time for this booking.'
                : 'Dooro taariikh iyo wakhti cusub.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'New Date & Time' : 'Taariikh iyo Wakhti Cusub'}</Label>
              <Input
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Note to User (optional)' : 'Fariinta Isticmaalaha'}</Label>
              <Textarea
                placeholder={language === 'en' ? 'Reason for rescheduling...' : 'Sababta beddelka...'}
                value={rescheduleNote}
                onChange={(e) => setRescheduleNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Jooji'}
            </Button>
            <Button onClick={handleReschedule} disabled={!newDateTime}>
              {language === 'en' ? 'Reschedule' : 'Bedel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
