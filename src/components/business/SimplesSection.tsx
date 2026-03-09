import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusinessFinance } from "@/hooks/useBusinessFinance";

interface Props {
  biz: ReturnType<typeof useBusinessFinance>;
}

const SimplesSection = ({ biz }: Props) => {
  const [simulatedRevenue, setSimulatedRevenue] = useState("");
  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const simulatedTax = simulatedRevenue ? biz.estimateSimplesTax(Number(simulatedRevenue)) : 0;

  const getFaixa = (monthly: number): string => {
    const annual = monthly * 12;
    if (annual <= 180000) return "1ª Faixa (6%)";
    if (annual <= 360000) return "2ª Faixa (11,2%)";
    if (annual <= 720000) return "3ª Faixa (13,5%)";
    if (annual <= 1800000) return "4ª Faixa (16%)";
    return "5ª Faixa (21%)";
  };

  return (
    <div className="space-y-4">
      {/* Current tax estimate */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Imposto Estimado do Mês
        </h3>
        <div className="text-center py-4">
          <p className="text-3xl font-extrabold text-primary">{formatCurrency(biz.estimatedTax)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Baseado no faturamento de {formatCurrency(biz.monthlySales)}
          </p>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {getFaixa(biz.monthlySales)}
          </span>
        </div>
      </div>

      {/* Tax simulator */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4 text-secondary" />
          Simulador de Imposto
        </h3>
        <div>
          <Label>Faturamento mensal estimado</Label>
          <Input
            type="number"
            placeholder="Ex: 15000"
            value={simulatedRevenue}
            onChange={e => setSimulatedRevenue(e.target.value)}
          />
        </div>
        {simulatedRevenue && Number(simulatedRevenue) > 0 && (
          <div className="p-4 rounded-xl bg-muted/30 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Imposto estimado:</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(simulatedTax)}</p>
            <span className="inline-block text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
              {getFaixa(Number(simulatedRevenue))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplesSection;
