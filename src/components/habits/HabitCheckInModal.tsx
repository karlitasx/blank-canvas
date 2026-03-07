import { useState } from "react";
import { X } from "lucide-react";
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
  { id: "great" as const, label: "Muito bem", emoji: "😄", cls: "bg-success/20 ring-success" },
  { id: "good" as const, label: "Bem", emoji: "🙂", cls: "bg-secondary/20 ring-secondary" },
  { id: "neutral" as const, label: "Neutro", emoji: "😐", cls: "bg-accent/20 ring-accent" },
  { id: "hard" as const, label: "Difícil", emoji: "😤", cls: "bg-primary/20 ring-primary" },
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

      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 animate-scale-in shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-all">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="text-center mb-5">
          <span className="text-4xl">{habitEmoji}</span>
          <h3 className="text-lg font-bold mt-2 text-foreground">{habitName}</h3>
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
                    ? `${m.cls} ring-2 scale-105`
                    : "bg-muted hover:bg-muted/80"
                )}
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
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
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
            className="w-full px-4 py-3 bg-muted border border-border text-foreground rounded-xl outline-none text-sm"
            maxLength={140}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 transition-all font-medium text-sm text-foreground"
          >
            Pular
          </button>
          <button
            onClick={handleSubmit}
            disabled={!mood}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-40 btn-gradient"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCheckInModal;
