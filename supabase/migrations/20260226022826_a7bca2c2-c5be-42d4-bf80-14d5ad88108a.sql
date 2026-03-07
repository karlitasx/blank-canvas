-- Allow all authenticated users to view user_stats for ranking
CREATE POLICY "Anyone can view all user stats for ranking"
ON public.user_stats
FOR SELECT
USING (true);

-- Drop the restrictive old policy
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;