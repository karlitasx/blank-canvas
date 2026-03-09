import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface HairProfile {
  id: string;
  user_id: string;
  hair_type: string;
  texture: string;
  main_problem: string;
  wash_frequency: string;
  goal: string;
  extra_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HairSchedule {
  id: string;
  user_id: string;
  created_by: string;
  title: string;
  duration_weeks: number;
  starts_at: string;
  status: string;
  notes: string | null;
  created_at: string;
  items?: HairScheduleItem[];
}

export interface HairScheduleItem {
  id: string;
  schedule_id: string;
  day_of_week: number;
  week_number: number;
  treatment_type: string;
  product_recommendation: string | null;
  yara_note: string | null;
  sort_order: number;
}

export interface HairTreatmentLog {
  id: string;
  user_id: string;
  schedule_item_id: string;
  completed_at: string;
  treatment_date: string;
  rating: string;
  hair_reaction: string | null;
  user_note: string | null;
}

export const useHairCare = () => {
  const { user } = useAuth();
  const [hairProfile, setHairProfile] = useState<HairProfile | null>(null);
  const [activeSchedule, setActiveSchedule] = useState<HairSchedule | null>(null);
  const [treatmentLogs, setTreatmentLogs] = useState<HairTreatmentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      const [profileRes, scheduleRes, logsRes] = await Promise.all([
        supabase.from("hair_profiles" as any).select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("hair_schedules" as any).select("*").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("hair_treatment_logs" as any).select("*").eq("user_id", user.id).order("treatment_date", { ascending: false }),
      ]);

      setHairProfile((profileRes.data as unknown as HairProfile) || null);
      setTreatmentLogs((logsRes.data as unknown as HairTreatmentLog[]) || []);

      if (scheduleRes.data) {
        const { data: items } = await supabase
          .from("hair_schedule_items" as any)
          .select("*")
          .eq("schedule_id", (scheduleRes.data as any).id)
          .order("week_number", { ascending: true })
          .order("day_of_week", { ascending: true });

        setActiveSchedule({
          ...(scheduleRes.data as HairSchedule),
          items: (items as HairScheduleItem[]) || [],
        });
      }
    } catch (err) {
      console.error("Error fetching hair care data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveHairProfile = async (data: Omit<HairProfile, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return;

    if (hairProfile) {
      const { data: updated, error } = await supabase
        .from("hair_profiles" as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", hairProfile.id)
        .select()
        .single();
      if (error) throw error;
      setHairProfile(updated as HairProfile);
    } else {
      const { data: inserted, error } = await supabase
        .from("hair_profiles" as any)
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      setHairProfile(inserted as HairProfile);
    }
  };

  const logTreatment = async (scheduleItemId: string, rating: string, hairReaction?: string, userNote?: string) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from("hair_treatment_logs" as any)
      .insert({
        user_id: user.id,
        schedule_item_id: scheduleItemId,
        rating,
        hair_reaction: hairReaction || null,
        user_note: userNote || null,
        treatment_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) throw error;
    setTreatmentLogs(prev => [inserted as HairTreatmentLog, ...prev]);
    return inserted;
  };

  return {
    hairProfile,
    activeSchedule,
    treatmentLogs,
    loading,
    saveHairProfile,
    logTreatment,
    refetch: fetchData,
  };
};
