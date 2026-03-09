import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from "lucide-react";

interface SummaryCardsProps {
  balance: number;
  income: number;
  expenses: number;
  investments?: number;
}

const SummaryCards = ({ balance, income, expenses, investments = 0 }: SummaryCardsProps) => {
  const [hidden, setHidden] = useState(false);

  const formatCurrency = (value: number) => {
    if (hidden) return "R$ ••••";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-3">
      {/* Main Balance Card */}
      <div className="glass-card p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm font-medium text-muted-foreground">Saldo Atual</span>
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
        </div>
        <p className={`text-3xl md:text-4xl font-extrabold mb-1 ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
          {formatCurrency(balance)}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          {balance >= 0 ? "Resultado positivo" : "Resultado negativo"}
        </p>
        <button
          onClick={() => setHidden(!hidden)}
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}
        >
          {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Income & Expenses Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Receitas</span>
          </div>
          <p className="text-xl font-bold text-emerald-500">
            {formatCurrency(income)}
          </p>
        </div>

        <div className="glass-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Despesas</span>
          </div>
          <p className="text-xl font-bold text-destructive">
            {formatCurrency(expenses)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
