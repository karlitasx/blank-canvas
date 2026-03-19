import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRoutine } from "@/hooks/useRoutine";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddRoutineTaskModal } from "./AddRoutineTaskModal";
import { Progress } from "@/components/ui/progress";


type ViewMode = "horizontal" | "vertical";

export const RoutinePlanner = () => {
  const { tasks, completions, isTaskScheduledForDate, getDayProgress, toggleTaskCompletion } = useRoutine();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("horizontal");
  
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  }, [startOfCurrentWeek]);

  const navigatePreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const navigateNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const todayProgress = getDayProgress(new Date());

  const renderDayCard = (day: Date) => {
    const isCurrentDay = isToday(day);
    const dayTasks = tasks.filter(t => isTaskScheduledForDate(t, day));
    const progress = getDayProgress(day);
    const dateStr = format(day, "yyyy-MM-dd");

    return (
      <div 
        key={dateStr}
        className={cn(
          "flex flex-col border rounded-xl overflow-hidden",
          viewMode === "horizontal"
            ? "snap-start flex-shrink-0 w-[85vw] sm:w-[280px] md:w-auto bg-card"
            : "bg-card",
          isCurrentDay ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border/50"
        )}
      >
        {/* Day Header */}
        <div className={cn(
          "p-3 border-b flex justify-between items-center",
          isCurrentDay ? "bg-primary/10" : "bg-muted/50"
        )}>
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase">
              {format(day, "EEEE", { locale: ptBR })}
            </div>
            <div className="text-xl md:text-2xl font-bold">
              {format(day, "dd")}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(day, "MMM", { locale: ptBR })}
            </div>
          </div>
          <div className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full border",
            progress.percentage === 100 
              ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-background text-muted-foreground"
          )}>
            {progress.completed}/{progress.total}
          </div>
        </div>
        
        {/* Tasks List */}
        <div className={cn(
          "p-2.5 space-y-2 flex-1 overflow-y-auto",
          viewMode === "horizontal" ? "max-h-[350px] md:max-h-[400px] min-h-[200px]" : "min-h-[80px]"
        )}>
          {dayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/50 py-4">
              <Circle className="w-6 h-6 mb-1 opacity-30" />
              <p className="text-xs">Sem tarefas</p>
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
                    "p-2.5 rounded-lg text-sm border flex items-start gap-2.5 transition-all cursor-pointer group",
                    "hover:shadow-sm active:scale-[0.98]",
                    isCompleted 
                      ? "opacity-60 bg-muted/30 border-transparent" 
                      : "bg-background shadow-sm border-border/50 hover:bg-muted/30 hover:border-primary/30"
                  )}
                  onClick={() => toggleTaskCompletion(task.id, day, task.points_value)}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 fill-primary text-primary-foreground" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium leading-tight text-sm",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      {task.emoji} {task.title}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {task.start_time && (
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          ⏰ {task.start_time.substring(0, 5)}
                          {task.end_time && ` - ${task.end_time.substring(0, 5)}`}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        +{task.points_value} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Day Progress Bar */}
        {dayTasks.length > 0 && (
          <div className="px-2.5 pb-2.5">
            <Progress value={progress.percentage} className="h-1.5" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header com progresso */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold">Minha Rotina</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Progresso de Hoje: {todayProgress.completed}/{todayProgress.total} tarefas ({todayProgress.percentage}%)
          </p>
          <div className="w-full max-w-xs mt-2">
            <Progress value={todayProgress.percentage} className="h-2" />
          </div>
        </div>
        
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
            📅 Planner Semanal
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "horizontal" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("horizontal")}
                title="Visualização horizontal"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "vertical" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("vertical")}
                title="Visualização vertical"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Week Navigator */}
            <div className="flex items-center bg-muted rounded-lg p-1 justify-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigatePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs md:text-sm font-medium px-2 min-w-[100px] md:min-w-[120px] text-center">
                {format(startOfCurrentWeek, "dd MMM", { locale: ptBR })} - {format(addDays(startOfCurrentWeek, 6), "dd MMM", { locale: ptBR })}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Add Task Button */}
            <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-1 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Nova tarefa
            </Button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      {viewMode === "horizontal" ? (
        <div className="relative">
          <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
            {weekDays.map(renderDayCard)}
          </div>
          <div className="md:hidden text-center mt-2">
            <p className="text-xs text-muted-foreground">
              ← Deslize para ver outros dias →
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {weekDays.map(renderDayCard)}
        </div>
      )}

      <AddRoutineTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
