import { useState, useMemo } from "react";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Target,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  isSameDay,
  isWithinInterval,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: Date;
}

interface ExpenseOverviewProps {
  transactions: Transaction[];
  onAddExpense: () => void;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const chartConfig = {
  despesas: {
    label: "Despesas",
    color: "hsl(345, 60%, 35%)",
  },
};

const ExpenseOverview = ({ transactions, onAddExpense }: ExpenseOverviewProps) => {
  const [chartView, setChartView] = useState<"week" | "month">("month");
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(() => {
    const saved = localStorage.getItem("vidaflow_monthly_limit");
    return saved ? Number(saved) : null;
  });
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState("");

  const now = new Date();
  const expenses = useMemo(
    () => transactions.filter((t) => t.type === "expense"),
    [transactions]
  );

  // ---- ETAPA 1: Summary stats ----
  const todayTotal = useMemo(
    () =>
      expenses
        .filter((t) => isSameDay(t.date, now))
        .reduce((s, t) => s + t.amount, 0),
    [expenses]
  );

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekTotal = useMemo(
    () =>
      expenses
        .filter((t) => isWithinInterval(t.date, { start: weekStart, end: now }))
        .reduce((s, t) => s + t.amount, 0),
    [expenses]
  );

  const monthStart = startOfMonth(now);
  const monthTotal = useMemo(
    () =>
      expenses
        .filter((t) => isWithinInterval(t.date, { start: monthStart, end: now }))
        .reduce((s, t) => s + t.amount, 0),
    [expenses]
  );

  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));
  const prevMonthTotal = useMemo(
    () =>
      expenses
        .filter((t) =>
          isWithinInterval(t.date, { start: prevMonthStart, end: prevMonthEnd })
        )
        .reduce((s, t) => s + t.amount, 0),
    [expenses]
  );

  const comparison =
    prevMonthTotal > 0
      ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100
      : monthTotal > 0
      ? 100
      : 0;

  // ---- ETAPA 2: Chart data ----
  const chartData = useMemo(() => {
    if (chartView === "month") {
      const days = eachDayOfInterval({ start: monthStart, end: now });
      return days.map((day) => ({
        name: format(day, "dd", { locale: ptBR }),
        despesas: expenses
          .filter((t) => isSameDay(t.date, day))
          .reduce((s, t) => s + t.amount, 0),
      }));
    } else {
      const wStart = startOfWeek(now, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: wStart, end: now });
      return days.map((day) => ({
        name: format(day, "EEE", { locale: ptBR }),
        despesas: expenses
          .filter((t) => isSameDay(t.date, day))
          .reduce((s, t) => s + t.amount, 0),
      }));
    }
  }, [expenses, chartView]);

  // ---- ETAPA 3: Monthly limit ----
  const limitPercent = monthlyLimit ? Math.min((monthTotal / monthlyLimit) * 100, 100) : 0;
  const isNearLimit = monthlyLimit ? monthTotal >= monthlyLimit * 0.8 : false;
  const isOverLimit = monthlyLimit ? monthTotal > monthlyLimit : false;

  const handleSaveLimit = () => {
    const val = parseFloat(limitInput.replace(",", "."));
    if (!isNaN(val) && val > 0) {
      setMonthlyLimit(val);
      localStorage.setItem("vidaflow_monthly_limit", String(val));
    }
    setEditingLimit(false);
    setLimitInput("");
  };

  // ---- ETAPA 4: Empty state ----
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(345,60%,35%)]/10 flex items-center justify-center mb-6">
          <TrendingDown className="w-8 h-8 text-[hsl(345,60%,35%)]" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhuma saída registrada</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
          Você ainda não registrou nenhuma saída. Comece adicionando seu primeiro gasto.
        </p>
        <Button onClick={onAddExpense} className="gap-2" style={{ background: "hsl(345, 60%, 35%)" }}>
          <Plus className="w-4 h-4" />
          Adicionar Despesa
        </Button>
      </div>
    );
  }

  const summaryCards = [
    { label: "Hoje", value: todayTotal, icon: CalendarDays },
    { label: "Semana", value: weekTotal, icon: CalendarRange },
    { label: "Mês", value: monthTotal, icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-card p-4 rounded-2xl flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Icon className="w-4 h-4" />
                {card.label}
              </div>
              <span className="text-xl font-bold">{formatCurrency(card.value)}</span>
            </div>
          );
        })}

        {/* Comparison card */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            {comparison > 0 ? (
              <TrendingUp className="w-4 h-4 text-[hsl(345,60%,35%)]" />
            ) : comparison < 0 ? (
              <TrendingDown className="w-4 h-4 text-[hsl(220,70%,50%)]" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            vs. Mês anterior
          </div>
          <span
            className={`text-xl font-bold ${
              comparison > 0
                ? "text-[hsl(345,60%,35%)]"
                : comparison < 0
                ? "text-[hsl(220,70%,50%)]"
                : ""
            }`}
          >
            {comparison === 0 ? "—" : `${comparison > 0 ? "+" : ""}${comparison.toFixed(1)}%`}
          </span>
          <span className="text-xs text-muted-foreground">
            {prevMonthTotal > 0 ? formatCurrency(prevMonthTotal) : "Sem dados"}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Evolução de Saídas</h3>
          <div className="flex gap-2">
            {(["week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setChartView(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  chartView === v
                    ? "bg-[hsl(220,70%,50%)] text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {v === "week" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={chartView === "month" ? 8 : 28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="hsl(var(--border))"
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="hsl(var(--border))"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="despesas"
                fill="hsl(345, 60%, 35%)"
                radius={[4, 4, 0, 0]}
                name="Despesas"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Monthly Limit */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[hsl(220,70%,50%)]" />
            <h3 className="text-lg font-semibold">Meta Mensal de Gastos</h3>
          </div>
          <button
            onClick={() => {
              setEditingLimit(true);
              setLimitInput(monthlyLimit ? String(monthlyLimit) : "");
            }}
            className="text-sm text-[hsl(220,70%,50%)] hover:underline"
          >
            {monthlyLimit ? "Editar" : "Definir limite"}
          </button>
        </div>

        {editingLimit ? (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">R$</span>
            <input
              type="number"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              placeholder="Ex: 3000"
              className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveLimit()}
            />
            <Button size="sm" onClick={handleSaveLimit}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingLimit(false)}>
              Cancelar
            </Button>
          </div>
        ) : monthlyLimit ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(monthTotal)} de {formatCurrency(monthlyLimit)}
              </span>
              <span
                className={`font-semibold ${
                  isOverLimit
                    ? "text-[hsl(345,60%,35%)]"
                    : isNearLimit
                    ? "text-[hsl(345,60%,45%)]"
                    : "text-[hsl(220,70%,50%)]"
                }`}
              >
                {limitPercent.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${limitPercent}%`,
                  background: isOverLimit
                    ? "hsl(345, 60%, 35%)"
                    : isNearLimit
                    ? "hsl(345, 60%, 45%)"
                    : "hsl(220, 70%, 50%)",
                }}
              />
            </div>
            {isOverLimit && (
              <div className="flex items-center gap-2 text-sm text-[hsl(345,60%,35%)]">
                <AlertTriangle className="w-4 h-4" />
                Você ultrapassou o limite em {formatCurrency(monthTotal - monthlyLimit)}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Defina um limite mensal para acompanhar seus gastos com mais controle.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseOverview;
