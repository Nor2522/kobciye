-- Fix the overly permissive INSERT policy on notifications
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more secure policy: users can insert their own notifications OR via authenticated users
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);