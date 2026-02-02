import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'admin' | 'instructor' | 'student';

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      setRole(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    if (user) {
      fetchUserRoles();
    }
  }, [user, authLoading]);

  async function fetchUserRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id);

      if (error) throw error;

      const userRoles = (data || []).map(r => r.role as AppRole);
      setRoles(userRoles);

      // Set primary role based on priority
      const rolePriority: AppRole[] = ['super_admin', 'admin', 'instructor', 'student'];
      const primaryRole = rolePriority.find(r => userRoles.includes(r)) || 'student';
      setRole(primaryRole);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRole('student');
    } finally {
      setLoading(false);
    }
  }

  const hasRole = (checkRole: AppRole): boolean => {
    return roles.includes(checkRole);
  };

  const isAdmin = (): boolean => {
    return hasRole('super_admin') || hasRole('admin');
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  const isInstructor = (): boolean => {
    return hasRole('instructor') || isAdmin();
  };

  return {
    role,
    roles,
    loading,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isInstructor,
  };
}
