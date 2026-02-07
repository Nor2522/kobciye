-- Add is_playlist column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS is_playlist BOOLEAN NOT NULL DEFAULT false;

-- Add play tracking columns to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS play_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update the update_video_progress function to track play counts
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
AS $function$
DECLARE
    _is_completed BOOLEAN;
    _result_id UUID;
BEGIN
    -- Auto-complete if watched 90% or more
    _is_completed := _watched_percentage >= 90;

    INSERT INTO user_progress (user_id, video_id, watched_percentage, last_position_seconds, is_completed, completed_at, play_count, last_watched_at)
    VALUES (
        _user_id, 
        _video_id, 
        _watched_percentage, 
        _last_position_seconds, 
        _is_completed,
        CASE WHEN _is_completed THEN now() ELSE NULL END,
        1,
        now()
    )
    ON CONFLICT (user_id, video_id) DO UPDATE SET
        watched_percentage = GREATEST(user_progress.watched_percentage, EXCLUDED.watched_percentage),
        last_position_seconds = EXCLUDED.last_position_seconds,
        is_completed = user_progress.is_completed OR EXCLUDED.is_completed,
        completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
        play_count = user_progress.play_count + 1,
        last_watched_at = now(),
        updated_at = now()
    RETURNING id INTO _result_id;

    RETURN json_build_object(
        'success', true,
        'progress_id', _result_id,
        'is_completed', _is_completed
    );
END;
$function$;

-- Create check_course_access function to verify user can access course content
CREATE OR REPLACE FUNCTION public.check_course_access(_user_id uuid, _course_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    _enrollment RECORD;
    _course RECORD;
    _is_admin BOOLEAN;
BEGIN
    -- Check if user is admin (admins always have access)
    SELECT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id 
        AND role IN ('super_admin', 'admin', 'instructor')
    ) INTO _is_admin;
    
    IF _is_admin THEN
        RETURN json_build_object(
            'allowed', true,
            'reason', 'admin_access'
        );
    END IF;
    
    -- Get course info
    SELECT id, title, price, is_published INTO _course
    FROM courses WHERE id = _course_id;
    
    IF _course.id IS NULL THEN
        RETURN json_build_object(
            'allowed', false,
            'reason', 'course_not_found'
        );
    END IF;
    
    -- Check if course is published
    IF NOT _course.is_published THEN
        RETURN json_build_object(
            'allowed', false,
            'reason', 'course_not_published'
        );
    END IF;
    
    -- Check if user is enrolled
    SELECT id, status INTO _enrollment
    FROM enrollments
    WHERE user_id = _user_id AND course_id = _course_id;
    
    IF _enrollment.id IS NOT NULL AND _enrollment.status = 'active' THEN
        RETURN json_build_object(
            'allowed', true,
            'reason', 'enrolled'
        );
    END IF;
    
    -- User not enrolled - return required credits
    RETURN json_build_object(
        'allowed', false,
        'reason', 'not_enrolled',
        'required_credits', _course.price,
        'course_title', _course.title
    );
END;
$function$;

-- Create admin_settings table for super admin configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admins can view settings
CREATE POLICY "Super admins can view settings"
ON public.admin_settings FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

-- Only super_admins can insert settings
CREATE POLICY "Super admins can insert settings"
ON public.admin_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Only super_admins can update settings
CREATE POLICY "Super admins can update settings"
ON public.admin_settings FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'));

-- Only super_admins can delete settings
CREATE POLICY "Super admins can delete settings"
ON public.admin_settings FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.admin_settings (key, value)
VALUES 
    ('general', '{"site_name": "Kobciye", "maintenance_mode": false, "allow_registrations": true}'::jsonb),
    ('courses', '{"require_enrollment": true, "free_preview_enabled": true, "auto_complete_threshold": 90}'::jsonb),
    ('notifications', '{"email_notifications": true, "enrollment_notifications": true, "completion_notifications": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;