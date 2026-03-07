import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SelfCareCheckIn {
  id: string;
  emotional_state: string;
  note: string | null;
  energy_level: number;
  gratitudes: string[];
  ritual_completed: boolean;
  ritual_type: string | null;
  checkin_date: string;
  created_at: string;
}

export interface PillarAction {
  id: string;
  pillar: "mind" | "body" | "energy";
  action_text: string;
  action_date: string;
  created_at: string;
}

export const useSelfCare = () => {
  const { user } = useAuth();
  const [todayCheckIn, setTodayCheckIn] = useState<SelfCareCheckIn | null>(null);
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<SelfCareCheckIn[]>([]);
  const [todayPillarActions, setTodayPillarActions] = useState<PillarAction[]>([]);
  const [weeklyPillarActions, setWeeklyPillarActions] = useState<PillarAction[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const getWeekStart = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      const weekStart = getWeekStart();

      const [checkInRes, weeklyRes, pillarTodayRes, pillarWeekRes] = await Promise.all([
        supabase
          .from("selfcare_checkins")
          .select("*")
          .eq("user_id", user.id)
          .eq("checkin_date", today)
          .maybeSingle(),
        supabase
          .from("selfcare_checkins")
          .select("*")
          .eq("user_id", user.id)
          .gte("checkin_date", weekStart)
          .order("checkin_date", { ascending: true }),
        supabase
          .from("selfcare_pillar_actions")
          .select("*")
          .eq("user_id", user.id)
          .eq("action_date", today),
        supabase
          .from("selfcare_pillar_actions")
          .select("*")
          .eq("user_id", user.id)
          .gte("action_date", weekStart),
      ]);

      setTodayCheckIn((checkInRes.data as SelfCareCheckIn) || null);
      setWeeklyCheckIns((weeklyRes.data as SelfCareCheckIn[]) || []);
      setTodayPillarActions((pillarTodayRes.data as PillarAction[]) || []);
      setWeeklyPillarActions((pillarWeekRes.data as PillarAction[]) || []);
    } catch (err) {
      console.error("Error fetching selfcare data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveCheckIn = async (data: {
    emotional_state: string;
    note?: string;
    energy_level: number;
    gratitudes: string[];
  }) => {
    if (!user) return null;

    // Upsert: if today already has a check-in, update it
    if (todayCheckIn) {
      const { data: updated, error } = await supabase
        .from("selfcare_checkins")
        .update({
          emotional_state: data.emotional_state,
          note: data.note || null,
          energy_level: data.energy_level,
          gratitudes: data.gratitudes.filter(g => g.trim()),
        })
        .eq("id", todayCheckIn.id)
        .select()
        .single();

      if (error) throw error;
      setTodayCheckIn(updated as SelfCareCheckIn);
      return updated;
    }

    const { data: inserted, error } = await supabase
      .from("selfcare_checkins")
      .insert({
        user_id: user.id,
        emotional_state: data.emotional_state,
        note: data.note || null,
        energy_level: data.energy_level,
        gratitudes: data.gratitudes.filter(g => g.trim()),
        checkin_date: today,
      })
      .select()
      .single();

    if (error) throw error;
    setTodayCheckIn(inserted as SelfCareCheckIn);
    return inserted;
  };

  const completeRitual = async (ritualType: string) => {
    if (!user || !todayCheckIn) return;

    const { data: updated, error } = await supabase
      .from("selfcare_checkins")
      .update({ ritual_completed: true, ritual_type: ritualType })
      .eq("id", todayCheckIn.id)
      .select()
      .single();

    if (error) throw error;
    setTodayCheckIn(updated as SelfCareCheckIn);
    return updated;
  };

  const addPillarAction = async (pillar: "mind" | "body" | "energy", actionText: string) => {
    if (!user) return null;

    const { data: inserted, error } = await supabase
      .from("selfcare_pillar_actions")
      .insert({
        user_id: user.id,
        pillar,
        action_text: actionText,
        action_date: today,
      })
      .select()
      .single();

    if (error) throw error;
    setTodayPillarActions(prev => [...prev, inserted as PillarAction]);
    return inserted;
  };

  return {
    todayCheckIn,
    weeklyCheckIns,
    todayPillarActions,
    weeklyPillarActions,
    loading,
    saveCheckIn,
    completeRitual,
    addPillarAction,
    refetch: fetchData,
  };
};
