import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type BusinessType = "mei" | "simples_nacional" | "autonomo";

export interface BusinessSettings {
  id: string;
  user_id: string;
  business_type: BusinessType;
  company_name: string | null;
  cnpj: string | null;
}

export interface BusinessSale {
  id: string;
  sale_date: string;
  client_name: string | null;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface BusinessExpense {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface DasPayment {
  id: string;
  reference_month: string;
  amount: number;
  status: "pendente" | "pago";
  paid_at: string | null;
}

export interface FiscalReminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  reminder_type: string;
  is_completed: boolean;
}

const MEI_ANNUAL_LIMIT = 81000;

export const useBusinessFinance = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [sales, setSales] = useState<BusinessSale[]>([]);
  const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
  const [dasPayments, setDasPayments] = useState<DasPayment[]>([]);
  const [reminders, setReminders] = useState<FiscalReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const [settingsRes, salesRes, expensesRes, dasRes, remindersRes] = await Promise.all([
        supabase.from("business_settings" as any).select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("business_sales" as any).select("*").eq("user_id", user.id).order("sale_date", { ascending: false }),
        supabase.from("business_expenses" as any).select("*").eq("user_id", user.id).order("expense_date", { ascending: false }),
        supabase.from("das_payments" as any).select("*").eq("user_id", user.id).order("reference_month", { ascending: false }),
        supabase.from("fiscal_reminders" as any).select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
      ]);

      if (settingsRes.data) setSettings(settingsRes.data as any);
      setSales((salesRes.data as any) || []);
      setExpenses((expensesRes.data as any) || []);
      setDasPayments((dasRes.data as any) || []);
      setReminders((remindersRes.data as any) || []);
    } catch (err) {
      console.error("Error fetching business data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveSettings = useCallback(async (businessType: BusinessType, companyName?: string, cnpj?: string) => {
    if (!user) return;
    const payload = { user_id: user.id, business_type: businessType, company_name: companyName || null, cnpj: cnpj || null, updated_at: new Date().toISOString() };
    
    if (settings) {
      const { data } = await supabase.from("business_settings" as any).update(payload).eq("id", settings.id).select().single();
      if (data) setSettings(data as any);
    } else {
      const { data } = await supabase.from("business_settings" as any).insert(payload).select().single();
      if (data) setSettings(data as any);
    }
  }, [user, settings]);

  const addSale = useCallback(async (sale: Omit<BusinessSale, "id" | "created_at">) => {
    if (!user) return;
    const { data } = await supabase.from("business_sales" as any).insert({ ...sale, user_id: user.id }).select().single();
    if (data) setSales(prev => [data as any, ...prev]);
  }, [user]);

  const deleteSale = useCallback(async (id: string) => {
    await supabase.from("business_sales" as any).delete().eq("id", id);
    setSales(prev => prev.filter(s => s.id !== id));
  }, []);

  const addExpense = useCallback(async (expense: Omit<BusinessExpense, "id" | "created_at">) => {
    if (!user) return;
    const { data } = await supabase.from("business_expenses" as any).insert({ ...expense, user_id: user.id }).select().single();
    if (data) setExpenses(prev => [data as any, ...prev]);
  }, [user]);

  const deleteExpense = useCallback(async (id: string) => {
    await supabase.from("business_expenses" as any).delete().eq("id", id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const toggleDasStatus = useCallback(async (id: string) => {
    const das = dasPayments.find(d => d.id === id);
    if (!das) return;
    const newStatus = das.status === "pago" ? "pendente" : "pago";
    const { data } = await supabase.from("das_payments" as any)
      .update({ status: newStatus, paid_at: newStatus === "pago" ? new Date().toISOString() : null })
      .eq("id", id).select().single();
    if (data) setDasPayments(prev => prev.map(d => d.id === id ? data as any : d));
  }, [dasPayments]);

  const addDasPayment = useCallback(async (referenceMonth: string, amount: number = 71.60) => {
    if (!user) return;
    const { data } = await supabase.from("das_payments" as any)
      .insert({ user_id: user.id, reference_month: referenceMonth, amount, status: "pendente" })
      .select().single();
    if (data) setDasPayments(prev => [data as any, ...prev]);
  }, [user]);

  const addReminder = useCallback(async (reminder: Omit<FiscalReminder, "id" | "is_completed">) => {
    if (!user) return;
    const { data } = await supabase.from("fiscal_reminders" as any)
      .insert({ ...reminder, user_id: user.id, is_completed: false })
      .select().single();
    if (data) setReminders(prev => [...prev, data as any]);
  }, [user]);

  const toggleReminder = useCallback(async (id: string) => {
    const r = reminders.find(r => r.id === id);
    if (!r) return;
    const { data } = await supabase.from("fiscal_reminders" as any)
      .update({ is_completed: !r.is_completed }).eq("id", id).select().single();
    if (data) setReminders(prev => prev.map(r => r.id === id ? data as any : r));
  }, [reminders]);

  const deleteReminder = useCallback(async (id: string) => {
    await supabase.from("fiscal_reminders" as any).delete().eq("id", id);
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  // Computed stats
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = now.getFullYear();

  const monthlySales = sales.filter(s => s.sale_date.startsWith(currentMonth)).reduce((sum, s) => sum + Number(s.amount), 0);
  const monthlyExpenses = expenses.filter(e => e.expense_date.startsWith(currentMonth)).reduce((sum, e) => sum + Number(e.amount), 0);
  const annualRevenue = sales.filter(s => s.sale_date.startsWith(String(currentYear))).reduce((sum, s) => sum + Number(s.amount), 0);
  const estimatedProfit = monthlySales - monthlyExpenses;
  const meiLimitPercent = (annualRevenue / MEI_ANNUAL_LIMIT) * 100;

  // Simples Nacional tax estimation
  const estimateSimplesTax = (monthlyRevenue: number): number => {
    if (monthlyRevenue <= 0) return 0;
    const annual = monthlyRevenue * 12;
    if (annual <= 180000) return monthlyRevenue * 0.06;
    if (annual <= 360000) return monthlyRevenue * 0.112;
    if (annual <= 720000) return monthlyRevenue * 0.135;
    if (annual <= 1800000) return monthlyRevenue * 0.16;
    return monthlyRevenue * 0.21;
  };

  const estimatedTax = settings?.business_type === "mei"
    ? 71.60
    : estimateSimplesTax(monthlySales);

  return {
    settings, isLoading, sales, expenses, dasPayments, reminders,
    saveSettings, addSale, deleteSale, addExpense, deleteExpense,
    toggleDasStatus, addDasPayment, addReminder, toggleReminder, deleteReminder,
    monthlySales, monthlyExpenses, annualRevenue, estimatedProfit, estimatedTax,
    meiLimitPercent, MEI_ANNUAL_LIMIT, estimateSimplesTax,
    refetch: fetchAll,
  };
};
