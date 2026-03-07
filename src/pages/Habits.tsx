import { useState, useEffect } from "react";
import { Target, Plus, Filter, BarChart3, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HabitCard from "@/components/habits/HabitCard";
import AddHabitModal, { NewHabit } from "@/components/habits/AddHabitModal";
import HabitCheckInModal, { CheckInData } from "@/components/habits/HabitCheckInModal";
import HabitStats from "@/components/habits/HabitStats";
import UpcomingEventsSection from "@/components/habits/UpcomingEventsSection";
import { useSupabaseHabits, HabitData } from "@/hooks/useSupabaseHabits";
import { useAchievementsContext } from "@/contexts/AchievementsContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type FilterType = "all" | "completed" | "pending" | string;

const filters = [
  { id: "all", name: "Todos" },
  { id: "completed", name: "Concluídos" },
  { id: "pending", name: "Pendentes" },
];

const categoryFilters = [
  { id: "health", name: "Saúde", emoji: "💪" },
  { id: "productivity", name: "Produtividade", emoji: "⚡" },
  { id: "spiritual", name: "Espiritual", emoji: "🧘" },
  { id: "financial", name: "Financeiro", emoji: "💰" },
  { id: "selfcare", name: "Autocuidado", emoji: "🌸" },
];

const Habits = () => {
  const { habits, isLoaded, toggleHabit, addHabit, deleteHabit, getStats, getMonthlyConsistency } = useSupabaseHabits();
  const { incrementStat, incrementCategoryCompletion, updateStats } = useAchievementsContext();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [checkInHabit, setCheckInHabit] = useState<HabitData | null>(null);
  const [consistencyMap, setConsistencyMap] = useState<Record<string, number>>({});

  const stats = getStats();

  useEffect(() => {
    if (!isLoaded || habits.length === 0) return;
    const load = async () => {
      const map: Record<string, number> = {};
      for (const h of habits) {
        map[h.id] = await getMonthlyConsistency(h.id);
      }
      setConsistencyMap(map);
    };
    load();
  }, [isLoaded, habits.length]);

  const filteredHabits = habits.filter((habit) => {
    if (filter === "completed") return habit.completed;
    if (filter === "pending") return !habit.completed;
    if (["health", "productivity", "spiritual", "financial", "selfcare"].includes(filter)) {
      return habit.category === filter;
    }
    return true;
  });

  const handleToggle = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return { newStreak: 0, streakIncreased: false };

    if (!habit.completed) {
      setCheckInHabit(habit);
      return { newStreak: 0, streakIncreased: false };
    }

    toggleHabit(id).then((result) => {});
    return { newStreak: 0, streakIncreased: false };
  };

  const handleCheckInSubmit = async (data: CheckInData) => {
    if (!checkInHabit) return;
    const habit = checkInHabit;
    setCheckInHabit(null);

    const result = await toggleHabit(habit.id, data);

    if (result.streakIncreased) {
      incrementStat('habitsCompleted');
      incrementCategoryCompletion(habit.category);

      if (result.newStreak > stats.longestStreak) {
        updateStats({ longestStreak: result.newStreak });
      }

      const completedAfterToggle = habits.filter(h => h.id === habit.id ? true : h.completed).length;
      if (completedAfterToggle === habits.length) {
        incrementStat('perfectDays');
      }

      if (result.newStreak % 7 === 0 && result.newStreak > 0) {
        toast({
          title: `🔥 Streak de ${result.newStreak} dias!`,
          description: `Parabéns! Você ganhou +100 pontos bônus!`,
        });
      }
    }
  };

  const handleCheckInSkip = () => {
    if (!checkInHabit) return;
    const habit = checkInHabit;
    setCheckInHabit(null);

    toggleHabit(habit.id).then((result) => {
      if (result.streakIncreased) {
        incrementStat('habitsCompleted');
        incrementCategoryCompletion(habit.category);
      }
    });
  };

  const handleAdd = async (newHabit: NewHabit) => {
    await addHabit({
      name: newHabit.name,
      emoji: newHabit.emoji,
      category: newHabit.category,
      categoryColor: newHabit.category,
      reminderTime: newHabit.reminderTime,
      frequencyType: newHabit.frequencyType,
      frequencyDays: newHabit.frequencyDays,
      frequencyTimesPerWeek: newHabit.frequencyTimesPerWeek,
      frequencyIntervalDays: newHabit.frequencyIntervalDays,
      goalDays: newHabit.goalDays,
      motivation: newHabit.motivation,
    });

    incrementStat('habitsCreated');
    toast({
      title: "Hábito criado! 🌱",
      description: `"${newHabit.name}" foi adicionado à sua lista.`,
    });
  };

  const handleDelete = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    await deleteHabit(id);
    toast({
      title: "Hábito removido",
      description: habit ? `"${habit.name}" foi deletado.` : "Hábito deletado.",
    });
  };

  const handleStats = (id: string) => {
    setSelectedHabitId(id);
    setShowStats(true);
  };

  const convertToHabitCardFormat = (habit: HabitData) => ({
    id: habit.id,
    name: habit.name,
    emoji: habit.emoji,
    category: habit.category,
    categoryColor: habit.categoryColor,
    streak: habit.streak,
    bestStreak: habit.bestStreak,
    reminderTime: habit.reminderTime,
    completed: habit.completed,
    motivation: habit.motivation,
    goalDays: habit.goalDays,
    frequencyType: habit.frequencyType,
    consistency: consistencyMap[habit.id] || 0,
  });

  if (!isLoaded) {
    return (
      <DashboardLayout activeNav="/habits">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-20 w-full mb-6 rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNav="/habits">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/15">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meus Hábitos</h1>
              <p className="text-sm text-muted-foreground">
                {stats.completedToday} de {stats.totalHabits} concluídos hoje
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 font-medium btn-gradient"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Hábito</span>
          </button>
        </div>

        {/* Progress Bar */}
        {habits.length > 0 && (
          <div className="glass-card p-4 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso do dia</span>
              <span className="font-semibold text-foreground">{stats.progressPercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 btn-gradient"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        {habits.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 animate-slide-up">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  filter === f.id
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:scale-105"
                )}
              >
                {f.name}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  ["health", "productivity", "spiritual", "financial", "selfcare"].includes(filter)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:scale-105"
                )}
              >
                <Filter className="w-4 h-4" />
                Categoria
              </button>

              {showCategoryFilter && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryFilter(false)} />
                  <div className="absolute left-0 top-full mt-2 w-48 glass-card py-2 z-20 animate-scale-in">
                    {categoryFilters.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setFilter(cat.id); setShowCategoryFilter(false); }}
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-all",
                          filter === cat.id && "text-primary font-medium"
                        )}
                      >
                        <span>{cat.emoji}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowStats(!showStats)}
              className={cn(
                "ml-auto px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                showStats
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:scale-105"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Estatísticas
            </button>
          </div>
        )}

        {/* Stats Section */}
        {showStats && habits.length > 0 && (
          <div className="mb-6 animate-scale-in">
            <HabitStats habitId={selectedHabitId || "all"} />
          </div>
        )}

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-primary/10">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Quais pequenas ações vão transformar sua rotina?</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Comece criando seu primeiro hábito e dê o primeiro passo para uma rotina mais saudável.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:scale-105 transition-all btn-gradient"
              >
                <Plus className="w-5 h-5" />
                Criar meu primeiro hábito
              </button>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="glass-card p-8 text-center animate-fade-in">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2 text-foreground">Nenhum hábito encontrado</h3>
              <p className="text-sm text-muted-foreground">Tente mudar os filtros</p>
            </div>
          ) : (
            filteredHabits.map((habit, index) => (
              <div
                key={habit.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <HabitCard
                  habit={convertToHabitCardFormat(habit)}
                  onToggle={handleToggle}
                  onEdit={(id) => console.log("Edit", id)}
                  onDelete={handleDelete}
                  onStats={handleStats}
                />
              </div>
            ))
          )}
        </div>

        {/* Upcoming Events Section */}
        <div className="mt-6">
          <UpcomingEventsSection />
        </div>
      </div>

      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
      />

      <HabitCheckInModal
        isOpen={!!checkInHabit}
        habitName={checkInHabit?.name || ""}
        habitEmoji={checkInHabit?.emoji || ""}
        onClose={handleCheckInSkip}
        onSubmit={handleCheckInSubmit}
      />
    </DashboardLayout>
  );
};

export default Habits;
