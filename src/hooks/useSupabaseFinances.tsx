import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAchievementsContext } from "@/contexts/AchievementsContext";

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: Date;
  recurring?: boolean;
  finance_type?: "personal" | "business";
  cnpj?: string;
  invoice_number?: string;
  cost_center?: string;
}

interface FinanceStats {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}

export const useSupabaseFinances = (financeType?: "personal" | "business") => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { incrementStat } = useAchievementsContext();

  // Fetch transactions from Supabase
  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoaded(true);
      return;
    }

    try {
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id);
      
      if (financeType) {
        query = query.eq("finance_type", financeType);
      }
      
      const { data, error } = await query.order("transaction_date", { ascending: false });

      if (error) throw error;

      const mappedTransactions: Transaction[] = (data || []).map((t: any) => ({
        id: t.id,
        description: t.description || "",
        category: t.category,
        amount: Number(t.amount),
        type: t.type as "income" | "expense",
        date: new Date(t.transaction_date),
        finance_type: t.finance_type || "personal",
        cnpj: t.cnpj || undefined,
        invoice_number: t.invoice_number || undefined,
        cost_center: t.cost_center || undefined,
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user, financeType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getStats = useCallback((): FinanceStats => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return { income, expenses, balance, savingsRate };
  }, [transactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, "id">) => {
    if (!user) return null;

    try {
      const insertData: any = {
        user_id: user.id,
        description: transaction.description,
        category: transaction.category,
        amount: transaction.amount,
        type: transaction.type,
        transaction_date: transaction.date.toISOString().split("T")[0],
        finance_type: transaction.finance_type || financeType || "personal",
      };
      if (transaction.cnpj) insertData.cnpj = transaction.cnpj;
      if (transaction.invoice_number) insertData.invoice_number = transaction.invoice_number;
      if (transaction.cost_center) insertData.cost_center = transaction.cost_center;

      const { data, error } = await supabase
        .from("transactions")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        description: data.description || "",
        category: data.category,
        amount: Number(data.amount),
        type: data.type as "income" | "expense",
        date: new Date(data.transaction_date),
        finance_type: (data as any).finance_type || "personal",
        cnpj: (data as any).cnpj || undefined,
        invoice_number: (data as any).invoice_number || undefined,
        cost_center: (data as any).cost_center || undefined,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      incrementStat("transactionsLogged");
      return newTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      return null;
    }
  }, [user, incrementStat]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  }, [user]);

  const filterTransactions = useCallback(
    (type: "all" | "income" | "expense") => {
      if (type === "all") return transactions;
      return transactions.filter(t => t.type === type);
    },
    [transactions]
  );

  const getCategoryData = useCallback(() => {
    const categoryMap = new Map<string, number>();

    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const colors: Record<string, string> = {
      "Alimentação": "#f97316",
      "Transporte": "#3b82f6",
      "Moradia": "#8b5cf6",
      "Lazer": "#ec4899",
      "Saúde": "#ef4444",
      "Educação": "#14b8a6",
      "Investimento / Objetivo": "#10b981",
      "Salário": "#22c55e",
      "Compras": "#f59e0b",
      "Investimento": "#6366f1",
      "Presente": "#a855f7",
      // Business
      "Receita de Vendas": "#22c55e",
      "Serviços Prestados": "#3b82f6",
      "Fornecedores": "#f97316",
      "Folha de Pagamento": "#8b5cf6",
      "Impostos": "#ef4444",
      "Aluguel Comercial": "#6366f1",
      "Marketing": "#ec4899",
      "Materiais/Estoque": "#f59e0b",
      "Nota Fiscal": "#14b8a6",
      "Despesas Gerais": "#6b7280",
    };

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || "#6b7280",
    }));
  }, [transactions]);

  return {
    transactions,
    isLoaded,
    stats: getStats(),
    addTransaction,
    deleteTransaction,
    filterTransactions,
    getCategoryData,
    refetch: fetchTransactions,
  };
};
