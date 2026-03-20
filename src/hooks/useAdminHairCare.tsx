import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { HairProfile, HairSchedule, HairScheduleItem, HairTreatmentLog } from "./useHairCare";
import type {
  HairDiagnosis, HairProduct, HairWashingSteps,
  HairRestriction, HairEvolution, HairWeeklyCheckin,
  HairGoal, HairYaraTips,
} from "./useHairClientData";

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
      // Get all users with hair_client_access
      const { data: accessData } = await supabase
        .from("hair_client_access")
        .select("user_id")
        .eq("is_active", true);

      // Also get active subscribers
      const { data: subs } = await supabase
        .from("subscriptions" as any)
        .select("user_id")
        .eq("status", "active");

      // Merge unique user IDs
      const accessIds = (accessData || []).map(a => a.user_id);
      const subIds = ((subs as any[]) || []).map(s => s.user_id);
      const userIds = [...new Set([...accessIds, ...subIds])];

      if (userIds.length === 0) {
        setSubscribers([]);
        setLoading(false);
        return;
      }

      const [profilesRes, hairProfilesRes, schedulesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds),
        supabase.from("hair_profiles" as any).select("*").in("user_id", userIds),
        supabase.from("hair_schedules" as any).select("user_id").eq("status", "active").in("user_id", userIds),
      ]);

      const scheduleUserIds = new Set(((schedulesRes.data as any[]) || []).map((s: any) => s.user_id));

      const result: SubscriberWithProfile[] = userIds.map(uid => {
        const profile = (profilesRes.data || []).find(p => p.user_id === uid);
        const hp = ((hairProfilesRes.data as any[]) || []).find((h: any) => h.user_id === uid);
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
    userId: string, title: string, durationWeeks: number,
    startsAt: string, notes: string | null,
    items: Omit<HairScheduleItem, "id" | "schedule_id" | "created_at">[]
  ) => {
    if (!user) return;
    await supabase.from("hair_schedules" as any).update({ status: "completed" }).eq("user_id", userId).eq("status", "active");
    const { data: schedule, error } = await supabase.from("hair_schedules" as any)
      .insert({ user_id: userId, created_by: user.id, title, duration_weeks: durationWeeks, starts_at: startsAt, notes })
      .select().single();
    if (error) throw error;
    if (items.length > 0) {
      const itemsToInsert = items.map((item, idx) => ({ ...item, schedule_id: (schedule as any).id, sort_order: idx }));
      const { error: itemsError } = await supabase.from("hair_schedule_items" as any).insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }
    await fetchSubscribers();
    return schedule;
  };

  // ---- Diagnosis CRUD ----
  const saveDiagnosis = async (userId: string, data: Partial<HairDiagnosis>) => {
    if (!user) return;
    const { data: existing } = await supabase.from("hair_diagnoses" as any).select("id").eq("user_id", userId).limit(1).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("hair_diagnoses" as any).update({ ...data, updated_at: new Date().toISOString() }).eq("id", (existing as any).id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("hair_diagnoses" as any).insert({ ...data, user_id: userId, created_by: user.id });
      if (error) throw error;
    }
  };

  // ---- Products CRUD ----
  const saveProducts = async (scheduleId: string, products: Partial<HairProduct>[]) => {
    // Delete existing and re-insert
    await supabase.from("hair_products" as any).delete().eq("schedule_id", scheduleId);
    if (products.length > 0) {
      const toInsert = products.map((p, i) => ({ ...p, schedule_id: scheduleId, sort_order: i }));
      const { error } = await supabase.from("hair_products" as any).insert(toInsert);
      if (error) throw error;
    }
  };

  // ---- Washing Steps CRUD ----
  const saveWashingSteps = async (scheduleId: string, data: Partial<HairWashingSteps>) => {
    const { data: existing } = await supabase.from("hair_washing_steps" as any).select("id").eq("schedule_id", scheduleId).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("hair_washing_steps" as any).update({ ...data, updated_at: new Date().toISOString() }).eq("id", (existing as any).id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("hair_washing_steps" as any).insert({ ...data, schedule_id: scheduleId });
      if (error) throw error;
    }
  };

  // ---- Restrictions CRUD ----
  const saveRestrictions = async (scheduleId: string, data: Partial<HairRestriction>) => {
    const { data: existing } = await supabase.from("hair_restrictions" as any).select("id").eq("schedule_id", scheduleId).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("hair_restrictions" as any).update(data).eq("id", (existing as any).id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("hair_restrictions" as any).insert({ ...data, schedule_id: scheduleId });
      if (error) throw error;
    }
  };

  // ---- Goals CRUD ----
  const saveGoals = async (userId: string, data: Partial<HairGoal>) => {
    if (!user) return;
    const { data: existing } = await supabase.from("hair_goals" as any).select("id").eq("user_id", userId).limit(1).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("hair_goals" as any).update({ ...data, updated_at: new Date().toISOString() }).eq("id", (existing as any).id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("hair_goals" as any).insert({ ...data, user_id: userId, created_by: user.id });
      if (error) throw error;
    }
  };

  // ---- Tips CRUD ----
  const saveTips = async (userId: string, data: Partial<HairYaraTips>) => {
    if (!user) return;
    const { data: existing } = await supabase.from("hair_yara_tips" as any).select("id").eq("user_id", userId).limit(1).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("hair_yara_tips" as any).update({ ...data, updated_at: new Date().toISOString() }).eq("id", (existing as any).id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("hair_yara_tips" as any).insert({ ...data, user_id: userId, created_by: user.id });
      if (error) throw error;
    }
  };

  // ---- Evolution ----
  const addEvolution = async (userId: string, photoUrl: string, monthLabel: string, notes?: string) => {
    if (!user) return;
    const { error } = await supabase.from("hair_evolution" as any).insert({ user_id: userId, added_by: user.id, photo_url: photoUrl, month_label: monthLabel, notes: notes || null });
    if (error) throw error;
  };

  // ---- Fetch all data for a client ----
  const getClientFullData = async (userId: string, scheduleId?: string) => {
    const [diagRes, evoRes, goalRes, tipsRes, checkinsRes] = await Promise.all([
      supabase.from("hair_diagnoses" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("hair_evolution" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("hair_goals" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("hair_yara_tips" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      scheduleId ? supabase.from("hair_weekly_checkins" as any).select("*").eq("user_id", userId).eq("schedule_id", scheduleId).order("week_number") : Promise.resolve({ data: [] }),
    ]);

    let products: any[] = [], washingSteps: any = null, restrictions: any = null;
    if (scheduleId) {
      const [prodRes, washRes, restRes] = await Promise.all([
        supabase.from("hair_products" as any).select("*").eq("schedule_id", scheduleId).order("sort_order"),
        supabase.from("hair_washing_steps" as any).select("*").eq("schedule_id", scheduleId).maybeSingle(),
        supabase.from("hair_restrictions" as any).select("*").eq("schedule_id", scheduleId).maybeSingle(),
      ]);
      products = (prodRes.data as any[]) || [];
      washingSteps = washRes.data || null;
      restrictions = restRes.data || null;
    }

    return {
      diagnosis: (diagRes.data as unknown as HairDiagnosis) || null,
      evolution: (evoRes.data as unknown as HairEvolution[]) || [],
      goals: (goalRes.data as unknown as HairGoal) || null,
      tips: (tipsRes.data as unknown as HairYaraTips) || null,
      checkins: (checkinsRes.data as unknown as HairWeeklyCheckin[]) || [],
      products: products as HairProduct[],
      washingSteps: washingSteps as HairWashingSteps | null,
      restrictions: restrictions as HairRestriction | null,
    };
  };

  // ---- Get active schedule for a user ----
  const getActiveSchedule = async (userId: string) => {
    const { data } = await supabase.from("hair_schedules" as any).select("*").eq("user_id", userId).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
    return (data as unknown as HairSchedule) || null;
  };

  return {
    subscribers, loading, fetchSubscribers, getUserLogs, createSchedule,
    saveDiagnosis, saveProducts, saveWashingSteps, saveRestrictions,
    saveGoals, saveTips, addEvolution, getClientFullData, getActiveSchedule,
  };
};
