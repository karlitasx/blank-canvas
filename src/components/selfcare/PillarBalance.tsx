import { useState } from "react";
import { cn } from "@/lib/utils";
import { Brain, Activity, Zap, Plus, Check } from "lucide-react";
import type { PillarAction } from "@/hooks/useSelfCare";

const pillars = [
  {
    id: "mind" as const,
    name: "Mente",
    icon: Brain,
    suggestions: ["Meditei", "Li algumas páginas", "Escrevi 3 coisas boas", "Refleti sobre meu dia"],
  },
  {
    id: "body" as const,
    name: "Corpo",
    icon: Activity,
    suggestions: ["Caminhei 10 min", "Alonguei", "Fiz exercício", "Bebi água suficiente"],
  },
  {
    id: "energy" as const,
    name: "Energia",
    icon: Zap,
    suggestions: ["Meditei 2 min", "Respiração consciente", "Descansei", "Dormi bem"],
  },
];

interface Props {
  todayActions: PillarAction[];
  weeklyActions: PillarAction[];
  onAddAction: (pillar: "mind" | "body" | "energy", text: string) => void;
}

const PillarBalance = ({ todayActions, weeklyActions, onAddAction }: Props) => {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState("");

  const getPillarCount = (pillarId: string, actions: PillarAction[]) =>
    actions.filter(a => a.pillar === pillarId).length;

  const getWeeklyProgress = (pillarId: string) => {
    const count = getPillarCount(pillarId, weeklyActions);
    return Math.min(100, Math.round((count / 7) * 100));
  };

  const handleAddSuggestion = (pillarId: "mind" | "body" | "energy", text: string) => {
    const alreadyDone = todayActions.some(a => a.pillar === pillarId && a.action_text === text);
    if (!alreadyDone) onAddAction(pillarId, text);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-lg font-light text-foreground/90 mb-1">Equilíbrio</h3>
        <p className="text-xs text-muted-foreground">Mente · Corpo · Energia</p>
      </div>

      <div className="space-y-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isExpanded = expandedPillar === pillar.id;
          const todayCount = getPillarCount(pillar.id, todayActions);
          const weeklyPct = getWeeklyProgress(pillar.id);

          return (
            <div key={pillar.id} className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                className="w-full flex items-center gap-3 p-4 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{pillar.name}</p>
                  <p className="text-xs text-muted-foreground">{todayCount} ações hoje</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Semana</p>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${weeklyPct}%` }}
                    />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 bg-card animate-fade-in">
                  <div className="border-t border-border pt-3 space-y-2">
                    {pillar.suggestions.map((sug) => {
                      const done = todayActions.some(a => a.pillar === pillar.id && a.action_text === sug);
                      return (
                        <button
                          key={sug}
                          onClick={() => handleAddSuggestion(pillar.id, sug)}
                          disabled={done}
                          className={cn(
                            "w-full flex items-center gap-2 p-2.5 rounded-lg text-sm transition-all text-left",
                            done
                              ? "bg-primary/10 text-primary"
                              : "bg-muted/30 hover:bg-muted/60 text-foreground/80"
                          )}
                        >
                          {done ? <Check className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 shrink-0 text-muted-foreground" />}
                          {sug}
                        </button>
                      );
                    })}

                    {/* Custom action */}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={customAction}
                        onChange={(e) => setCustomAction(e.target.value)}
                        placeholder="Ação personalizada..."
                        className="flex-1 glass-input px-3 py-2 rounded-lg text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customAction.trim()) {
                            onAddAction(pillar.id, customAction.trim());
                            setCustomAction("");
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (customAction.trim()) {
                            onAddAction(pillar.id, customAction.trim());
                            setCustomAction("");
                          }
                        }}
                        className="btn-accent px-3 py-2 rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PillarBalance;
