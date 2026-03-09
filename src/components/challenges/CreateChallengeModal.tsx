import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CreateChallengeInput, CHALLENGE_TYPES, DIFFICULTY_LEVELS, ChallengeType, ChallengeDifficulty } from "@/types/challenges";
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, Globe, Lock, Sparkles, Target, Zap } from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateChallengeInput) => Promise<any>;
}

const CreateChallengeModal = ({ open, onOpenChange, onSubmit }: CreateChallengeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("custom");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>("medium");
  const [targetValue, setTargetValue] = useState("30");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [isPublic, setIsPublic] = useState(true);

  const selectedDifficulty = DIFFICULTY_LEVELS.find(d => d.value === difficulty)!;
  const selectedType = CHALLENGE_TYPES.find(t => t.value === challengeType);

  const handleSubmit = async () => {
    if (!title.trim() || !targetValue || !startDate || !endDate) return;

    setLoading(true);
    try {
      const result = await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        emoji: selectedDifficulty.icon,
        challenge_type: challengeType,
        target_value: parseInt(targetValue),
        start_date: startDate,
        end_date: endDate,
        is_public: isPublic,
        difficulty,
        points_per_checkin: selectedDifficulty.points,
      });

      if (result) {
        resetForm();
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setChallengeType("custom");
    setDifficulty("medium");
    setTargetValue("30");
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setEndDate(format(addDays(new Date(), 30), "yyyy-MM-dd"));
    setIsPublic(true);
    setStep(1);
  };

  const canGoNext = () => {
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return true;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-card border-border gap-0">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Novo Desafio</h2>
                <p className="text-xs text-muted-foreground">Passo {step} de {totalSteps}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="flex gap-1.5 mt-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    i < step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[280px]">
          {/* Step 1: Info básica */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nome do Desafio</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: 30 dias na academia"
                  className="h-12 rounded-xl text-base"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Descrição <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Regras, motivação ou detalhes do desafio..."
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tipo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CHALLENGE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setChallengeType(type.value)}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all text-sm",
                        challengeType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      <span className="text-lg">{type.emoji}</span>
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dificuldade e Pontos */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Nível de Dificuldade
                </Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Define quantos pontos cada check-in vale
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setDifficulty(level.value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                        difficulty === level.value
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border/50 hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <span className="text-3xl">{level.icon}</span>
                      <span className="font-semibold text-sm">{level.label}</span>
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full",
                        difficulty === level.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Sparkles className="w-3 h-3" />
                        {level.points} pts/check-in
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedDifficulty.icon}</div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedDifficulty.label} — {selectedDifficulty.points} pontos por check-in
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Meta de {targetValue} check-ins = até {selectedDifficulty.points * parseInt(targetValue || "0")} pontos no total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Meta e Datas */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Meta ({selectedType?.unit})
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="30"
                  className="h-12 rounded-xl text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Início
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Fim</Label>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{isPublic ? "Público" : "Privado"}</p>
                    <p className="text-xs text-muted-foreground">
                      {isPublic ? "Qualquer pessoa pode participar" : "Somente por convite"}
                    </p>
                  </div>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl border border-border/50 bg-card space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Resumo</p>
                <p className="font-semibold text-foreground">{title || "Sem título"}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{selectedDifficulty.icon} {selectedDifficulty.label}</span>
                  <span>{selectedDifficulty.points} pts/check-in</span>
                  <span>{targetValue} {selectedType?.unit}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          )}
          
          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canGoNext()}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !targetValue}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {loading ? "Criando..." : "Criar Desafio 🚀"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeModal;