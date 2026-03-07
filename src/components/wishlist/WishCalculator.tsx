import { useState } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WishCalculatorProps {
  totalRemaining: number;
}

const WishCalculator = ({ totalRemaining }: WishCalculatorProps) => {
  const [months, setMonths] = useState<string>("12");

  const monthlyAmount = months && parseInt(months) > 0
    ? totalRemaining / parseInt(months)
    : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg logo-gradient">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold">Calculadora de Economia</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Descubra quanto economizar por mês para alcançar todos os seus desejos
      </p>

      <div className="space-y-4">
        <div>
          <Label>Valor restante total</Label>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(totalRemaining)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="months">Em quantos meses deseja alcançar?</Label>
          <Input
            id="months"
            type="number"
            min="1"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="bg-input border-border"
            placeholder="12"
          />
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">
            Economia mensal necessária:
          </p>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formatCurrency(monthlyAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {months && parseInt(months) > 0
              ? `Por ${months} meses`
              : "Insira a quantidade de meses"}
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2">
          {[3, 6, 12, 24].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m.toString())}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                months === m.toString()
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {m} meses
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishCalculator;
