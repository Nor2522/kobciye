import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal, Shield, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/hooks/useUserRole';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
  phone: string | null;
  created_at: string;
  roles: AppRole[];
}

export function AdminUsers() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creditsAmount, setCreditsAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        roles: (rolesData || [])
          .filter(r => r.user_id === profile.user_id)
          .map(r => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user =>
    (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: AppRole) => {
    const colors: Record<AppRole, string> = {
      super_admin: 'bg-red-500 text-white',
      admin: 'bg-purple-500 text-white',
      instructor: 'bg-blue-500 text-white',
      student: 'bg-secondary text-secondary-foreground',
    };
    const labels: Record<AppRole, string> = {
      super_admin: language === 'en' ? 'Super Admin' : 'Maamulaha Sare',
      admin: language === 'en' ? 'Admin' : 'Maamule',
      instructor: language === 'en' ? 'Instructor' : 'Macalin',
      student: language === 'en' ? 'Student' : 'Arday',
    };
    return (
      <Badge key={role} className={colors[role]}>
        {labels[role]}
      </Badge>
    );
  };

  const handleOpenCreditsDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setCreditsAmount(user.credits);
    setCreditsDialogOpen(true);
  };

  const handleUpdateCredits = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: creditsAmount })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Credits Updated' : 'Credits La Cusbooneysiiyey',
        description: language === 'en' 
          ? `User now has ${creditsAmount} credits.` 
          : `Isticmaaluhu hadda wuxuu leeyahay ${creditsAmount} credits.`,
      });
      setCreditsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Khalad',
        description: language === 'en' 
          ? 'Failed to update credits.' 
          : 'Credits cusbooneysiintu way fashilantay.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search users...' : 'Raadi isticmaalayaasha...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'en' ? 'User' : 'Isticmaale'}</TableHead>
                <TableHead>{language === 'en' ? 'Roles' : 'Doorooyin'}</TableHead>
                <TableHead>{language === 'en' ? 'Credits' : 'Credits'}</TableHead>
                <TableHead>{language === 'en' ? 'Phone' : 'Telefon'}</TableHead>
                <TableHead>{language === 'en' ? 'Joined' : 'Is diiwaangeliyey'}</TableHead>
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
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    {language === 'en' ? 'No users found' : 'Isticmaale lama helin'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {(user.full_name || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {user.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 
                          ? user.roles.map(getRoleBadge)
                          : getRoleBadge('student')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{user.credits}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenCreditsDialog(user)}>
                            <Wallet className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Manage Credits' : 'Maaree Credits'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <User className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'View Profile' : 'Eeg Profile'}
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

      {/* Credits Dialog */}
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Manage Credits' : 'Maaree Credits'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? `Update credits for ${selectedUser?.full_name || 'this user'}.`
                : `Cusboonaysii credits-ka ${selectedUser?.full_name || 'isticmaalahan'}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'en' ? 'Credits Amount' : 'Tirada Credits'}</Label>
              <Input
                type="number"
                min="0"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(parseInt(e.target.value) || 0)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? `Current balance: ${selectedUser?.credits || 0} credits`
                : `Haraagii: ${selectedUser?.credits || 0} credits`}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsDialogOpen(false)}>
              {language === 'en' ? 'Cancel' : 'Jooji'}
            </Button>
            <Button onClick={handleUpdateCredits} disabled={saving}>
              {saving 
                ? (language === 'en' ? 'Saving...' : 'Waa la keydiyaa...')
                : (language === 'en' ? 'Update Credits' : 'Cusboonaysii')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
