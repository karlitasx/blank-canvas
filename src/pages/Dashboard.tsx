import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Wallet, Trophy, Flame, TrendingUp, Star } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<string[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      supabase.from("habits").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("habit_completions").select("habit_id").eq("user_id", user.id).eq("completed_date", today),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("transaction_date", { ascending: false }).limit(5),
    ]).then(([statsRes, habitsRes, completionsRes, transRes]) => {
      setStats(statsRes.data);
      setHabits(habitsRes.data || []);
      setTodayCompletions((completionsRes.data || []).map((c) => c.habit_id));
      setRecentTransactions(transRes.data || []);
    });
  }, [user]);

  const completedToday = todayCompletions.length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu progresso</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
            <p className="text-xs text-muted-foreground">Nível: {stats?.level || "Novata"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.current_streak || 0} dias</div>
            <p className="text-xs text-muted-foreground">Melhor: {stats?.longest_streak || 0} dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hábitos Hoje</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}/{totalHabits}</div>
            <Progress value={progressPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.transactions_logged || 0}</div>
            <p className="text-xs text-muted-foreground">registradas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" /> Hábitos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum hábito cadastrado</p>
            ) : (
              habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{habit.emoji}</span>
                    <span className="text-sm">{habit.name}</span>
                  </div>
                  <Badge variant={todayCompletions.includes(habit.id) ? "default" : "outline"}>
                    {todayCompletions.includes(habit.id) ? "✓ Feito" : "Pendente"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Últimas Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma transação registrada</p>
            ) : (
              recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.description || t.category}</p>
                    <p className="text-xs text-muted-foreground">{t.category}</p>
                  </div>
                  <span className={`text-sm font-medium ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}R$ {Number(t.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
