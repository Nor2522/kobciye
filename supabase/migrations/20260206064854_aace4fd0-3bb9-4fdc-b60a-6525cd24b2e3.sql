-- Create playlists/sections table for courses
CREATE TABLE public.playlists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_so TEXT,
    description TEXT,
    description_so TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table for playlist items
CREATE TABLE public.videos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_so TEXT,
    description TEXT,
    description_so TEXT,
    video_url TEXT NOT NULL,
    video_source TEXT NOT NULL DEFAULT 'youtube', -- 'youtube', 'upload', 'external'
    thumbnail_url TEXT,
    duration_seconds INTEGER, -- video duration in seconds
    order_index INTEGER NOT NULL DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT false, -- allow preview without enrollment
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking table
CREATE TABLE public.user_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    watched_percentage INTEGER NOT NULL DEFAULT 0 CHECK (watched_percentage >= 0 AND watched_percentage <= 100),
    last_position_seconds INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, video_id)
);

-- Create transcoding jobs table (for future use)
CREATE TABLE public.transcoding_jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    input_url TEXT NOT NULL,
    output_url TEXT,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcoding_jobs ENABLE ROW LEVEL SECURITY;

-- Playlists policies
CREATE POLICY "Anyone can view playlists of published courses"
ON public.playlists FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = playlists.course_id 
        AND courses.is_published = true
    )
);

CREATE POLICY "Admins can view all playlists"
ON public.playlists FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert playlists"
ON public.playlists FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update playlists"
ON public.playlists FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete playlists"
ON public.playlists FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Videos policies
CREATE POLICY "Anyone can view free videos"
ON public.videos FOR SELECT
USING (
    is_free = true AND EXISTS (
        SELECT 1 FROM public.playlists p
        JOIN public.courses c ON c.id = p.course_id
        WHERE p.id = videos.playlist_id 
        AND c.is_published = true
    )
);

CREATE POLICY "Enrolled users can view course videos"
ON public.videos FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.playlists p
        JOIN public.courses c ON c.id = p.course_id
        JOIN public.enrollments e ON e.course_id = c.id
        WHERE p.id = videos.playlist_id 
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
);

CREATE POLICY "Admins can view all videos"
ON public.videos FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert videos"
ON public.videos FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update videos"
ON public.videos FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete videos"
ON public.videos FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- User progress policies
CREATE POLICY "Users can view their own progress"
ON public.user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
ON public.user_progress FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Transcoding jobs policies (admin only)
CREATE POLICY "Admins can manage transcoding jobs"
ON public.transcoding_jobs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON public.playlists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_playlists_course_id ON public.playlists(course_id);
CREATE INDEX idx_playlists_order ON public.playlists(course_id, order_index);
CREATE INDEX idx_videos_playlist_id ON public.videos(playlist_id);
CREATE INDEX idx_videos_order ON public.videos(playlist_id, order_index);
CREATE INDEX idx_user_progress_user_video ON public.user_progress(user_id, video_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_transcoding_jobs_status ON public.transcoding_jobs(status);

-- Function to calculate course progress for a user
CREATE OR REPLACE FUNCTION public.get_course_progress(_user_id uuid, _course_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _total_videos INTEGER;
    _completed_videos INTEGER;
    _avg_percentage NUMERIC;
    _is_completed BOOLEAN;
BEGIN
    -- Get total videos in course
    SELECT COUNT(v.id) INTO _total_videos
    FROM videos v
    JOIN playlists p ON p.id = v.playlist_id
    WHERE p.course_id = _course_id;

    IF _total_videos = 0 THEN
        RETURN json_build_object(
            'total_videos', 0,
            'completed_videos', 0,
            'progress_percentage', 0,
            'is_completed', false
        );
    END IF;

    -- Get completed videos and average percentage
    SELECT 
        COUNT(CASE WHEN up.is_completed THEN 1 END),
        COALESCE(AVG(up.watched_percentage), 0)
    INTO _completed_videos, _avg_percentage
    FROM videos v
    JOIN playlists p ON p.id = v.playlist_id
    LEFT JOIN user_progress up ON up.video_id = v.id AND up.user_id = _user_id
    WHERE p.course_id = _course_id;

    _is_completed := _completed_videos = _total_videos AND _total_videos > 0;

    RETURN json_build_object(
        'total_videos', _total_videos,
        'completed_videos', _completed_videos,
        'progress_percentage', ROUND(_avg_percentage),
        'is_completed', _is_completed
    );
END;
$$;

-- Function to update video progress with auto-complete
CREATE OR REPLACE FUNCTION public.update_video_progress(
    _user_id uuid,
    _video_id uuid,
    _watched_percentage integer,
    _last_position_seconds integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _is_completed BOOLEAN;
    _result_id UUID;
BEGIN
    -- Auto-complete if watched 90% or more
    _is_completed := _watched_percentage >= 90;

    INSERT INTO user_progress (user_id, video_id, watched_percentage, last_position_seconds, is_completed, completed_at)
    VALUES (
        _user_id, 
        _video_id, 
        _watched_percentage, 
        _last_position_seconds, 
        _is_completed,
        CASE WHEN _is_completed THEN now() ELSE NULL END
    )
    ON CONFLICT (user_id, video_id) DO UPDATE SET
        watched_percentage = GREATEST(user_progress.watched_percentage, EXCLUDED.watched_percentage),
        last_position_seconds = EXCLUDED.last_position_seconds,
        is_completed = user_progress.is_completed OR EXCLUDED.is_completed,
        completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
        updated_at = now()
    RETURNING id INTO _result_id;

    RETURN json_build_object(
        'success', true,
        'progress_id', _result_id,
        'is_completed', _is_completed
    );
END;
$$;