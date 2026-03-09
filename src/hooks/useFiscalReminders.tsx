import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FiscalReminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  reminder_type: string;
  is_completed: boolean;
}

export const useFiscalReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<FiscalReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    if (!user) { setReminders([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("fiscal_reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });
      if (error) throw error;
      setReminders((data || []).map(r => ({
        id: r.id, title: r.title, description: r.description,
        due_date: r.due_date, reminder_type: r.reminder_type, is_completed: r.is_completed,
      })));
    } catch (e) { console.error("Error fetching fiscal reminders:", e); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const addReminder = useCallback(async (reminder: Omit<FiscalReminder, "id" | "is_completed">) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("fiscal_reminders").insert({
        user_id: user.id, ...reminder,
      });
      if (error) throw error;
      await fetchReminders();
    } catch (e) { console.error("Error adding reminder:", e); }
  }, [user, fetchReminders]);

  const toggleComplete = useCallback(async (id: string, completed: boolean) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("fiscal_reminders").update({ is_completed: completed }).eq("id", id);
      if (error) throw error;
      await fetchReminders();
    } catch (e) { console.error("Error toggling reminder:", e); }
  }, [user, fetchReminders]);

  const deleteReminder = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await supabase.from("fiscal_reminders").delete().eq("id", id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error("Error deleting reminder:", e); }
  }, [user]);

  return { reminders, isLoading, addReminder, toggleComplete, deleteReminder, refetch: fetchReminders };
};
