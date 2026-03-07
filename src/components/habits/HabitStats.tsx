import { useState, useEffect } from "react";
import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react";
import { useSupabaseHabits } from "@/hooks/useSupabaseHabits";

interface HabitStatsProps {
  habitId: string;
}

const HabitStats = ({ habitId }: HabitStatsProps) => {
  const { habits, getHabitHistory, getMonthlyConsistency } = useSupabaseHabits();
  const [heatmapData, setHeatmapData] = useState<{ date: string; completed: boolean }[]>([]);
  const [consistency, setConsistency] = useState(0);
  const [loading, setLoading] = useState(true);

  const habit = habitId === "all" ? null : habits.find(h => h.id === habitId);

  const currentStreak = habit ? habit.streak : habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const bestStreak = habit ? (habit.bestStreak || 0) : Math.max(...habits.map(h => h.bestStreak), 0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (habitId && habitId !== "all") {
        const [history, cons] = await Promise.all([
          getHabitHistory(habitId, 90),
          getMonthlyConsistency(habitId),
        ]);
        setHeatmapData(history);
        setConsistency(cons);
      } else if (habits.length > 0) {
        // For "all", use first habit
        const first = habits[0];
        const [history, cons] = await Promise.all([
          getHabitHistory(first.id, 90),
          getMonthlyConsistency(first.id),
        ]);
        setHeatmapData(history);
        setConsistency(cons);
      }
      setLoading(false);
    };
    load();
  }, [habitId, habits.length]);

  const totalDays = heatmapData.filter(d => d.completed).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-muted" />)}
        </div>
        <div className="h-40 rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center rounded-2xl">
          <Flame className="w-6 h-6 mx-auto mb-2 text-[hsl(345,60%,35%)]" />
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">Streak Atual</p>
        </div>
        <div className="glass-card p-4 text-center rounded-2xl">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <p className="text-2xl font-bold">{bestStreak}</p>
          <p className="text-xs text-muted-foreground">Melhor Streak</p>
        </div>
        <div className="glass-card p-4 text-center rounded-2xl">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-[hsl(220,70%,50%)]" />
          <p className="text-2xl font-bold">{totalDays}</p>
          <p className="text-xs text-muted-foreground">Dias Concluídos</p>
        </div>
        <div className="glass-card p-4 text-center rounded-2xl">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-400" />
          <p className="text-2xl font-bold">{consistency}%</p>
          <p className="text-xs text-muted-foreground">Consistência Mensal</p>
        </div>
      </div>

      {/* Heat Map */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold mb-4">Últimos 90 dias</h3>
        <div className="grid grid-cols-15 gap-1">
          {heatmapData.map((day, index) => (
            <div
              key={index}
              className="aspect-square rounded-sm transition-all hover:scale-125"
              style={{
                backgroundColor: day.completed
                  ? "hsl(220, 70%, 50%)"
                  : "hsl(var(--muted))",
                opacity: day.completed ? 0.85 : 0.3,
              }}
              title={day.date}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
          <span>Não feito</span>
          <div className="w-3 h-3 rounded-sm bg-muted opacity-30" />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(220, 70%, 50%)", opacity: 0.85 }} />
          <span>Feito</span>
        </div>
      </div>
    </div>
  );
};

export default HabitStats;
