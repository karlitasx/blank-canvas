import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BusinessExpense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  expense_date: string;
}

export const BUSINESS_EXPENSE_CATEGORIES = [
  { value: "material", label: "Material", color: "#f97316" },
  { value: "marketing", label: "Marketing", color: "#ec4899" },
  { value: "ferramentas", label: "Ferramentas", color: "#3b82f6" },
  { value: "impostos", label: "Impostos", color: "#ef4444" },
  { value: "outros", label: "Outros", color: "#6b7280" },
];

export const useBusinessExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user) { setExpenses([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("business_expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false });
      if (error) throw error;
      setExpenses((data || []).map(e => ({
        id: e.id, amount: Number(e.amount), category: e.category,
        description: e.description, expense_date: e.expense_date,
      })));
    } catch (e) { console.error("Error fetching expenses:", e); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: Omit<BusinessExpense, "id">) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("business_expenses").insert({
        user_id: user.id, amount: expense.amount, category: expense.category,
        description: expense.description, expense_date: expense.expense_date,
      });
      if (error) throw error;
      await fetchExpenses();
    } catch (e) { console.error("Error adding expense:", e); }
  }, [user, fetchExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await supabase.from("business_expenses").delete().eq("id", id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (e) { console.error("Error deleting expense:", e); }
  }, [user]);

  const now = new Date();
  const monthlyTotal = expenses
    .filter(e => { const d = new Date(e.expense_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryData = BUSINESS_EXPENSE_CATEGORIES.map(cat => ({
    name: cat.label,
    value: expenses
      .filter(e => e.category === cat.value && new Date(e.expense_date).getMonth() === now.getMonth() && new Date(e.expense_date).getFullYear() === now.getFullYear())
      .reduce((sum, e) => sum + e.amount, 0),
    color: cat.color,
  })).filter(c => c.value > 0);

  return { expenses, isLoading, addExpense, deleteExpense, monthlyTotal, categoryData, refetch: fetchExpenses };
};
