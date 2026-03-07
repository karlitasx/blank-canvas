import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FinanceCategoryRecord {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  type: "income" | "expense";
  finance_type: "personal" | "business";
}

export const useFinanceCategories = (financeType: "personal" | "business") => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<FinanceCategoryRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setIsLoaded(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("finance_categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("finance_type", financeType)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setCategories(
        (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          icon_name: d.icon_name,
          color: d.color,
          type: d.type as "income" | "expense",
          finance_type: d.finance_type as "personal" | "business",
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user, financeType]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(
    async (cat: Omit<FinanceCategoryRecord, "id">) => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from("finance_categories")
          .insert({
            user_id: user.id,
            name: cat.name,
            icon_name: cat.icon_name,
            color: cat.color,
            type: cat.type,
            finance_type: cat.finance_type,
          })
          .select()
          .single();

        if (error) throw error;

        const newCat: FinanceCategoryRecord = {
          id: data.id,
          name: data.name,
          icon_name: data.icon_name,
          color: data.color,
          type: data.type as "income" | "expense",
          finance_type: data.finance_type as "personal" | "business",
        };
        setCategories((prev) => [...prev, newCat]);
        return newCat;
      } catch (error) {
        console.error("Error adding category:", error);
        return null;
      }
    },
    [user]
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Omit<FinanceCategoryRecord, "id" | "finance_type">>) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from("finance_categories")
          .update(updates)
          .eq("id", id);

        if (error) throw error;

        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
        );
      } catch (error) {
        console.error("Error updating category:", error);
      }
    },
    [user]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from("finance_categories")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },
    [user]
  );

  return { categories, isLoaded, addCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};
