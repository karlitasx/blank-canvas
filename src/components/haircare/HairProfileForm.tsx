import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Check } from "lucide-react";
import type { HairProfile } from "@/hooks/useHairCare";

const HAIR_TYPES = [
  { value: "liso", label: "Liso (1)", emoji: "💇‍♀️" },
  { value: "ondulado", label: "Ondulado (2)", emoji: "🌊" },
  { value: "cacheado", label: "Cacheado (3)", emoji: "🌀" },
  { value: "crespo", label: "Crespo (4)", emoji: "✨" },
];

const TEXTURES = [
  { value: "fino", label: "Fino" },
  { value: "medio", label: "Médio" },
  { value: "grosso", label: "Grosso" },
];

const PROBLEMS = [
  { value: "ressecamento", label: "Ressecamento", emoji: "🏜️" },
  { value: "quebra", label: "Quebra", emoji: "💔" },
  { value: "frizz", label: "Frizz", emoji: "⚡" },
  { value: "oleosidade", label: "Oleosidade", emoji: "💧" },
  { value: "queda", label: "Queda", emoji: "🍂" },
  { value: "quimicamente_danificado", label: "Dano químico", emoji: "🧪" },
];

const WASH_FREQ = [
  { value: "diario", label: "Diariamente" },
  { value: "2x_semana", label: "2x por semana" },
  { value: "3x_semana", label: "3x por semana" },
  { value: "semanal", label: "1x por semana" },
  { value: "quinzenal", label: "Quinzenal" },
];

const GOALS = [
  { value: "crescimento", label: "Crescimento", emoji: "📏" },
  { value: "hidratacao", label: "Hidratação", emoji: "💧" },
  { value: "reconstrucao", label: "Reconstrução", emoji: "🔧" },
  { value: "definicao", label: "Definição de cachos", emoji: "🌀" },
  { value: "brilho", label: "Brilho e maciez", emoji: "✨" },
  { value: "anti_queda", label: "Reduzir queda", emoji: "🛡️" },
];

interface HairProfileFormProps {
  existingProfile: HairProfile | null;
  onSave: (data: any) => Promise<void>;
}

const HairProfileForm = ({ existingProfile, onSave }: HairProfileFormProps) => {
  const [hairType, setHairType] = useState(existingProfile?.hair_type || "");
  const [texture, setTexture] = useState(existingProfile?.texture || "");
  const [mainProblem, setMainProblem] = useState(existingProfile?.main_problem || "");
  const [washFrequency, setWashFrequency] = useState(existingProfile?.wash_frequency || "");
  const [goal, setGoal] = useState(existingProfile?.goal || "");
  const [extraNotes, setExtraNotes] = useState(existingProfile?.extra_notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      setHairType(existingProfile.hair_type);
      setTexture(existingProfile.texture);
      setMainProblem(existingProfile.main_problem);
      setWashFrequency(existingProfile.wash_frequency);
      setGoal(existingProfile.goal);
      setExtraNotes(existingProfile.extra_notes || "");
    }
  }, [existingProfile]);

  const handleSave = async () => {
    if (!hairType || !texture || !mainProblem || !washFrequency || !goal) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        hair_type: hairType,
        texture,
        main_problem: mainProblem,
        wash_frequency: washFrequency,
        goal,
        extra_notes: extraNotes || null,
      });
      toast({ title: "Perfil capilar salvo ✨" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const OptionGrid = ({
    label,
    options,
    value,
    onChange,
    cols = 3,
  }: {
    label: string;
    options: { value: string; label: string; emoji?: string }[];
    value: string;
    onChange: (v: string) => void;
    cols?: number;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className={`grid grid-cols-2 ${cols >= 3 ? "sm:grid-cols-3" : ""} gap-2`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`p-3 rounded-xl border text-sm text-left transition-all ${
              value === opt.value
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                : "border-border hover:border-primary/40 hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              {opt.emoji && <span>{opt.emoji}</span>}
              <span>{opt.label}</span>
              {value === opt.value && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
          <Sparkles className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h3 className="font-semibold">Seu Perfil Capilar</h3>
          <p className="text-xs text-muted-foreground">
            {existingProfile ? "Atualize suas informações" : "Preencha para receber seu cronograma personalizado"}
          </p>
        </div>
      </div>

      <OptionGrid label="Tipo de cabelo" options={HAIR_TYPES} value={hairType} onChange={setHairType} />
      <OptionGrid label="Textura" options={TEXTURES} value={texture} onChange={setTexture} cols={3} />
      <OptionGrid label="Problema principal" options={PROBLEMS} value={mainProblem} onChange={setMainProblem} />
      <OptionGrid label="Frequência de lavagem" options={WASH_FREQ} value={washFrequency} onChange={setWashFrequency} />
      <OptionGrid label="Objetivo" options={GOALS} value={goal} onChange={setGoal} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Observações adicionais (opcional)</label>
        <Textarea
          value={extraNotes}
          onChange={(e) => setExtraNotes(e.target.value)}
          placeholder="Ex: Uso progressiva, cabelo com luzes, etc."
          className="resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full btn-gradient">
        {saving ? "Salvando..." : existingProfile ? "Atualizar perfil" : "Salvar perfil capilar"}
      </Button>
    </div>
  );
};

export default HairProfileForm;
