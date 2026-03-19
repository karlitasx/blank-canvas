import { useState } from "react";
import { Check, Flame, Clock, MoreVertical, Edit, Trash2, BarChart3, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  categoryColor: string;
  streak: number;
  bestStreak?: number;
  reminderTime?: string;
  completed: boolean;
  motivation?: string;
  goalDays?: number;
  frequencyType?: string;
  consistency?: number;
}

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => { newStreak: number; streakIncreased: boolean };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStats: (id: string) => void;
}

const HabitCard = ({ habit, onToggle, onEdit, onDelete, onStats }: HabitCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streakAnimation, setStreakAnimation] = useState(false);

  const goalProgress = habit.goalDays && habit.streak > 0
    ? Math.min(Math.round((habit.streak / habit.goalDays) * 100), 100)
    : null;

  const handleToggle = () => {
    if (!habit.completed) {
      setIsAnimating(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#7f1d1d", "#1d4ed8", "#a855f7"],
      });

      const streakBonus = Math.floor((habit.streak + 1) / 5) * 5;
      const points = 10 + streakBonus;
      setPointsEarned(points);
      setShowPoints(true);
      setStreakAnimation(true);

      setTimeout(() => setIsAnimating(false), 600);
      setTimeout(() => setShowPoints(false), 1500);
      setTimeout(() => setStreakAnimation(false), 800);
    }

    onToggle(habit.id);
  };

  const categoryColors: Record<string, string> = {
    health: "text-success border-success/30",
    productivity: "text-secondary border-secondary/30",
    spiritual: "text-purple-500 border-purple-500/30",
    financial: "text-accent border-accent/30",
    selfcare: "text-primary border-primary/30",
  };

  const categoryNames: Record<string, string> = {
    health: "Saúde",
    productivity: "Produtividade",
    spiritual: "Espiritual",
    financial: "Financeiro",
    selfcare: "Autocuidado",
  };

  const frequencyLabels: Record<string, string> = {
    daily: "Diário",
    specific_days: "Dias específicos",
    times_per_week: "Semanal",
    interval: "Intervalo",
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-2xl border transition-all duration-300 group",
        habit.completed
          ? "border-secondary/30 bg-secondary/5"
          : "bg-card border-border hover:shadow-lg hover:scale-[1.01]",
        isAnimating && "animate-pulse"
      )}
    >
      {/* Floating Points */}
      {showPoints && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="text-lg font-bold text-secondary" style={{
            animation: "float-up 1.5s ease-out forwards"
          }}>
            +{pointsEarned} pts
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            "relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5 shrink-0",
            habit.completed
              ? "border-secondary bg-secondary"
              : "border-muted-foreground/40 hover:border-primary hover:scale-110"
          )}
        >
          {habit.completed && <Check className="w-5 h-5 text-secondary-foreground animate-scale-in" />}
          {isAnimating && <span className="absolute inset-0 rounded-full border-2 border-secondary animate-ping" />}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{habit.emoji}</span>
            <h3 className={cn(
              "font-semibold truncate transition-all text-foreground",
              habit.completed && "line-through text-muted-foreground"
            )}>
              {habit.name}
            </h3>
          </div>

          {/* Motivation */}
          {habit.motivation && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5 italic">
              <Sparkles className="w-3 h-3 text-primary" />
              {habit.motivation}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border bg-muted/50",
              categoryColors[habit.category]
            )}>
              {categoryNames[habit.category]}
            </span>

            {habit.frequencyType && habit.frequencyType !== "daily" && (
              <span className="text-xs text-muted-foreground">
                {frequencyLabels[habit.frequencyType]}
              </span>
            )}

            {/* Streak */}
            {habit.streak > 0 && (
              <div className={cn(
                "flex items-center gap-1 transition-all",
                streakAnimation && "scale-125",
                habit.streak >= 7 ? "text-primary" : "text-secondary"
              )}>
                <Flame className={cn("w-4 h-4", habit.streak >= 7 && "animate-pulse")} />
                <span className="text-sm font-bold">{habit.streak}</span>
                {habit.streak >= 7 && <Trophy className="w-3 h-3 text-accent ml-0.5" />}
              </div>
            )}

            {/* Consistency */}
            {typeof habit.consistency === "number" && habit.consistency > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{habit.consistency}%</span>
              </div>
            )}

            {habit.reminderTime && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{habit.reminderTime}</span>
              </div>
            )}
          </div>

          {/* Goal progress */}
          {goalProgress !== null && habit.goalDays && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Meta: {habit.goalDays} dias</span>
                <span className={cn("font-medium", goalProgress >= 100 ? "text-success" : "text-secondary")}>
                  {habit.streak}/{habit.goalDays}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    goalProgress >= 100 ? "bg-success" : "btn-gradient"
                  )}
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 glass-card py-1 z-20 animate-scale-in">
                <button
                  onClick={() => { onStats(habit.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-all text-foreground"
                >
                  <BarChart3 className="w-4 h-4" /> Estatísticas
                </button>
                <button
                  onClick={() => { onEdit(habit.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-all text-foreground"
                >
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => { onDelete(habit.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-all text-destructive"
                >
                  <Trash2 className="w-4 h-4" /> Deletar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) translateX(-50%); }
          100% { opacity: 0; transform: translateY(-40px) translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default HabitCard;
