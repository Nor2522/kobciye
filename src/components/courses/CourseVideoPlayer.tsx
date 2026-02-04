import React from 'react';
import { Play } from 'lucide-react';

interface CourseVideoPlayerProps {
  videoUrl?: string | null;
  videoSource?: string | null;
  thumbnailUrl?: string | null;
  title: string;
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

export function CourseVideoPlayer({ videoUrl, videoSource, thumbnailUrl, title }: CourseVideoPlayerProps) {
  if (!videoUrl || videoSource === 'none') {
    return null;
  }

  if (videoSource === 'youtube') {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    const youtubeThumb = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden group">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (videoSource === 'upload') {
    return (
      <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
        <video
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
