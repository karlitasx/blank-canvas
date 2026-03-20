import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface HairDiagnosis {
  id: string;
  user_id: string;
  created_by: string;
  analysis: string;
  hydration_level: string | null;
  recommended_proteins: string | null;
  restrictions: string | null;
  alerts: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface HairProduct {
  id: string;
  schedule_id: string;
  name: string;
  brand: string | null;
  how_to_use: string | null;
  purchase_link: string | null;
  price_range: string | null;
  substitute: string | null;
  sort_order: number;
}

export interface HairWashingSteps {
  id: string;
  schedule_id: string;
  pre_poo: boolean;
  pre_poo_instructions: string | null;
  shampoo_instructions: string | null;
  shampoo_frequency: string | null;
  conditioner_instructions: string | null;
  mask_instructions: string | null;
  mask_duration: string | null;
  leave_in_instructions: string | null;
  finishing_instructions: string | null;
  drying_technique: string | null;
}

export interface HairRestriction {
  id: string;
  schedule_id: string;
  ingredients_to_avoid: string | null;
  contraindicated_procedures: string | null;
  min_chemical_interval: string | null;
}

export interface HairEvolution {
  id: string;
  user_id: string;
  photo_url: string;
  month_label: string;
  notes: string | null;
  added_by: string;
  created_at: string;
}

export interface HairWeeklyCheckin {
  id: string;
  user_id: string;
  schedule_id: string;
  week_number: number;
  feedback: string;
  created_at: string;
}

export interface HairGoal {
  id: string;
  user_id: string;
  main_goal: string;
  target_length: string | null;
  target_date: string | null;
  brightness_progress: number;
  elasticity_progress: number;
  softness_progress: number;
  overall_progress: number;
  created_by: string;
}

export interface HairYaraTips {
  id: string;
  user_id: string;
  tips_content: string | null;
  personal_message: string | null;
  nutrition_tips: string | null;
}

export const useHairClientData = (scheduleId?: string) => {
  const { user } = useAuth();
  const [diagnosis, setDiagnosis] = useState<HairDiagnosis | null>(null);
  const [products, setProducts] = useState<HairProduct[]>([]);
  const [washingSteps, setWashingSteps] = useState<HairWashingSteps | null>(null);
  const [restrictions, setRestrictions] = useState<HairRestriction | null>(null);
  const [evolution, setEvolution] = useState<HairEvolution[]>([]);
  const [checkins, setCheckins] = useState<HairWeeklyCheckin[]>([]);
  const [goals, setGoals] = useState<HairGoal | null>(null);
  const [tips, setTips] = useState<HairYaraTips | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      const [diagRes, evoRes, goalRes, tipsRes] = await Promise.all([
        supabase.from("hair_diagnoses" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("hair_evolution" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("hair_goals" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("hair_yara_tips" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      setDiagnosis((diagRes.data as unknown as HairDiagnosis) || null);
      setEvolution((evoRes.data as unknown as HairEvolution[]) || []);
      setGoals((goalRes.data as unknown as HairGoal) || null);
      setTips((tipsRes.data as unknown as HairYaraTips) || null);

      if (scheduleId) {
        const [prodRes, washRes, restRes, checkinRes] = await Promise.all([
          supabase.from("hair_products" as any).select("*").eq("schedule_id", scheduleId).order("sort_order"),
          supabase.from("hair_washing_steps" as any).select("*").eq("schedule_id", scheduleId).maybeSingle(),
          supabase.from("hair_restrictions" as any).select("*").eq("schedule_id", scheduleId).maybeSingle(),
          supabase.from("hair_weekly_checkins" as any).select("*").eq("user_id", user.id).eq("schedule_id", scheduleId).order("week_number"),
        ]);

        setProducts((prodRes.data as unknown as HairProduct[]) || []);
        setWashingSteps((washRes.data as unknown as HairWashingSteps) || null);
        setRestrictions((restRes.data as unknown as HairRestriction) || null);
        setCheckins((checkinRes.data as unknown as HairWeeklyCheckin[]) || []);
      }
    } catch (err) {
      console.error("Error fetching hair client data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, scheduleId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitCheckin = async (scheduleId: string, weekNumber: number, feedback: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("hair_weekly_checkins" as any)
      .insert({ user_id: user.id, schedule_id: scheduleId, week_number: weekNumber, feedback })
      .select()
      .single();
    if (error) throw error;
    setCheckins(prev => [...prev, data as unknown as HairWeeklyCheckin]);
    return data;
  };

  return {
    diagnosis,
    products,
    washingSteps,
    restrictions,
    evolution,
    checkins,
    goals,
    tips,
    loading,
    submitCheckin,
    refetch: fetchData,
  };
};
