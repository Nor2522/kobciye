import React, { useRef, useEffect, useCallback } from 'react';
import { Play } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';

interface CourseVideoPlayerProps {
  videoUrl?: string | null;
  videoSource?: string | null;
  thumbnailUrl?: string | null;
  title?: string;
  videoId?: string;
  onComplete?: () => void;
}

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function CourseVideoPlayer({ 
  videoUrl, 
  videoSource, 
  thumbnailUrl, 
  title = 'Video',
  videoId,
  onComplete 
}: CourseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { saveProgress, startProgressTracking, stopProgressTracking, loadProgress } = useVideoProgress({
    videoId: videoId || '',
    onComplete,
  });

  // Load saved progress on mount
  useEffect(() => {
    if (videoId && videoRef.current) {
      loadProgress().then((progress) => {
        if (progress && progress.lastPosition > 0 && videoRef.current) {
          videoRef.current.currentTime = progress.lastPosition;
        }
      });
    }
  }, [videoId, loadProgress]);

  // Track progress for HTML5 video
  useEffect(() => {
    if (!videoRef.current || !videoId) return;

    const video = videoRef.current;

    const cleanup = startProgressTracking(
      () => video.currentTime,
      () => video.duration
    );

    const handlePause = () => {
      if (video.duration > 0) {
        saveProgress(video.currentTime, video.duration);
      }
    };

    const handleEnded = () => {
      saveProgress(video.duration, video.duration);
    };

    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      cleanup();
      stopProgressTracking();
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoId, saveProgress, startProgressTracking, stopProgressTracking]);

  if (!videoUrl || videoSource === 'none') {
    return null;
  }

  if (videoSource === 'youtube') {
    const ytVideoId = extractYouTubeId(videoUrl);
    if (!ytVideoId) return null;

    return (
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden group">
        <iframe
          src={`https://www.youtube.com/embed/${ytVideoId}?rel=0&enablejsapi=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (videoSource === 'upload' || videoSource === 'external') {
    return (
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          poster={thumbnailUrl || undefined}
          className="w-full h-full object-contain"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}
