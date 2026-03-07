import { useState } from "react";
import { Calendar, TrendingUp, Sprout } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DayData {
  date: Date;
  performance: number; // 0-100
  habitsCompleted: number;
  totalHabits: number;
}

const WeeklySummary = () => {
  const today = new Date();
  
  // Generate last 7 days of mock data
  const [weekData] = useState<DayData[]>(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const performance = Math.floor(Math.random() * 40) + 60; // 60-100%
      const totalHabits = 7;
      const habitsCompleted = Math.floor((performance / 100) * totalHabits);
      return { date, performance, habitsCompleted, totalHabits };
    });
  });

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return "from-green-400 to-emerald-500";
    if (performance >= 60) return "from-yellow-400 to-amber-500";
    if (performance >= 40) return "from-orange-400 to-red-500";
    return "from-red-400 to-rose-500";
  };

  const getPerformanceEmoji = (performance: number) => {
    if (performance >= 90) return "🌟";
    if (performance >= 80) return "🎯";
    if (performance >= 60) return "👍";
    if (performance >= 40) return "💪";
    return "🌱";
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const averagePerformance = Math.round(
    weekData.reduce((sum, day) => sum + day.performance, 0) / weekData.length
  );

  const plantProgress = Math.min(100, averagePerformance + 10);

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-lg">Resumo da Semana</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-medium">{averagePerformance}% média</span>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekData.map((day, index) => {
          const isToday = day.date.toDateString() === today.toDateString();
          const dayOfWeek = weekDays[day.date.getDay()];
          const dayNumber = day.date.getDate();

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`relative flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                    isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  {/* Day label */}
                  <span className="text-xs text-muted-foreground mb-1">{dayOfWeek}</span>
                  
                  {/* Performance circle */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPerformanceColor(day.performance)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {dayNumber}
                  </div>

                  {/* Performance bar */}
                  <div className="w-full h-1 mt-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getPerformanceColor(day.performance)} transition-all duration-500`}
                      style={{ width: `${day.performance}%` }}
                    />
                  </div>

                  {/* Emoji indicator */}
                  <span className="text-xs mt-1">{getPerformanceEmoji(day.performance)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/95 backdrop-blur-sm border-white/10">
                <div className="text-center">
                  <p className="font-medium">{day.date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}</p>
                  <p className="text-sm text-muted-foreground">
                    {day.habitsCompleted}/{day.totalHabits} hábitos • {day.performance}%
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Plant Evolution This Week */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Evolução da Plantinha</p>
              <p className="text-xs text-muted-foreground">Baseado na sua consistência</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">+{plantProgress}%</p>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${plantProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;
