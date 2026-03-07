import { useState } from "react";
import { X, Smile, Meh, Frown, ThumbsUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCheckInModalProps {
  isOpen: boolean;
  habitName: string;
  habitEmoji: string;
  onClose: () => void;
  onSubmit: (data: CheckInData) => void;
}

export interface CheckInData {
  mood: "great" | "good" | "neutral" | "hard";
  difficulty: number;
  note?: string;
}

const moods = [
  { id: "great" as const, label: "Muito bem", emoji: "😄", color: "hsl(142, 76%, 45%)" },
  { id: "good" as const, label: "Bem", emoji: "🙂", color: "hsl(220, 70%, 50%)" },
  { id: "neutral" as const, label: "Neutro", emoji: "😐", color: "hsl(45, 80%, 50%)" },
  { id: "hard" as const, label: "Difícil", emoji: "😤", color: "hsl(345, 60%, 35%)" },
];

const HabitCheckInModal = ({ isOpen, habitName, habitEmoji, onClose, onSubmit }: HabitCheckInModalProps) => {
  const [mood, setMood] = useState<CheckInData["mood"] | null>(null);
  const [difficulty, setDifficulty] = useState(3);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!mood) return;
    onSubmit({ mood, difficulty, note: note.trim() || undefined });
    setMood(null);
    setDifficulty(3);
    setNote("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-sm glass-card p-6 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-all">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="text-center mb-5">
          <span className="text-4xl">{habitEmoji}</span>
          <h3 className="text-lg font-bold mt-2">{habitName}</h3>
          <p className="text-sm text-muted-foreground">Como foi hoje?</p>
        </div>

        {/* Mood */}
        <div className="mb-5">
          <label className="text-sm text-muted-foreground mb-2 block">Como você se sentiu?</label>
          <div className="grid grid-cols-4 gap-2">
            {moods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 rounded-xl transition-all text-xs font-medium",
                  mood === m.id
                    ? "ring-2 scale-105"
                    : "bg-muted hover:bg-muted/80"
                )}
                style={mood === m.id ? { background: `${m.color}20`, borderColor: m.color, boxShadow: `0 0 0 2px ${m.color}` } : undefined}
              >
                <span className="text-2xl">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-5">
          <label className="text-sm text-muted-foreground mb-2 block">
            Dificuldade: <span className="font-semibold text-foreground">{difficulty}/5</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                  difficulty === d
                    ? "text-white"
                    : "bg-muted text-muted-foreground"
                )}
                style={difficulty === d ? { background: "hsl(220, 70%, 50%)" } : undefined}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-5">
          <label className="text-sm text-muted-foreground mb-2 block">Anotação (opcional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Como foi sua experiência..."
            className="w-full px-4 py-3 bg-muted rounded-xl outline-none text-sm"
            maxLength={140}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-all font-medium text-sm"
          >
            Pular
          </button>
          <button
            onClick={handleSubmit}
            disabled={!mood}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, hsl(345, 60%, 35%), hsl(220, 70%, 50%))" }}
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCheckInModal;
