import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wish } from "@/components/wishlist/WishCard";

export const useSupabaseWishlist = () => {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch wishlist from Supabase
  const fetchWishes = useCallback(async () => {
    if (!user) {
      setWishes([]);
      setIsLoaded(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedWishes: Wish[] = (data || []).map(w => ({
        id: w.id,
        name: w.name,
        category: "Geral", // Default category since DB doesn't have it
        totalValue: Number(w.target_amount),
        savedValue: Number(w.current_amount),
        priority: w.priority as "high" | "medium" | "low",
        createdAt: new Date(w.created_at),
        completed: w.is_completed,
      }));

      setWishes(mappedWishes);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const addWish = useCallback(async (wish: Omit<Wish, "id" | "createdAt" | "completed">) => {
    if (!user) return null;

    try {
      const isCompleted = wish.savedValue >= wish.totalValue;

      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          name: wish.name,
          emoji: "🎯",
          target_amount: wish.totalValue,
          current_amount: wish.savedValue,
          priority: wish.priority,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      const newWish: Wish = {
        id: data.id,
        name: data.name,
        category: wish.category,
        totalValue: Number(data.target_amount),
        savedValue: Number(data.current_amount),
        priority: data.priority as "high" | "medium" | "low",
        createdAt: new Date(data.created_at),
        completed: data.is_completed,
        imageUrl: wish.imageUrl,
        link: wish.link,
        targetDate: wish.targetDate,
      };

      setWishes(prev => [newWish, ...prev]);
      return newWish;
    } catch (error) {
      console.error("Error adding wish:", error);
      return null;
    }
  }, [user]);

  const updateWish = useCallback(async (id: string, updates: Partial<Wish>) => {
    if (!user) return;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.totalValue !== undefined) dbUpdates.target_amount = updates.totalValue;
      if (updates.savedValue !== undefined) dbUpdates.current_amount = updates.savedValue;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      
      // Check if completed
      const wish = wishes.find(w => w.id === id);
      if (wish) {
        const newSavedValue = updates.savedValue ?? wish.savedValue;
        const totalValue = updates.totalValue ?? wish.totalValue;
        const isNowCompleted = newSavedValue >= totalValue;
        
        dbUpdates.is_completed = isNowCompleted;
        if (isNowCompleted && !wish.completed) {
          dbUpdates.completed_at = new Date().toISOString();
        }
      }

      await supabase
        .from("wishlist")
        .update(dbUpdates)
        .eq("id", id);

      setWishes(prev => prev.map(w => {
        if (w.id === id) {
          const updated = { ...w, ...updates };
          updated.completed = updated.savedValue >= updated.totalValue;
          return updated;
        }
        return w;
      }));
    } catch (error) {
      console.error("Error updating wish:", error);
    }
  }, [user, wishes]);

  const addValueToWish = useCallback(async (id: string, value: number) => {
    const wish = wishes.find(w => w.id === id);
    if (!wish) return;

    const newSavedValue = wish.savedValue + value;
    await updateWish(id, { savedValue: newSavedValue });
  }, [wishes, updateWish]);

  const deleteWish = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from("wishlist")
        .delete()
        .eq("id", id);

      setWishes(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error("Error deleting wish:", error);
    }
  }, [user]);

  // Computed values
  const activeWishes = wishes.filter(w => !w.completed);
  const completedWishes = wishes.filter(w => w.completed);
  
  const totalValue = activeWishes.reduce((sum, w) => sum + w.totalValue, 0);
  const totalSaved = activeWishes.reduce((sum, w) => sum + w.savedValue, 0);
  const totalRemaining = totalValue - totalSaved;
  const overallProgress = totalValue > 0 ? (totalSaved / totalValue) * 100 : 0;

  return {
    wishes,
    activeWishes,
    completedWishes,
    isLoaded,
    addWish,
    updateWish,
    addValueToWish,
    deleteWish,
    refetch: fetchWishes,
    stats: {
      totalValue,
      totalSaved,
      totalRemaining,
      overallProgress,
    },
  };
};
