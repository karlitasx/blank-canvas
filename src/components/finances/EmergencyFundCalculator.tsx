import { useState } from "react";
import { Shield, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

type WorkType = "clt" | "autonomo" | "empresario";

const workTypes: { key: WorkType; label: string; months: string; min: number; max: number }[] = [
  { key: "clt", label: "CLT", months: "3-6 meses", min: 3, max: 6 },
  { key: "autonomo", label: "Autônomo", months: "6-12 meses", min: 6, max: 12 },
  { key: "empresario", label: "Empresário", months: "12-24 meses", min: 12, max: 24 },
];

const EmergencyFundCalculator = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [currentSaved, setCurrentSaved] = useState("");
  const [workType, setWorkType] = useState<WorkType>("autonomo");

  const expenses = parseFloat(monthlyExpenses) || 0;
  const saved = parseFloat(currentSaved) || 0;
  const selected = workTypes.find((w) => w.key === workType)!;
  const idealMin = expenses * selected.min;
  const idealMax = expenses * selected.max;
  const progress = idealMax > 0 ? Math.min(100, (saved / idealMax) * 100) : 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleCurrencyInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (parseInt(value || "0") / 100).toFixed(2);
    setter(value);
  };

  const formatDisplay = (value: string) => {
    if (!value) return "R$  0,00";
    return parseFloat(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-violet-500/10 flex-shrink-0">
          <Shield className="w-5 h-5 text-violet-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Calculadora de Reserva de Emergência</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>A reserva de emergência é um valor guardado para cobrir despesas imprevistas como demissão, problemas de saúde ou consertos urgentes.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Descubra quanto você precisa ter guardado para emergências
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="font-semibold">Despesas Fixas Mensais</Label>
          <Input
            type="text"
            value={formatDisplay(monthlyExpenses)}
            onChange={(e) => handleCurrencyInput(e, setMonthlyExpenses)}
            className="h-12 text-base"
            placeholder="R$ 0,00"
          />
          <p className="text-xs text-muted-foreground">Aluguel, contas, alimentação, transporte...</p>
        </div>

        <div className="space-y-2">
          <Label className="font-semibold">Quanto Você Já Tem Guardado</Label>
          <Input
            type="text"
            value={formatDisplay(currentSaved)}
            onChange={(e) => handleCurrencyInput(e, setCurrentSaved)}
            className="h-12 text-base"
            placeholder="R$ 0,00"
          />
          <p className="text-xs text-muted-foreground">Valor atual da sua reserva de emergência</p>
        </div>
      </div>

      {/* Work Type */}
      <div className="space-y-3">
        <Label className="font-semibold">Tipo de Trabalho</Label>
        <div className="flex flex-col gap-3">
          {workTypes.map((wt) => (
            <button
              key={wt.key}
              onClick={() => setWorkType(wt.key)}
              className={`p-4 rounded-xl text-left transition-all border-2 ${
                workType === wt.key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <p className={`font-semibold text-sm ${workType === wt.key ? "text-primary" : ""}`}>{wt.label}</p>
              <p className={`text-xs ${workType === wt.key ? "text-primary/70" : "text-muted-foreground"}`}>{wt.months}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {expenses > 0 && (
        <div className="space-y-4 pt-2">
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta ideal</span>
              <span className="font-semibold">
                {formatCurrency(idealMin)} – {formatCurrency(idealMax)}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className={`font-semibold ${progress >= 100 ? "text-green-500" : "text-primary"}`}>
                {progress.toFixed(0)}%
              </span>
            </div>
            {idealMax - saved > 0 && (
              <p className="text-xs text-muted-foreground">
                Faltam <span className="font-medium text-foreground">{formatCurrency(Math.max(0, idealMax - saved))}</span> para atingir a meta máxima
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyFundCalculator;
