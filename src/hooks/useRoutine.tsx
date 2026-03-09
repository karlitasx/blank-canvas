import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePoints } from "@/hooks/usePoints";
import { toast } from "sonner";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface RoutineTask {
  id: string;
  title: string;
  emoji: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  points_value: number;
  start_time: string | null;
  end_time: string | null;
  frequency_type: "daily" | "weekly" | "weekdays" | "weekends";
  frequency_days: string[];
}

export const useRoutine = () => {
  const { user } = useAuth();
  const { awardPoints } = usePoints();
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [completions, setCompletions] = useState<{task_id: string, completed_date: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchCompletions();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("routine_tasks")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("start_time", { ascending: true, nullsFirst: true });

      if (error) throw error;
      setTasks((data as RoutineTask[]) || []);
    } catch (error) {
      console.error("Error fetching routine tasks:", error);
    }
  };

  const fetchCompletions = async () => {
    try {
      // Get completions for the current week
      const start = startOfWeek(new Date(), { weekStartsOn: 0 });
      const end = addDays(start, 6);
      
      const { data, error } = await supabase
        .from("routine_completions")
        .select("task_id, completed_date")
        .eq("user_id", user?.id)
        .gte("completed_date", format(start, "yyyy-MM-dd"))
        .lte("completed_date", format(end, "yyyy-MM-dd"));

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error("Error fetching routine completions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, date: Date, pointsValue: number) => {
    if (!user) return;
    
    const dateStr = format(date, "yyyy-MM-dd");
    const isCompleted = completions.some(
      c => c.task_id === taskId && c.completed_date === dateStr
    );

    try {
      if (isCompleted) {
        // Remove completion
        await supabase
          .from("routine_completions")
          .delete()
          .eq("task_id", taskId)
          .eq("completed_date", dateStr);
          
        setCompletions(prev => prev.filter(
          c => !(c.task_id === taskId && c.completed_date === dateStr)
        ));
      } else {
        // Add completion
        await supabase
          .from("routine_completions")
          .insert({
            user_id: user.id,
            task_id: taskId,
            completed_date: dateStr
          });
          
        setCompletions(prev => [...prev, { task_id: taskId, completed_date: dateStr }]);
        
        // Award points
        // Assuming we map routine completions to habit_complete action type for now
        // since we didn't add a specific point action type for routine yet
        if (isSameDay(date, new Date())) {
          awardPoints("habit_complete", `routine_${taskId}_${dateStr}`);
          toast.success(`Rotina concluída! +${pointsValue} pontos`);
        } else {
          toast.success(`Rotina marcada como concluída.`);
        }
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };

  const createTask = async (task: Omit<RoutineTask, "id">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("routine_tasks")
        .insert({
          ...task,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setTasks(prev => [...prev, data as RoutineTask]);
      toast.success("Tarefa adicionada com sucesso!");
      return data;
    } catch (error) {
      console.error("Error creating routine task:", error);
      toast.error("Erro ao criar tarefa");
      return null;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("routine_tasks")
        .update({ is_active: false })
        .eq("id", taskId);
        
      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Tarefa removida");
    } catch (error) {
      console.error("Error deleting routine task:", error);
      toast.error("Erro ao remover tarefa");
    }
  };

  // Helper to check if a task should be shown on a given date
  const isTaskScheduledForDate = (task: RoutineTask, date: Date) => {
    const dayOfWeek = format(date, "EEEE").toLowerCase();
    // In pt-BR: sunday(0) to saturday(6)
    const dayNumber = date.getDay(); 
    const ptDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const ptDay = ptDays[dayNumber];
    
    switch (task.frequency_type) {
      case "daily":
        return true;
      case "weekdays":
        return dayNumber > 0 && dayNumber < 6;
      case "weekends":
        return dayNumber === 0 || dayNumber === 6;
      case "weekly":
        return task.frequency_days.includes(ptDay);
      default:
        return true;
    }
  };

  // Get progress for a specific day
  const getDayProgress = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const scheduledTasks = tasks.filter(t => isTaskScheduledForDate(t, date));
    
    if (scheduledTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completedTasksCount = scheduledTasks.filter(t => 
      completions.some(c => c.task_id === t.id && c.completed_date === dateStr)
    ).length;
    
    return {
      completed: completedTasksCount,
      total: scheduledTasks.length,
      percentage: Math.round((completedTasksCount / scheduledTasks.length) * 100)
    };
  };

  return {
    tasks,
    completions,
    loading,
    createTask,
    deleteTask,
    toggleTaskCompletion,
    isTaskScheduledForDate,
    getDayProgress
  };
};
