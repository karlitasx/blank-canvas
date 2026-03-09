import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff, ChevronLeft, ChevronRight, PiggyBank } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SummaryCardsProps {
  balance: number;
  income: number;
  expenses: number;
  investments?: number;
  onMonthChange?: (date: Date) => void;
}

const SummaryCards = ({ balance, income, expenses, investments = 0, onMonthChange }: SummaryCardsProps) => {
  const [hidden, setHidden] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatCurrency = (value: number) => {
    if (hidden) return "R$ ••••";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
    onMonthChange?.(prev);
  };

  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    onMonthChange?.(next);
  };

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="space-y-3">
      {/* Main Balance Card with gradient */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary p-6">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          {/* Month Selector */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors text-primary-foreground/70 hover:text-primary-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground text-sm font-medium capitalize backdrop-blur-sm">
              📅 {monthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors text-primary-foreground/70 hover:text-primary-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Balance */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary-foreground/60" />
              <span className="text-sm text-primary-foreground/70">Saldo do mês</span>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-1">
              {formatCurrency(balance)}
            </p>
            <button
              onClick={() => setHidden(!hidden)}
              className="p-1.5 rounded-full hover:bg-primary-foreground/10 transition-colors text-primary-foreground/50 hover:text-primary-foreground"
              aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}
            >
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Breakdown row */}
          <div className="flex items-center justify-center gap-6 text-primary-foreground">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-primary-foreground/70">Entradas</span>
              </div>
              <p className="text-sm font-bold">{formatCurrency(income)}</p>
            </div>
            <div className="w-px h-8 bg-primary-foreground/15" />
            <div className="text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-primary-foreground/70">Saídas</span>
              </div>
              <p className="text-sm font-bold">{formatCurrency(expenses)}</p>
            </div>
            <div className="w-px h-8 bg-primary-foreground/15" />
            <div className="text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs text-primary-foreground/70">Investido</span>
              </div>
              <p className="text-sm font-bold">{formatCurrency(investments)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Income & Expenses mini cards */}
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
