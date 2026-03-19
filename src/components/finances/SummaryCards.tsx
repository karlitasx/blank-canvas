import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff, ChevronLeft, ChevronRight, PiggyBank } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SummaryCardsProps {
  balance: number;
  income: number;
  expenses: number;
  investments?: number;
  selectedMonth?: Date;
  onMonthChange?: (date: Date) => void;
}

const SummaryCards = ({ balance, income, expenses, investments = 0, selectedMonth, onMonthChange }: SummaryCardsProps) => {
  const [hidden, setHidden] = useState(false);
  const currentMonth = selectedMonth || new Date();

  const formatCurrency = (value: number) => {
    if (hidden) return "R$ ••••";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePrevMonth = () => {
    onMonthChange?.(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange?.(addMonths(currentMonth, 1));
  };

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="space-y-3">
      {/* Main Balance Card - Gradient Style */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(var(--gradient-wine))] via-[hsl(var(--primary))] to-[hsl(var(--gradient-blue))]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/3 rounded-full" />
        
        <div className="relative z-10 p-5 md:p-6">
          {/* Month Selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
              <button onClick={handlePrevMonth} className="p-0.5 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-white/80" />
              </button>
              <span className="text-sm font-semibold text-white capitalize min-w-[120px] text-center">
                📅 {monthLabel}
              </span>
              <button onClick={handleNextMonth} className="p-0.5 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-white/80" />
              </button>
            </div>
            <button
              onClick={() => setHidden(!hidden)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white/80"
              aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}
            >
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Balance */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-white/70" />
              <span className="text-sm font-medium text-white/70">Saldo do mês</span>
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/70 font-medium">Entradas</span>
              </div>
              <p className="text-sm md:text-base font-bold text-emerald-300">
                {formatCurrency(income)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-white/70 font-medium">Saídas</span>
              </div>
              <p className="text-sm md:text-base font-bold text-red-300">
                {formatCurrency(expenses)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs text-white/70 font-medium">Investido</span>
              </div>
              <p className="text-sm md:text-base font-bold text-blue-300">
                {formatCurrency(investments)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
