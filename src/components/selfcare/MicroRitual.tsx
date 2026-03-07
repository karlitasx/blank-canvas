import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Wind, Heart, Droplets, Flower2, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface RitualSuggestion {
  type: string;
  icon: React.ElementType;
  title: string;
  description: string;
  duration: string;
}

const ritualsByEmotion: Record<string, RitualSuggestion[]> = {
  energized: [
    { type: "affirmation", icon: Heart, title: "Afirmação", description: "\"Minha energia é meu poder. Hoje eu canalizo ela com propósito.\"", duration: "30s" },
    { type: "action", icon: Droplets, title: "Ação simples", description: "Beba um copo de água com intenção. Sinta cada gole.", duration: "1 min" },
  ],
  motivated: [
    { type: "reflection", icon: Flower2, title: "Reflexão", description: "O que me motivou a chegar até aqui? Honre esse caminho.", duration: "1 min" },
    { type: "breathing", icon: Wind, title: "Respiração 4-4-4", description: "Inspire 4s. Segure 4s. Expire 4s. Repita 3 vezes.", duration: "1 min" },
  ],
  neutral: [
    { type: "breathing", icon: Wind, title: "Respiração consciente", description: "Feche os olhos. 5 respirações profundas. Sinta seu corpo.", duration: "2 min" },
    { type: "reflection", icon: Flower2, title: "Uma pergunta", description: "O que eu preciso ouvir agora que ninguém está me dizendo?", duration: "1 min" },
  ],
  tired: [
    { type: "action", icon: Droplets, title: "Pausa gentil", description: "Alongue os ombros. Solte a mandíbula. Você merece descanso.", duration: "2 min" },
    { type: "affirmation", icon: Heart, title: "Afirmação", description: "\"Descansar não é fraqueza. É sabedoria.\"", duration: "30s" },
  ],
  anxious: [
    { type: "breathing", icon: Wind, title: "Respiração 4-7-8", description: "Inspire 4s. Segure 7s. Expire 8s. Seu corpo está seguro.", duration: "2 min" },
    { type: "action", icon: Droplets, title: "Aterramento", description: "Nomeie 5 coisas que você vê. 4 que toca. 3 que ouve.", duration: "2 min" },
  ],
  proud: [
    { type: "reflection", icon: Flower2, title: "Celebração", description: "Escreva mentalmente uma carta de gratidão para você mesma.", duration: "1 min" },
    { type: "affirmation", icon: Heart, title: "Afirmação", description: "\"Eu mereço celebrar minhas conquistas, por menores que pareçam.\"", duration: "30s" },
  ],
};

interface Props {
  emotionalState: string;
  ritualCompleted: boolean;
  onCompleteRitual: (type: string) => void;
}

const MicroRitual = ({ emotionalState, ritualCompleted, onCompleteRitual }: Props) => {
  const [selectedRitual, setSelectedRitual] = useState<number | null>(null);

  const rituals = useMemo(() => ritualsByEmotion[emotionalState] || ritualsByEmotion.neutral, [emotionalState]);

  const handleComplete = (type: string) => {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#7f1d1d", "#1e3a8a", "#f59e0b"],
    });
    onCompleteRitual(type);
  };

  if (ritualCompleted) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <p className="text-foreground font-medium mb-1">Ritual concluído ✨</p>
        <p className="text-sm text-muted-foreground">Você dedicou um momento para si</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-lg font-light text-foreground/90 mb-1">Seu micro-ritual</h3>
        <p className="text-xs text-muted-foreground">Escolha um momento para você — leva menos de 2 minutos</p>
      </div>

      <div className="space-y-3">
        {rituals.map((ritual, i) => {
          const Icon = ritual.icon;
          const isSelected = selectedRitual === i;
          return (
            <div key={i}>
              <button
                onClick={() => setSelectedRitual(isSelected ? null : i)}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all duration-300",
                  isSelected
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-card border border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{ritual.title}</p>
                    <p className="text-xs text-muted-foreground">{ritual.duration}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 animate-fade-in">
                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                      {ritual.description}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleComplete(ritual.type); }}
                      className="mt-3 btn-accent px-5 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Concluir ritual
                    </button>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MicroRitual;
