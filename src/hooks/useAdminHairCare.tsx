import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { HairProfile, HairSchedule, HairScheduleItem, HairTreatmentLog } from "./useHairCare";

interface SubscriberWithProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
  hair_profile: HairProfile | null;
  has_schedule: boolean;
}

export const useAdminHairCare = () => {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<SubscriberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get all active subscribers
      const { data: subs } = await supabase
        .from("subscriptions" as any)
        .select("user_id")
        .eq("status", "active");

      if (!subs || subs.length === 0) {
        setSubscribers([]);
        setLoading(false);
        return;
      }

      const userIds = (subs as any[]).map(s => s.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      // Get hair profiles
      const { data: hairProfiles } = await supabase
        .from("hair_profiles" as any)
        .select("*")
        .in("user_id", userIds);

      // Get active schedules
      const { data: schedules } = await supabase
        .from("hair_schedules" as any)
        .select("user_id")
        .eq("status", "active")
        .in("user_id", userIds);

      const scheduleUserIds = new Set((schedules as any[] || []).map((s: any) => s.user_id));

      const result: SubscriberWithProfile[] = userIds.map(uid => {
        const profile = (profiles || []).find(p => p.user_id === uid);
        const hp = ((hairProfiles as any[]) || []).find((h: any) => h.user_id === uid);
        return {
          user_id: uid,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          hair_profile: hp || null,
          has_schedule: scheduleUserIds.has(uid),
        };
      });

      setSubscribers(result);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const getUserLogs = async (userId: string): Promise<HairTreatmentLog[]> => {
    const { data } = await supabase
      .from("hair_treatment_logs" as any)
      .select("*")
      .eq("user_id", userId)
      .order("treatment_date", { ascending: false });
    return (data as unknown as HairTreatmentLog[]) || [];
  };

  const createSchedule = async (
    userId: string,
    title: string,
    durationWeeks: number,
    startsAt: string,
    notes: string | null,
    items: Omit<HairScheduleItem, "id" | "schedule_id" | "created_at">[]
  ) => {
    if (!user) return;

    // Deactivate existing active schedules
    await supabase
      .from("hair_schedules" as any)
      .update({ status: "completed" })
      .eq("user_id", userId)
      .eq("status", "active");

    // Create new schedule
    const { data: schedule, error } = await supabase
      .from("hair_schedules" as any)
      .insert({
        user_id: userId,
        created_by: user.id,
        title,
        duration_weeks: durationWeeks,
        starts_at: startsAt,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert items
    if (items.length > 0) {
      const itemsToInsert = items.map((item, idx) => ({
        ...item,
        schedule_id: (schedule as any).id,
        sort_order: idx,
      }));

      const { error: itemsError } = await supabase
        .from("hair_schedule_items" as any)
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    await fetchSubscribers();
    return schedule;
  };

  return {
    subscribers,
    loading,
    fetchSubscribers,
    getUserLogs,
    createSchedule,
  };
};
