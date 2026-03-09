import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BusinessSale {
  id: string;
  amount: number;
  client_name: string | null;
  payment_method: string;
  notes: string | null;
  sale_date: string;
}

export const useBusinessSales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<BusinessSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    if (!user) { setSales([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("business_sales")
        .select("*")
        .eq("user_id", user.id)
        .order("sale_date", { ascending: false });
      if (error) throw error;
      setSales((data || []).map(s => ({
        id: s.id, amount: Number(s.amount), client_name: s.client_name,
        payment_method: s.payment_method, notes: s.notes, sale_date: s.sale_date,
      })));
    } catch (e) { console.error("Error fetching sales:", e); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const addSale = useCallback(async (sale: Omit<BusinessSale, "id">) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("business_sales").insert({
        user_id: user.id, amount: sale.amount, client_name: sale.client_name,
        payment_method: sale.payment_method, notes: sale.notes, sale_date: sale.sale_date,
      });
      if (error) throw error;
      await fetchSales();
    } catch (e) { console.error("Error adding sale:", e); }
  }, [user, fetchSales]);

  const deleteSale = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await supabase.from("business_sales").delete().eq("id", id);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (e) { console.error("Error deleting sale:", e); }
  }, [user]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTotal = sales
    .filter(s => { const d = new Date(s.sale_date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
    .reduce((sum, s) => sum + s.amount, 0);

  const yearlyTotal = sales
    .filter(s => new Date(s.sale_date).getFullYear() === currentYear)
    .reduce((sum, s) => sum + s.amount, 0);

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const total = sales
      .filter(s => { const d = new Date(s.sale_date); return d.getMonth() === i && d.getFullYear() === currentYear; })
      .reduce((sum, s) => sum + s.amount, 0);
    return { month: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i], total };
  });

  return { sales, isLoading, addSale, deleteSale, monthlyTotal, yearlyTotal, monthlyData, refetch: fetchSales };
};
