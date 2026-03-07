import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface HabitData {
  id: string;
  name: string;
  emoji: string;
  category: string;
  categoryColor: string;
  streak: number;
  bestStreak: number;
  reminderTime?: string;
  completed: boolean;
  createdAt: string;
  frequencyType: "daily" | "specific_days" | "times_per_week" | "interval";
  frequencyDays?: string[];
  frequencyTimesPerWeek?: number;
  frequencyIntervalDays?: number;
  goalDays?: number;
  motivation?: string;
}

const getToday = () => new Date().toISOString().split("T")[0];

export const useSupabaseHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [todayCompletions, setTodayCompletions] = useState<Set<string>>(new Set());

  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setIsLoaded(true);
      return;
    }

    try {
      const today = getToday();

      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (habitsError) throw habitsError;

      const { data: completionsData, error: completionsError } = await supabase
        .from("habit_completions")
        .select("habit_id")
        .eq("user_id", user.id)
        .eq("completed_date", today);

      if (completionsError) throw completionsError;

      const completedIds = new Set(completionsData?.map(c => c.habit_id) || []);
      setTodayCompletions(completedIds);

      const mappedHabits: HabitData[] = (habitsData || []).map(h => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        category: h.category,
        categoryColor: h.category_color,
        streak: h.streak,
        bestStreak: h.best_streak,
        reminderTime: h.reminder_time || undefined,
        completed: completedIds.has(h.id),
        createdAt: h.created_at,
        frequencyType: ((h as any).frequency_type || "daily") as HabitData["frequencyType"],
        frequencyDays: (h as any).frequency_days || undefined,
        frequencyTimesPerWeek: (h as any).frequency_times_per_week || undefined,
        frequencyIntervalDays: (h as any).frequency_interval_days || undefined,
        goalDays: (h as any).goal_days || undefined,
        motivation: (h as any).motivation || undefined,
      }));

      setHabits(mappedHabits);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const toggleHabit = useCallback(async (
    id: string,
    checkIn?: { mood: string; difficulty: number; note?: string }
  ): Promise<{ newStreak: number; streakIncreased: boolean }> => {
    if (!user) return { newStreak: 0, streakIncreased: false };

    const habit = habits.find(h => h.id === id);
    if (!habit) return { newStreak: 0, streakIncreased: false };

    const today = getToday();
    const wasCompleted = habit.completed;
    const newCompleted = !wasCompleted;

    let newStreak = habit.streak;
    let streakIncreased = false;

    try {
      if (newCompleted) {
        newStreak = habit.streak + 1;
        streakIncreased = true;
        const newBestStreak = Math.max(habit.bestStreak, newStreak);

        const insertData: any = {
          habit_id: id,
          user_id: user.id,
          completed_date: today,
        };
        if (checkIn) {
          insertData.mood = checkIn.mood;
          insertData.difficulty = checkIn.difficulty;
          if (checkIn.note) insertData.note = checkIn.note;
        }

        await supabase.from("habit_completions").insert(insertData);

        await supabase
          .from("habits")
          .update({ streak: newStreak, best_streak: newBestStreak })
          .eq("id", id);

        setHabits(prev => prev.map(h =>
          h.id === id
            ? { ...h, completed: true, streak: newStreak, bestStreak: newBestStreak }
            : h
        ));
        setTodayCompletions(prev => new Set([...prev, id]));
      } else {
        newStreak = Math.max(0, habit.streak - 1);

        await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", id)
          .eq("user_id", user.id)
          .eq("completed_date", today);

        await supabase
          .from("habits")
          .update({ streak: newStreak })
          .eq("id", id);

        setHabits(prev => prev.map(h =>
          h.id === id
            ? { ...h, completed: false, streak: newStreak }
            : h
        ));
        setTodayCompletions(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
    }

    return { newStreak, streakIncreased };
  }, [user, habits]);

  const addHabit = useCallback(async (habit: {
    name: string;
    emoji: string;
    category: string;
    categoryColor: string;
    reminderTime?: string;
    frequencyType?: string;
    frequencyDays?: string[];
    frequencyTimesPerWeek?: number;
    frequencyIntervalDays?: number;
    goalDays?: number;
    motivation?: string;
  }) => {
    if (!user) return null;

    try {
      const insertData: any = {
        user_id: user.id,
        name: habit.name,
        emoji: habit.emoji,
        category: habit.category,
        category_color: habit.categoryColor,
        reminder_time: habit.reminderTime || null,
        frequency_type: habit.frequencyType || "daily",
        frequency_days: habit.frequencyDays || [],
        frequency_times_per_week: habit.frequencyTimesPerWeek || null,
        frequency_interval_days: habit.frequencyIntervalDays || null,
        goal_days: habit.goalDays || null,
        motivation: habit.motivation || null,
      };

      const { data, error } = await supabase
        .from("habits")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newHabit: HabitData = {
        id: data.id,
        name: data.name,
        emoji: data.emoji,
        category: data.category,
        categoryColor: data.category_color,
        streak: data.streak,
        bestStreak: data.best_streak,
        reminderTime: data.reminder_time || undefined,
        completed: false,
        createdAt: data.created_at,
        frequencyType: ((data as any).frequency_type || "daily") as HabitData["frequencyType"],
        frequencyDays: (data as any).frequency_days || undefined,
        frequencyTimesPerWeek: (data as any).frequency_times_per_week || undefined,
        frequencyIntervalDays: (data as any).frequency_interval_days || undefined,
        goalDays: (data as any).goal_days || undefined,
        motivation: (data as any).motivation || undefined,
      };

      setHabits(prev => [newHabit, ...prev]);
      return newHabit;
    } catch (error) {
      console.error("Error adding habit:", error);
      return null;
    }
  }, [user]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await supabase.from("habit_completions").delete().eq("habit_id", id);
      await supabase.from("habits").delete().eq("id", id);
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  }, [user]);

  const updateHabit = useCallback(async (id: string, updates: Partial<HabitData>) => {
    if (!user) return;
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.categoryColor !== undefined) dbUpdates.category_color = updates.categoryColor;
      if (updates.reminderTime !== undefined) dbUpdates.reminder_time = updates.reminderTime;

      await supabase.from("habits").update(dbUpdates).eq("id", id);
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  }, [user]);

  const getHabitHistory = useCallback(async (habitId: string, days: number = 30) => {
    if (!user) return [];
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("habit_completions")
        .select("completed_date")
        .eq("habit_id", habitId)
        .eq("user_id", user.id)
        .gte("completed_date", startDate.toISOString().split("T")[0])
        .lte("completed_date", today.toISOString().split("T")[0]);

      if (error) throw error;
      const completedDates = new Set(data?.map(d => d.completed_date) || []);

      const result: { date: string; completed: boolean }[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        result.push({ date: dateStr, completed: completedDates.has(dateStr) });
      }
      return result.reverse();
    } catch (error) {
      console.error("Error fetching habit history:", error);
      return [];
    }
  }, [user]);

  const getMonthlyConsistency = useCallback(async (habitId: string): Promise<number> => {
    if (!user) return 0;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysSoFar = now.getDate();

      const { data, error } = await supabase
        .from("habit_completions")
        .select("completed_date")
        .eq("habit_id", habitId)
        .eq("user_id", user.id)
        .gte("completed_date", monthStart.toISOString().split("T")[0])
        .lte("completed_date", now.toISOString().split("T")[0]);

      if (error) throw error;
      const completions = data?.length || 0;

      // Calculate expected completions based on frequency
      let expected = daysSoFar;
      if (habit.frequencyType === "specific_days" && habit.frequencyDays) {
        const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        let count = 0;
        for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (habit.frequencyDays.some(fd => dayMap[fd] === dayOfWeek)) count++;
        }
        expected = count;
      } else if (habit.frequencyType === "times_per_week" && habit.frequencyTimesPerWeek) {
        expected = Math.ceil((daysSoFar / 7) * habit.frequencyTimesPerWeek);
      } else if (habit.frequencyType === "interval" && habit.frequencyIntervalDays) {
        expected = Math.ceil(daysSoFar / habit.frequencyIntervalDays);
      }

      return expected > 0 ? Math.min(Math.round((completions / expected) * 100), 100) : 0;
    } catch {
      return 0;
    }
  }, [user, habits]);

  const getStats = useCallback(() => {
    const completedToday = habits.filter(h => h.completed).length;
    const totalHabits = habits.length;
    const longestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    const currentTotalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

    return {
      completedToday,
      totalHabits,
      progressPercent: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
      longestStreak,
      currentTotalStreak,
    };
  }, [habits]);

  return {
    habits,
    isLoaded,
    toggleHabit,
    addHabit,
    deleteHabit,
    updateHabit,
    getHabitHistory,
    getMonthlyConsistency,
    getStats,
    refetch: fetchHabits,
  };
};
