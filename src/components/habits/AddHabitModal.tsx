import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: NewHabit) => void;
}

export interface NewHabit {
  name: string;
  emoji: string;
  category: string;
  frequency: string;
  frequencyType: "daily" | "specific_days" | "times_per_week" | "interval";
  frequencyDays?: string[];
  frequencyTimesPerWeek?: number;
  frequencyIntervalDays?: number;
  goalDays?: number;
  motivation?: string;
  reminderTime?: string;
}

const categories = [
  { id: "health", name: "Saúde", emoji: "💪" },
  { id: "productivity", name: "Produtividade", emoji: "⚡" },
  { id: "spiritual", name: "Espiritual", emoji: "🧘" },
  { id: "financial", name: "Financeiro", emoji: "💰" },
  { id: "selfcare", name: "Autocuidado", emoji: "🌸" },
  { id: "haircare", name: "Cronograma Capilar", emoji: "🧖🏽‍♀️" },
];

const frequencyOptions = [
  { id: "daily", name: "Diário" },
  { id: "specific_days", name: "Dias específicos" },
  { id: "times_per_week", name: "X vezes/semana" },
  { id: "interval", name: "Intervalo" },
] as const;

const weekDays = [
  { id: "mon", name: "Seg" },
  { id: "tue", name: "Ter" },
  { id: "wed", name: "Qua" },
  { id: "thu", name: "Qui" },
  { id: "fri", name: "Sex" },
  { id: "sat", name: "Sáb" },
  { id: "sun", name: "Dom" },
];

const emojis = ["💧", "🏃", "📚", "🧘", "💰", "🎯", "💪", "🌙", "☀️", "🍎", "✍️", "🎨", "🌸", "💆", "🧠", "❤️"];

const AddHabitModal = ({ isOpen, onClose, onAdd }: AddHabitModalProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [category, setCategory] = useState("health");
  const [frequencyType, setFrequencyType] = useState<NewHabit["frequencyType"]>("daily");
  const [frequencyDays, setFrequencyDays] = useState<string[]>([]);
  const [frequencyTimesPerWeek, setFrequencyTimesPerWeek] = useState(3);
  const [frequencyIntervalDays, setFrequencyIntervalDays] = useState(2);
  const [goalDays, setGoalDays] = useState<string>("");
  const [motivation, setMotivation] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  const resetForm = () => {
    setName("");
    setEmoji("🎯");
    setCategory("health");
    setFrequencyType("daily");
    setFrequencyDays([]);
    setFrequencyTimesPerWeek(3);
    setFrequencyIntervalDays(2);
    setGoalDays("");
    setMotivation("");
    setReminderTime("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      emoji,
      category,
      frequency: frequencyType,
      frequencyType,
      frequencyDays: frequencyType === "specific_days" ? frequencyDays : undefined,
      frequencyTimesPerWeek: frequencyType === "times_per_week" ? frequencyTimesPerWeek : undefined,
      frequencyIntervalDays: frequencyType === "interval" ? frequencyIntervalDays : undefined,
      goalDays: goalDays ? parseInt(goalDays) : undefined,
      motivation: motivation.trim() || undefined,
      reminderTime: reminderTime || undefined,
    });

    resetForm();
    onClose();
  };

  const toggleDay = (dayId: string) => {
    setFrequencyDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-all"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-foreground">Novo Hábito</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Emoji selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                    emoji === e
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "bg-muted hover:bg-muted/80 hover:scale-105"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Nome do hábito</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Beber 2L de água"
              className="w-full px-4 py-3 bg-muted border border-border text-foreground rounded-xl outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                    category === cat.id
                      ? "bg-secondary/20 ring-2 ring-secondary text-secondary"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                >
                  <span>{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Frequência</label>
            <div className="grid grid-cols-2 gap-2">
              {frequencyOptions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequencyType(f.id)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    frequencyType === f.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {/* Specific days */}
            {frequencyType === "specific_days" && (
              <div className="flex gap-1.5 mt-3">
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                      frequencyDays.includes(day.id)
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            )}

            {/* Times per week */}
            {frequencyType === "times_per_week" && (
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={frequencyTimesPerWeek}
                  onChange={(e) => setFrequencyTimesPerWeek(Number(e.target.value))}
                  className="flex-1 accent-secondary"
                />
                <span className="text-sm font-semibold w-20 text-center text-foreground">
                  {frequencyTimesPerWeek}x / semana
                </span>
              </div>
            )}

            {/* Interval */}
            {frequencyType === "interval" && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-muted-foreground">A cada</span>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={frequencyIntervalDays}
                  onChange={(e) => setFrequencyIntervalDays(Number(e.target.value))}
                  className="w-16 px-3 py-2 bg-muted border border-border text-foreground rounded-lg text-center outline-none"
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Meta (opcional)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={goalDays}
                onChange={(e) => setGoalDays(e.target.value)}
                placeholder="Ex: 30"
                min={1}
                className="w-24 px-4 py-3 bg-muted border border-border text-foreground rounded-xl outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <span className="text-sm text-muted-foreground">dias consecutivos</span>
            </div>
          </div>

          {/* Motivation */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Por que esse hábito é importante para você?
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Ex: Quero ter mais energia e disposição no dia a dia..."
              rows={2}
              className="w-full px-4 py-3 bg-muted border border-border text-foreground rounded-xl outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Horário de lembrete (opcional)
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border text-foreground rounded-xl outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-all font-medium text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-40 btn-gradient"
            >
              Criar Hábito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
