-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'instructor', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1 
      WHEN 'admin' THEN 2 
      WHEN 'instructor' THEN 3 
      WHEN 'student' THEN 4 
    END
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Add credits column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;

-- Create trigger to assign default student role on new user
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
    RETURN NEW;
END;
$$;

-- Create trigger for new user role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Create function to safely enroll in a course with credit deduction
CREATE OR REPLACE FUNCTION public.enroll_with_credits(
    _user_id UUID,
    _course_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _course_price NUMERIC;
    _user_credits INTEGER;
    _enrollment_id UUID;
BEGIN
    -- Get course price
    SELECT price INTO _course_price FROM public.courses WHERE id = _course_id;
    IF _course_price IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Course not found');
    END IF;

    -- Get user credits
    SELECT credits INTO _user_credits FROM public.profiles WHERE user_id = _user_id;
    IF _user_credits IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User profile not found');
    END IF;

    -- Check if already enrolled
    IF EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = _user_id AND course_id = _course_id) THEN
        RETURN json_build_object('success', false, 'error', 'Already enrolled in this course');
    END IF;

    -- Check if user has enough credits
    IF _user_credits < _course_price THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Insufficient credits', 
            'required', _course_price,
            'available', _user_credits
        );
    END IF;

    -- Deduct credits
    UPDATE public.profiles 
    SET credits = credits - _course_price::INTEGER
    WHERE user_id = _user_id;

    -- Create enrollment
    INSERT INTO public.enrollments (user_id, course_id, status, progress)
    VALUES (_user_id, _course_id, 'active', 0)
    RETURNING id INTO _enrollment_id;

    -- Update course student count
    UPDATE public.courses 
    SET students_count = COALESCE(students_count, 0) + 1
    WHERE id = _course_id;

    RETURN json_build_object(
        'success', true, 
        'enrollment_id', _enrollment_id,
        'credits_remaining', _user_credits - _course_price::INTEGER
    );
END;
$$;

-- Create password reset request table for tracking
CREATE TABLE public.password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();