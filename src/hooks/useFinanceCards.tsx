import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FinanceCard {
  id: string;
  name: string;
  card_type: "credit" | "debit";
  brand: string;
  last_digits: string;
  card_color: string;
  credit_limit: number;
  closing_day: number;
  due_day: number;
  is_active: boolean;
}

export const useFinanceCards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<FinanceCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCards = useCallback(async () => {
    if (!user) { setCards([]); setIsLoaded(true); return; }
    try {
      const { data, error } = await supabase
        .from("finance_cards" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setCards(
        (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          card_type: d.card_type as "credit" | "debit",
          brand: d.brand,
          last_digits: d.last_digits || "",
          card_color: d.card_color,
          credit_limit: Number(d.credit_limit) || 0,
          closing_day: d.closing_day || 1,
          due_day: d.due_day || 10,
          is_active: d.is_active,
        }))
      );
    } catch (e) {
      console.error("Error fetching cards:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const addCard = useCallback(async (card: Omit<FinanceCard, "id">) => {
    if (!user) return null;
    try {
      const { data, error } = await (supabase.from("finance_cards" as any) as any)
        .insert({ user_id: user.id, ...card })
        .select()
        .single();
      if (error) throw error;
      const newCard: FinanceCard = {
        id: data.id, name: data.name,
        card_type: data.card_type, brand: data.brand,
        last_digits: data.last_digits || "", card_color: data.card_color,
        credit_limit: Number(data.credit_limit) || 0,
        closing_day: data.closing_day, due_day: data.due_day,
        is_active: data.is_active,
      };
      setCards((prev) => [...prev, newCard]);
      return newCard;
    } catch (e) { console.error("Error adding card:", e); return null; }
  }, [user]);

  const updateCard = useCallback(async (id: string, updates: Partial<Omit<FinanceCard, "id">>) => {
    if (!user) return;
    try {
      const { error } = await (supabase.from("finance_cards" as any) as any).update(updates).eq("id", id);
      if (error) throw error;
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    } catch (e) { console.error("Error updating card:", e); }
  }, [user]);

  const deleteCard = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const { error } = await (supabase.from("finance_cards" as any) as any).delete().eq("id", id);
      if (error) throw error;
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (e) { console.error("Error deleting card:", e); }
  }, [user]);

  return { cards, isLoaded, addCard, updateCard, deleteCard, refetch: fetchCards };
};
