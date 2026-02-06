import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UseVideoProgressOptions {
  videoId: string;
  durationSeconds?: number;
  onComplete?: () => void;
}

export function useVideoProgress({ videoId, durationSeconds, onComplete }: UseVideoProgressOptions) {
  const { user } = useAuth();
  const lastSavedRef = useRef<number>(0);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!user || !videoId || duration <= 0) return;

    const watchedPercentage = Math.min(100, Math.round((currentTime / duration) * 100));
    
    // Only save if progress changed by at least 5%
    if (Math.abs(watchedPercentage - lastSavedRef.current) < 5) return;
    
    lastSavedRef.current = watchedPercentage;

    try {
      const { data, error } = await supabase.rpc('update_video_progress', {
        _user_id: user.id,
        _video_id: videoId,
        _watched_percentage: watchedPercentage,
        _last_position_seconds: Math.floor(currentTime),
      });

      if (error) throw error;

      const result = data as { success: boolean; is_completed: boolean };
      if (result?.is_completed && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user, videoId, onComplete]);

  const startProgressTracking = useCallback((
    getCurrentTime: () => number,
    getDuration: () => number
  ) => {
    // Save progress every 10 seconds
    saveIntervalRef.current = setInterval(() => {
      const currentTime = getCurrentTime();
      const duration = durationSeconds || getDuration();
      if (duration > 0) {
        saveProgress(currentTime, duration);
      }
    }, 10000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [durationSeconds, saveProgress]);

  const stopProgressTracking = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
  }, []);

  const loadProgress = useCallback(async (): Promise<{ lastPosition: number; percentage: number } | null> => {
    if (!user || !videoId) return null;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('last_position_seconds, watched_percentage')
        .eq('user_id', user.id)
        .eq('video_id', videoId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          lastPosition: data.last_position_seconds,
          percentage: data.watched_percentage,
        };
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    return null;
  }, [user, videoId]);

  return {
    saveProgress,
    startProgressTracking,
    stopProgressTracking,
    loadProgress,
  };
}
