import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type GoalStatus = "planning" | "in_progress" | "paused" | "completed";

export interface FinanceGoal {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  status: GoalStatus;
  priority: string;
  target_date?: string;
  created_at: string;
}

export const useFinanceGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setIsLoaded(true);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("finance_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setGoals(
        (data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description || undefined,
          emoji: d.emoji,
          target_amount: Number(d.target_amount),
          current_amount: Number(d.current_amount),
          status: d.status as GoalStatus,
          priority: d.priority,
          target_date: d.target_date || undefined,
          created_at: d.created_at,
        }))
      );
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(
    async (goal: Omit<FinanceGoal, "id" | "created_at">) => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from("finance_goals")
          .insert({
            user_id: user.id,
            title: goal.title,
            description: goal.description,
            emoji: goal.emoji,
            target_amount: goal.target_amount,
            current_amount: goal.current_amount,
            status: goal.status,
            priority: goal.priority,
            target_date: goal.target_date,
          })
          .select()
          .single();

        if (error) throw error;

        const newGoal: FinanceGoal = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          emoji: data.emoji,
          target_amount: Number(data.target_amount),
          current_amount: Number(data.current_amount),
          status: data.status as GoalStatus,
          priority: data.priority,
          target_date: data.target_date || undefined,
          created_at: data.created_at,
        };
        setGoals((prev) => [...prev, newGoal]);
        return newGoal;
      } catch (error) {
        console.error("Error adding goal:", error);
        return null;
      }
    },
    [user]
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<Omit<FinanceGoal, "id" | "created_at">>) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from("finance_goals")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;

        setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
      } catch (error) {
        console.error("Error updating goal:", error);
      }
    },
    [user]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from("finance_goals")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setGoals((prev) => prev.filter((g) => g.id !== id));
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    },
    [user]
  );

  const changeStatus = useCallback(
    async (id: string, status: GoalStatus) => {
      await updateGoal(id, { status });
    },
    [updateGoal]
  );

  const addAmount = useCallback(
    async (id: string, amount: number) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      const newAmount = goal.current_amount + amount;
      const updates: Partial<FinanceGoal> = { current_amount: newAmount };
      if (newAmount >= goal.target_amount) {
        updates.status = "completed";
      }
      await updateGoal(id, updates);
    },
    [goals, updateGoal]
  );

  return { goals, isLoaded, addGoal, updateGoal, deleteGoal, changeStatus, addAmount };
};
