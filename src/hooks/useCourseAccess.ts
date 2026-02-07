import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CourseAccessResult {
  allowed: boolean;
  reason: 'enrolled' | 'admin_access' | 'not_enrolled' | 'course_not_found' | 'course_not_published';
  required_credits?: number;
  course_title?: string;
}

export function useCourseAccess() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accessResult, setAccessResult] = useState<CourseAccessResult | null>(null);

  const checkAccess = useCallback(async (courseId: string): Promise<CourseAccessResult | null> => {
    if (!user || !courseId) {
      setAccessResult({ allowed: false, reason: 'not_enrolled' });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_course_access', {
        _user_id: user.id,
        _course_id: courseId,
      });

      if (error) throw error;

      const result = data as unknown as CourseAccessResult;
      setAccessResult(result);
      return result;
    } catch (error) {
      console.error('Error checking course access:', error);
      setAccessResult({ allowed: false, reason: 'course_not_found' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    accessResult,
    checkAccess,
  };
}
