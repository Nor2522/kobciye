// Core type definitions for the LMS
export interface Playlist {
  id: string;
  course_id: string;
  title: string;
  title_so?: string | null;
  description?: string | null;
  description_so?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  playlist_id: string;
  title: string;
  title_so?: string | null;
  description?: string | null;
  description_so?: string | null;
  video_url: string;
  video_source: string; // 'youtube' | 'upload' | 'external'
  thumbnail_url?: string | null;
  duration_seconds?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  video_id: string;
  watched_percentage: number;
  last_position_seconds: number;
  is_completed: boolean;
  completed_at?: string;
  play_count: number;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

export interface TranscodingJob {
  id: string;
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_url: string;
  output_url?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CourseProgress {
  total_videos: number;
  completed_videos: number;
  progress_percentage: number;
  is_completed: boolean;
}

export interface PlaylistWithVideos extends Playlist {
  videos: Video[];
}

export interface VideoWithProgress extends Video {
  progress?: UserProgress;
}

// Report types
export interface CourseReport {
  course_id: string;
  course_title: string;
  total_enrollments: number;
  completed_enrollments: number;
  completion_rate: number;
  average_progress: number;
}

export interface UserActivityReport {
  date: string;
  active_users: number;
  new_enrollments: number;
  videos_watched: number;
}

export interface BookingStats {
  pending: number;
  confirmed: number;
  cancelled: number;
  total: number;
}
