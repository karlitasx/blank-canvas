import { Target, Wallet, Flame, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useSupabaseHabits } from "@/hooks/useSupabaseHabits";
import { useSupabaseFinances } from "@/hooks/useSupabaseFinances";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  gradient: string;
}

const StatCard = ({ icon, label, value, subValue, trend, trendValue, gradient }: StatCardProps) => (
  <div className="glass-card p-4 hover:scale-105 transition-all duration-300 cursor-pointer group active:scale-95">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${gradient} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${
          trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
        }`}>
          {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-2xl font-bold group-hover:text-primary transition-colors">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
    {subValue && (
      <p className="text-sm text-primary mt-1 flex items-center gap-1">
        <Flame className="w-3 h-3 animate-pulse" />
        {subValue}
      </p>
    )}
  </div>
);

const QuickStats = () => {
  const { habits, isLoaded: habitsLoaded, getStats } = useSupabaseHabits();
  const { stats: financeStats, isLoaded: financesLoaded } = useSupabaseFinances();

  const habitStats = getStats();
  const isLoading = !habitsLoaded || !financesLoaded;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  // Calculate longest streak from habits
  const longestStreak = habits.length > 0 
    ? Math.max(...habits.map(h => h.streak), 0)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <StatCard
        icon={<Target className="w-5 h-5 text-white" />}
        label="Hábitos hoje"
        value={habits.length > 0 ? `${habitStats.completedToday}/${habitStats.totalHabits}` : "0/0"}
        subValue={longestStreak > 0 ? `${longestStreak} dias de streak` : undefined}
        gradient="bg-primary/80"
      />
      
      <StatCard
        icon={<Wallet className="w-5 h-5 text-white" />}
        label="Saldo atual"
        value={`R$ ${financeStats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        trend={financeStats.balance >= 0 ? "up" : "down"}
        trendValue={financeStats.balance >= 0 ? "positivo" : "negativo"}
        gradient="bg-emerald-600/80"
      />
      
      <StatCard
        icon={<Flame className="w-5 h-5 text-white" />}
        label="Maior streak"
        value={`${habitStats.longestStreak} dias`}
        trend="neutral"
        trendValue="recorde"
        gradient="bg-orange-500/80"
      />
      
      <StatCard
        icon={<Trophy className="w-5 h-5 text-white" />}
        label="Taxa de economia"
        value={financeStats.income > 0 ? `${financeStats.savingsRate.toFixed(0)}%` : "—"}
        trend={financeStats.savingsRate > 0 ? "up" : "neutral"}
        trendValue={financeStats.savingsRate > 20 ? "ótimo!" : "do mês"}
        gradient="bg-yellow-500/80"
      />
    </div>
  );
};

export default QuickStats;
