import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Point values for each action
const POINT_VALUES = {
  habit_create: 10,
  habit_complete: 5,
  post_create: 10,
  post_like: 2,
  post_liked_received: 2,
  comment_create: 5,
  challenge_join: 15,
  challenge_complete: 50,
  follow: 2,
  selfcare_checkin: 10,
  selfcare_ritual: 5,
  selfcare_pillar: 3,
} as const;

// Daily limits for each action type
const DAILY_LIMITS = {
  habit_create: 3,
  habit_complete: 10,
  post_create: 5,
  post_like: 20,
  post_liked_received: 50,
  comment_create: 10,
  challenge_join: 2,
  challenge_complete: 5,
  follow: 10,
  selfcare_checkin: 1,
  selfcare_ritual: 3,
  selfcare_pillar: 9,
} as const;

type ActionType = keyof typeof POINT_VALUES;

export interface PointHistoryItem {
  id: string;
  action_type: ActionType;
  action_id: string | null;
  points: number;
  created_at: string;
}

export const usePoints = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [todayPoints, setTodayPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get today's date in ISO format (start of day)
  const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  };

  // Fetch point history
  const fetchHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("point_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      setHistory((data as PointHistoryItem[]) || []);

      // Calculate today's points
      const todayStart = getTodayStart();
      const todayItems = (data || []).filter(
        item => new Date(item.created_at) >= new Date(todayStart)
      );
      setTodayPoints(todayItems.reduce((sum, item) => sum + item.points, 0));
    } catch (error) {
      console.error("Error fetching point history:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Check if action is allowed (not exceeded daily limit)
  const canEarnPoints = useCallback(async (actionType: ActionType): Promise<boolean> => {
    if (!user) return false;

    const todayStart = getTodayStart();
    const limit = DAILY_LIMITS[actionType];

    const { count, error } = await supabase
      .from("point_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action_type", actionType)
      .gte("created_at", todayStart);

    if (error) {
      console.error("Error checking daily limit:", error);
      return false;
    }

    return (count || 0) < limit;
  }, [user]);

  // Check if specific action was already recorded (prevent duplicates)
  const hasRecordedAction = useCallback(async (actionType: ActionType, actionId: string): Promise<boolean> => {
    if (!user) return true;

    const { count, error } = await supabase
      .from("point_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action_type", actionType)
      .eq("action_id", actionId);

    if (error) {
      console.error("Error checking duplicate:", error);
      return true;
    }

    return (count || 0) > 0;
  }, [user]);

  // Award points for an action
  const awardPoints = useCallback(async (
    actionType: ActionType,
    actionId?: string
  ): Promise<{ success: boolean; points: number }> => {
    if (!user) return { success: false, points: 0 };

    // Check daily limit
    const allowed = await canEarnPoints(actionType);
    if (!allowed) {
      return { success: false, points: 0 };
    }

    // Check for duplicate if actionId provided
    if (actionId) {
      const isDuplicate = await hasRecordedAction(actionType, actionId);
      if (isDuplicate) {
        return { success: false, points: 0 };
      }
    }

    const points = POINT_VALUES[actionType];

    try {
      // Insert point history
      const { error: historyError } = await supabase
        .from("point_history")
        .insert({
          user_id: user.id,
          action_type: actionType,
          action_id: actionId || null,
          points,
        });

      if (historyError) throw historyError;

      // Update user_stats total_points
      const { data: currentStats } = await supabase
        .from("user_stats")
        .select("total_points")
        .eq("user_id", user.id)
        .single();

      const newTotal = (currentStats?.total_points || 0) + points;

      const { error: statsError } = await supabase
        .from("user_stats")
        .update({ total_points: newTotal })
        .eq("user_id", user.id);

      if (statsError) throw statsError;

      // Update local state
      setTodayPoints(prev => prev + points);
      fetchHistory();

      return { success: true, points };
    } catch (error) {
      console.error("Error awarding points:", error);
      return { success: false, points: 0 };
    }
  }, [user, canEarnPoints, hasRecordedAction, fetchHistory]);

  // Get remaining actions for today
  const getRemainingActions = useCallback(async (actionType: ActionType): Promise<number> => {
    if (!user) return 0;

    const todayStart = getTodayStart();
    const limit = DAILY_LIMITS[actionType];

    const { count, error } = await supabase
      .from("point_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action_type", actionType)
      .gte("created_at", todayStart);

    if (error) return 0;

    return Math.max(0, limit - (count || 0));
  }, [user]);

  return {
    history,
    todayPoints,
    loading,
    awardPoints,
    canEarnPoints,
    hasRecordedAction,
    getRemainingActions,
    refetch: fetchHistory,
    POINT_VALUES,
    DAILY_LIMITS,
  };
};
