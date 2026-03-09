import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DasPayment {
  id: string;
  reference_month: string;
  amount: number;
  status: string;
  paid_at: string | null;
}

export const useDasPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<DasPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!user) { setPayments([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("das_payments")
        .select("*")
        .eq("user_id", user.id)
        .order("reference_month", { ascending: false });
      if (error) throw error;
      setPayments((data || []).map(p => ({
        id: p.id, reference_month: p.reference_month, amount: Number(p.amount),
        status: p.status, paid_at: p.paid_at,
      })));
    } catch (e) { console.error("Error fetching DAS payments:", e); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const addPayment = useCallback(async (referenceMonth: string, amount: number) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("das_payments").insert({
        user_id: user.id, reference_month: referenceMonth, amount, status: "pendente",
      });
      if (error) throw error;
      await fetchPayments();
    } catch (e) { console.error("Error adding DAS payment:", e); }
  }, [user, fetchPayments]);

  const markAsPaid = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("das_payments").update({
        status: "pago", paid_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      await fetchPayments();
    } catch (e) { console.error("Error updating DAS payment:", e); }
  }, [user, fetchPayments]);

  return { payments, isLoading, addPayment, markAsPaid, refetch: fetchPayments };
};
