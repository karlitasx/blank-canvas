import { useState, useEffect, useCallback } from "react";

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
}

export interface HabitHistory {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface HabitsState {
  habits: HabitData[];
  history: HabitHistory[];
  lastCheckedDate: string;
}

const STORAGE_KEY = "vidaflow_habits";
const HISTORY_KEY = "vidaflow_habits_history";

const getToday = () => new Date().toISOString().split("T")[0];

// No default habits - users start with empty state
const defaultHabits: HabitData[] = [];

export const useHabits = () => {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [history, setHistory] = useState<HabitHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedHabits = localStorage.getItem(STORAGE_KEY);
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        const lastCheckedDate = localStorage.getItem("vidaflow_last_checked");
        const today = getToday();

        let loadedHabits: HabitData[] = savedHabits 
          ? JSON.parse(savedHabits) 
          : defaultHabits;

        let loadedHistory: HabitHistory[] = savedHistory 
          ? JSON.parse(savedHistory) 
          : [];

        // Check if it's a new day - reset completions and update streaks
        if (lastCheckedDate && lastCheckedDate !== today) {
          loadedHabits = loadedHabits.map((habit) => {
            // If habit was not completed yesterday, reset streak
            const yesterdayCompleted = habit.completed;
            
            return {
              ...habit,
              completed: false,
              streak: yesterdayCompleted ? habit.streak : 0,
            };
          });
        }

        // Ensure all habits have bestStreak property (migration)
        loadedHabits = loadedHabits.map((habit) => ({
          ...habit,
          bestStreak: habit.bestStreak ?? habit.streak,
          createdAt: habit.createdAt ?? new Date().toISOString(),
        }));

        setHabits(loadedHabits);
        setHistory(loadedHistory);
        localStorage.setItem("vidaflow_last_checked", today);
      } catch (error) {
        console.error("Error loading habits:", error);
        setHabits(defaultHabits);
      }
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Save to localStorage whenever habits change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  // Save history to localStorage
  useEffect(() => {
    if (isLoaded && history.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const toggleHabit = useCallback((id: string): { newStreak: number; streakIncreased: boolean } => {
    let result = { newStreak: 0, streakIncreased: false };
    const today = getToday();

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        const wasCompleted = habit.completed;
        const newCompleted = !wasCompleted;
        
        let newStreak = habit.streak;
        let streakIncreased = false;

        if (newCompleted) {
          // Completing the habit
          newStreak = habit.streak + 1;
          streakIncreased = true;
        } else {
          // Uncompleting the habit
          newStreak = Math.max(0, habit.streak - 1);
        }

        const newBestStreak = Math.max(habit.bestStreak, newStreak);

        result = { newStreak, streakIncreased };

        return {
          ...habit,
          completed: newCompleted,
          streak: newStreak,
          bestStreak: newBestStreak,
        };
      })
    );

    // Record in history
    setHistory((prev) => {
      const existingIndex = prev.findIndex(
        (h) => h.habitId === id && h.date === today
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], completed: !updated[existingIndex].completed };
        return updated;
      }

      return [...prev, { habitId: id, date: today, completed: true }];
    });

    return result;
  }, []);

  const addHabit = useCallback((habit: Omit<HabitData, "id" | "streak" | "bestStreak" | "completed" | "createdAt">) => {
    const newHabit: HabitData = {
      ...habit,
      id: Date.now().toString(),
      streak: 0,
      bestStreak: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setHabits((prev) => [newHabit, ...prev]);
    return newHabit;
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHistory((prev) => prev.filter((h) => h.habitId !== id));
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<HabitData>) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      )
    );
  }, []);

  const getHabitHistory = useCallback((habitId: string, days: number = 30) => {
    const today = new Date();
    const historyMap = new Map<string, boolean>();

    // Fill with habit history
    history
      .filter((h) => h.habitId === habitId)
      .forEach((h) => historyMap.set(h.date, h.completed));

    // Generate last N days
    const result: { date: string; completed: boolean }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        completed: historyMap.get(dateStr) ?? false,
      });
    }

    return result.reverse();
  }, [history]);

  const getStats = useCallback(() => {
    const completedToday = habits.filter((h) => h.completed).length;
    const totalHabits = habits.length;
    const longestStreak = Math.max(...habits.map((h) => h.bestStreak), 0);
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
    history,
    isLoaded,
    toggleHabit,
    addHabit,
    deleteHabit,
    updateHabit,
    getHabitHistory,
    getStats,
  };
};
