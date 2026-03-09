import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRoutine, RoutineTask } from "@/hooks/useRoutine";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddRoutineTaskModal } from "./AddRoutineTaskModal";
import { Progress } from "@/components/ui/progress";
import AnimatedPlant from "@/components/dashboard/AnimatedPlant";

export const RoutinePlanner = () => {
  const { tasks, completions, isTaskScheduledForDate, getDayProgress, toggleTaskCompletion } = useRoutine();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Generate array of 7 days for the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  }, [startOfCurrentWeek]);

  const navigatePreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const navigateNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  // Determine plant stage based on today's progress
  const todayProgress = getDayProgress(new Date());
  const plantStage = Math.floor((todayProgress.percentage / 100) * 4); // 0-4 stages

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div>
          <h2 className="text-xl font-bold">Minha Rotina</h2>
          <p className="text-sm text-muted-foreground">Progresso do Dia: {todayProgress.percentage}%</p>
          <div className="w-full max-w-xs mt-2">
            <Progress value={todayProgress.percentage} className="h-2" />
          </div>
        </div>
        
        <div className="w-16 h-20 relative">
          <AnimatedPlant stage={plantStage} isAnimating={false} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📅 Planner Semanal
        </h3>
        <div className="flex gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigatePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[120px] text-center">
              {format(startOfCurrentWeek, "dd MMM", { locale: ptBR })} - {format(addDays(startOfCurrentWeek, 6), "dd MMM", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Nova tarefa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-x-auto pb-4">
        {weekDays.map((day) => {
          const isCurrentDay = isToday(day);
          const dayTasks = tasks.filter(t => isTaskScheduledForDate(t, day));
          const progress = getDayProgress(day);
          const dateStr = format(day, "yyyy-MM-dd");
          
          return (
            <div 
              key={dateStr}
              className={cn(
                "flex flex-col border rounded-xl overflow-hidden min-w-[140px] md:min-w-0 bg-card",
                isCurrentDay ? "border-primary shadow-sm" : "border-border/50"
              )}
            >
              <div className={cn(
                "p-3 border-b flex justify-between items-center",
                isCurrentDay ? "bg-primary/10" : "bg-muted/50"
              )}>
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">
                    {format(day, "EEE", { locale: ptBR })}
                  </div>
                  <div className="text-lg font-bold">
                    {format(day, "dd")}
                  </div>
                </div>
                <div className="text-xs font-semibold bg-background px-2 py-1 rounded-full text-muted-foreground border">
                  {progress.completed}/{progress.total}
                </div>
              </div>
              
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[400px] min-h-[200px]">
                {dayTasks.length === 0 ? (
                  <div className="text-xs text-center text-muted-foreground mt-4 py-4 opacity-50">
                    Sem tarefas
                  </div>
                ) : (
                  dayTasks.map(task => {
                    const isCompleted = completions.some(
                      c => c.task_id === task.id && c.completed_date === dateStr
                    );
                    
                    return (
                      <div 
                        key={`${task.id}-${dateStr}`}
                        className={cn(
                          "p-2 rounded-lg text-sm border flex items-start gap-2 transition-all cursor-pointer group hover:bg-muted/50",
                          isCompleted ? "opacity-60 bg-muted/30 border-transparent" : "bg-background shadow-sm border-border/50"
                        )}
                        onClick={() => toggleTaskCompletion(task.id, day, task.points_value)}
                      >
                        <div className="mt-0.5 text-primary">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 fill-primary text-primary-foreground" />
                          ) : (
                            <Circle className="h-4 w-4 opacity-30 group-hover:opacity-100" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium truncate leading-tight",
                            isCompleted && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </p>
                          {task.start_time && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {task.start_time.substring(0, 5)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddRoutineTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
