import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Check } from "lucide-react";
import type { HairProfile } from "@/hooks/useHairCare";

const HAIR_TYPES = [
  { value: "1A", label: "1A - Liso fino", emoji: "💇‍♀️" },
  { value: "1B", label: "1B - Liso médio", emoji: "💇‍♀️" },
  { value: "1C", label: "1C - Liso grosso", emoji: "💇‍♀️" },
  { value: "2A", label: "2A - Ondulado leve", emoji: "🌊" },
  { value: "2B", label: "2B - Ondulado", emoji: "🌊" },
  { value: "2C", label: "2C - Ondulado forte", emoji: "🌊" },
  { value: "3A", label: "3A - Cacheado leve", emoji: "🌀" },
  { value: "3B", label: "3B - Cacheado", emoji: "🌀" },
  { value: "3C", label: "3C - Cacheado apertado", emoji: "🌀" },
  { value: "4A", label: "4A - Crespo", emoji: "✨" },
  { value: "4B", label: "4B - Crespo apertado", emoji: "✨" },
  { value: "4C", label: "4C - Crespo bem apertado", emoji: "✨" },
];

const POROSITY = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

const TEXTURES = [
  { value: "fino", label: "Fino" },
  { value: "medio", label: "Médio" },
  { value: "grosso", label: "Grosso" },
];

const LENGTHS = [
  { value: "curto", label: "Curto" },
  { value: "medio", label: "Médio" },
  { value: "longo", label: "Longo" },
  { value: "muito_longo", label: "Muito longo" },
];

const CHEMICAL_STATES = [
  { value: "virgem", label: "Virgem", emoji: "🌿" },
  { value: "colorido", label: "Colorido", emoji: "🎨" },
  { value: "descolorido", label: "Descolorido", emoji: "☀️" },
  { value: "quimica", label: "Com química", emoji: "🧪" },
];

const DAMAGE_LEVELS = [
  { value: "baixo", label: "Baixo", emoji: "💚" },
  { value: "medio", label: "Médio", emoji: "💛" },
  { value: "alto", label: "Alto", emoji: "🧡" },
  { value: "muito_alto", label: "Muito alto", emoji: "❤️" },
];

const SCALP_TYPES = [
  { value: "normal", label: "Normal" },
  { value: "oleoso", label: "Oleoso" },
  { value: "seco", label: "Seco" },
  { value: "misto", label: "Misto" },
  { value: "sensivel", label: "Sensível" },
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
  const ep = existingProfile as any;
  const [hairType, setHairType] = useState(ep?.hair_type || "");
  const [texture, setTexture] = useState(ep?.texture || "");
  const [porosity, setPorosity] = useState(ep?.porosity || "");
  const [length, setLength] = useState(ep?.length || "");
  const [chemicalState, setChemicalState] = useState(ep?.chemical_state || "");
  const [damageLevel, setDamageLevel] = useState(ep?.damage_level || "");
  const [scalpType, setScalpType] = useState(ep?.scalp_type || "");
  const [mainProblem, setMainProblem] = useState(ep?.main_problem || "");
  const [washFrequency, setWashFrequency] = useState(ep?.wash_frequency || "");
  const [goal, setGoal] = useState(ep?.goal || "");
  const [complaints, setComplaints] = useState(ep?.complaints || "");
  const [extraNotes, setExtraNotes] = useState(ep?.extra_notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      const p = existingProfile as any;
      setHairType(p.hair_type || "");
      setTexture(p.texture || "");
      setPorosity(p.porosity || "");
      setLength(p.length || "");
      setChemicalState(p.chemical_state || "");
      setDamageLevel(p.damage_level || "");
      setScalpType(p.scalp_type || "");
      setMainProblem(p.main_problem || "");
      setWashFrequency(p.wash_frequency || "");
      setGoal(p.goal || "");
      setComplaints(p.complaints || "");
      setExtraNotes(p.extra_notes || "");
    }
  }, [existingProfile]);

  const handleSave = async () => {
    if (!hairType || !texture || !mainProblem || !washFrequency || !goal) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        hair_type: hairType,
        texture,
        porosity: porosity || null,
        length: length || null,
        thickness: texture, // mapped from texture
        chemical_state: chemicalState || null,
        damage_level: damageLevel || null,
        scalp_type: scalpType || null,
        main_problem: mainProblem,
        wash_frequency: washFrequency,
        goal,
        complaints: complaints || null,
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
    required = false,
  }: {
    label: string;
    options: { value: string; label: string; emoji?: string }[];
    value: string;
    onChange: (v: string) => void;
    cols?: number;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className={`grid grid-cols-2 ${cols >= 3 ? "sm:grid-cols-3" : ""} ${cols >= 4 ? "lg:grid-cols-4" : ""} gap-2`}>
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
              <span className="text-xs sm:text-sm">{opt.label}</span>
              {value === opt.value && <Check className="w-3.5 h-3.5 ml-auto text-primary shrink-0" />}
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

      <OptionGrid label="Tipo de cabelo" options={HAIR_TYPES} value={hairType} onChange={setHairType} cols={4} required />
      <OptionGrid label="Porosidade" options={POROSITY} value={porosity} onChange={setPorosity} cols={3} />
      <OptionGrid label="Comprimento" options={LENGTHS} value={length} onChange={setLength} cols={4} />
      <OptionGrid label="Textura / Espessura" options={TEXTURES} value={texture} onChange={setTexture} cols={3} required />
      <OptionGrid label="Estado químico" options={CHEMICAL_STATES} value={chemicalState} onChange={setChemicalState} cols={4} />
      <OptionGrid label="Nível de dano" options={DAMAGE_LEVELS} value={damageLevel} onChange={setDamageLevel} cols={4} />
      <OptionGrid label="Tipo de couro cabeludo" options={SCALP_TYPES} value={scalpType} onChange={setScalpType} cols={3} />
      <OptionGrid label="Problema principal" options={PROBLEMS} value={mainProblem} onChange={setMainProblem} required />
      <OptionGrid label="Frequência de lavagem" options={WASH_FREQ} value={washFrequency} onChange={setWashFrequency} required />
      <OptionGrid label="Objetivo" options={GOALS} value={goal} onChange={setGoal} required />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Queixas principais (opcional)</label>
        <Textarea
          value={complaints}
          onChange={(e) => setComplaints(e.target.value)}
          placeholder="Descreva suas queixas sobre o cabelo..."
          className="resize-none"
          rows={3}
        />
      </div>

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
