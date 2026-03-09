import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_name: string;
  color: string;
  is_active: boolean;
}

export const usePaymentMethods = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchMethods = useCallback(async () => {
    if (!user) { setMethods([]); setIsLoaded(true); return; }
    try {
      const { data, error } = await (supabase.from("payment_methods" as any) as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMethods(
        (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          icon_name: d.icon_name,
          color: d.color,
          is_active: d.is_active,
        }))
      );
    } catch (e) {
      console.error("Error fetching payment methods:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const addMethod = useCallback(async (method: Omit<PaymentMethod, "id">) => {
    if (!user) return null;
    try {
      const { data, error } = await (supabase.from("payment_methods" as any) as any)
        .insert({ user_id: user.id, ...method })
        .select()
        .single();
      if (error) throw error;
      const newMethod: PaymentMethod = {
        id: data.id, name: data.name, type: data.type,
        icon_name: data.icon_name, color: data.color, is_active: data.is_active,
      };
      setMethods((prev) => [...prev, newMethod]);
      return newMethod;
    } catch (e) { console.error("Error adding payment method:", e); return null; }
  }, [user]);

  const updateMethod = useCallback(async (id: string, updates: Partial<Omit<PaymentMethod, "id">>) => {
    if (!user) return;
    try {
      const { error } = await (supabase.from("payment_methods" as any) as any).update(updates).eq("id", id);
      if (error) throw error;
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    } catch (e) { console.error("Error updating payment method:", e); }
  }, [user]);

  const deleteMethod = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const { error } = await (supabase.from("payment_methods" as any) as any).delete().eq("id", id);
      if (error) throw error;
      setMethods((prev) => prev.filter((m) => m.id !== id));
    } catch (e) { console.error("Error deleting payment method:", e); }
  }, [user]);

  return { methods, isLoaded, addMethod, updateMethod, deleteMethod, refetch: fetchMethods };
};
