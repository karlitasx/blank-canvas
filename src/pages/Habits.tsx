import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Check, Flame, Trash2 } from "lucide-react";

const CATEGORIES = ["health", "productivity", "mindfulness", "fitness", "learning", "social", "other"];
const EMOJIS = ["✅", "💪", "📚", "🧘", "🏃", "💧", "🎯", "🌟", "💤", "🍎"];

const Habits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✅");
  const [category, setCategory] = useState("health");

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    if (!user) return;
    const [habitsRes, compRes] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at"),
      supabase.from("habit_completions").select("habit_id").eq("user_id", user.id).eq("completed_date", today),
    ]);
    setHabits(habitsRes.data || []);
    setCompletions((compRes.data || []).map((c) => c.habit_id));
  };

  useEffect(() => { fetchData(); }, [user]);

  const createHabit = async () => {
    if (!user || !name.trim()) return;
    const { error } = await supabase.from("habits").insert({ user_id: user.id, name, emoji, category });
    if (error) { toast.error(error.message); return; }
    toast.success("Hábito criado!");
    setName(""); setOpen(false);
    fetchData();
  };

  const toggleCompletion = async (habitId: string) => {
    if (!user) return;
    const isCompleted = completions.includes(habitId);
    if (isCompleted) {
      await supabase.from("habit_completions").delete().eq("user_id", user.id).eq("habit_id", habitId).eq("completed_date", today);
    } else {
      await supabase.from("habit_completions").insert({ user_id: user.id, habit_id: habitId, completed_date: today });
    }
    fetchData();
  };

  const deleteHabit = async (id: string) => {
    await supabase.from("habits").delete().eq("id", id);
    toast.success("Hábito removido");
    fetchData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hábitos</h1>
          <p className="text-muted-foreground">Gerencie seus hábitos diários</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Hábito</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Hábito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Meditar 10 min" />
              </div>
              <div className="space-y-2">
                <Label>Emoji</Label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setEmoji(e)} className={`text-2xl p-1 rounded ${emoji === e ? "bg-primary/20 ring-2 ring-primary" : ""}`}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <Badge key={c} variant={category === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setCategory(c)}>{c}</Badge>
                  ))}
                </div>
              </div>
              <Button onClick={createHabit} className="w-full">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Progresso hoje:</span>
        <Badge variant="secondary">{completions.length}/{habits.length}</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const done = completions.includes(habit.id);
          return (
            <Card key={habit.id} className={done ? "border-primary/50 bg-primary/5" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleCompletion(habit.id)} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${done ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary"}`}>
                    {done && <Check className="h-4 w-4" />}
                  </button>
                  <div>
                    <p className="font-medium">{habit.emoji} {habit.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3" /> {habit.streak} dias
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum hábito criado ainda. Comece adicionando um!</p>
        </div>
      )}
    </div>
  );
};

export default Habits;
