import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Sun, Meh, Moon, Wind, Award } from "lucide-react";

const emotions = [
  { id: "energized", label: "Energizada", icon: Zap, color: "text-yellow-400" },
  { id: "motivated", label: "Motivada", icon: Sparkles, color: "text-emerald-400" },
  { id: "neutral", label: "Neutra", icon: Sun, color: "text-amber-300" },
  { id: "tired", label: "Cansada", icon: Moon, color: "text-indigo-400" },
  { id: "anxious", label: "Ansiosa", icon: Wind, color: "text-rose-400" },
  { id: "proud", label: "Orgulhosa", icon: Award, color: "text-sky-400" },
];

interface Props {
  selectedEmotion: string | null;
  onSelectEmotion: (id: string) => void;
  note: string;
  onNoteChange: (val: string) => void;
  energyLevel: number;
  onEnergyChange: (val: number) => void;
  gratitudes: string[];
  onGratitudesChange: (val: string[]) => void;
  onSave: () => void;
  alreadySaved: boolean;
}

const EmotionalCheckIn = ({
  selectedEmotion,
  onSelectEmotion,
  note,
  onNoteChange,
  energyLevel,
  onEnergyChange,
  gratitudes,
  onGratitudesChange,
  onSave,
  alreadySaved,
}: Props) => {
  return (
    <div className="animate-fade-in">
      {/* Main Question */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Como você está hoje?
        </h2>
        <p className="text-sm text-muted-foreground">
          Sua pausa de reconexão começa aqui
        </p>
      </div>

      {/* Emotion Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {emotions.map((emo) => {
          const Icon = emo.icon;
          const isSelected = selectedEmotion === emo.id;
          return (
            <button
              key={emo.id}
              onClick={() => onSelectEmotion(emo.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
                isSelected
                  ? "bg-primary/15 border-2 border-primary/40 scale-105"
                  : "bg-card border border-border hover:bg-muted/50 hover:scale-[1.02]"
              )}
            >
              <Icon className={cn("w-7 h-7 transition-colors", isSelected ? emo.color : "text-muted-foreground")} />
              <span className={cn("text-xs font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                {emo.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional Note */}
      {selectedEmotion && (
        <div className="mb-6 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-2 italic">
            Quer escrever algo sobre isso?
          </p>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Seus pensamentos são seguros aqui..."
            className="w-full glass-input px-4 py-3 rounded-xl resize-none h-20 text-sm"
          />
        </div>
      )}

      {/* Energy Slider */}
      {selectedEmotion && (
        <div className="mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">Nível de energia</p>
            <span className="font-semibold text-foreground">{energyLevel}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={energyLevel}
            onChange={(e) => onEnergyChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Baixa</span>
            <span>Alta</span>
          </div>
        </div>
      )}

      {/* Gratitudes */}
      {selectedEmotion && (
        <div className="mb-6 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-3">3 coisas pelas quais sou grata:</p>
          <div className="space-y-2">
            {gratitudes.map((g, i) => (
              <input
                key={i}
                type="text"
                value={g}
                onChange={(e) => {
                  const updated = [...gratitudes];
                  updated[i] = e.target.value;
                  onGratitudesChange(updated);
                }}
                placeholder={`Gratidão ${i + 1}...`}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      {selectedEmotion && (
        <button
          onClick={onSave}
          disabled={alreadySaved}
          className={cn(
            "w-full py-3 rounded-xl font-medium transition-all duration-300",
            alreadySaved
              ? "bg-muted text-muted-foreground cursor-default"
              : "btn-gradient hover:scale-[1.02]"
          )}
        >
          {alreadySaved ? "✨ Check-in salvo" : "Salvar meu check-in"}
        </button>
      )}
    </div>
  );
};

export default EmotionalCheckIn;
