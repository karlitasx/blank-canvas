-- Create a function to award points to another user (for received likes)
CREATE OR REPLACE FUNCTION public.award_points_to_user(
  target_user_id UUID,
  p_action_type TEXT,
  p_action_id TEXT,
  p_points INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if this action was already recorded
  IF EXISTS (
    SELECT 1 FROM public.point_history 
    WHERE user_id = target_user_id 
    AND action_type = p_action_type 
    AND action_id = p_action_id
  ) THEN
    RETURN;
  END IF;

  -- Insert point history
  INSERT INTO public.point_history (user_id, action_type, action_id, points)
  VALUES (target_user_id, p_action_type, p_action_id, p_points);

  -- Update user_stats
  UPDATE public.user_stats 
  SET total_points = total_points + p_points
  WHERE user_id = target_user_id;
END;
$$;