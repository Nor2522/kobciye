-- Add RLS policies for password_reset_requests
CREATE POLICY "Users can view their own password reset requests"
ON public.password_reset_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own password reset requests"
ON public.password_reset_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);