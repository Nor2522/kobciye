-- Update enroll_with_credits function to also create a notification
CREATE OR REPLACE FUNCTION public.enroll_with_credits(_user_id uuid, _course_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _course_price NUMERIC;
    _course_title TEXT;
    _user_credits INTEGER;
    _enrollment_id UUID;
BEGIN
    -- Get course price and title
    SELECT price, title INTO _course_price, _course_title FROM public.courses WHERE id = _course_id;
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

    -- Create enrollment notification
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        _user_id,
        'Enrollment Successful',
        'You have successfully enrolled in "' || _course_title || '". Your credits have been updated.',
        'success',
        '/dashboard'
    );

    RETURN json_build_object(
        'success', true, 
        'enrollment_id', _enrollment_id,
        'credits_remaining', _user_credits - _course_price::INTEGER
    );
END;
$$;