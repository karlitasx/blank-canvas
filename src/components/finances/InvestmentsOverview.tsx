import { useMemo } from "react";
import { TrendingUp, PiggyBank, Calendar, ArrowUpRight, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyState } from "@/components/ui/empty-state";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

interface InvestmentsOverviewProps {
  transactions: Transaction[];
  onAddInvestment: () => void;
}

const investmentCategories = [
  "Investimento / Objetivo",
  "Investimento",
  "Investimentos",
  "Poupança",
  "Renda Fixa",
  "Renda Variável",
  "Ações",
  "Tesouro Direto",
  "CDB",
  "Fundos",
  "Criptomoedas",
  "Previdência",
];

const isInvestment = (t: Transaction) =>
  investmentCategories.some(
    (cat) => t.category.toLowerCase().includes(cat.toLowerCase()) || t.description.toLowerCase().includes(cat.toLowerCase())
  );

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const InvestmentsOverview = ({ transactions, onAddInvestment }: InvestmentsOverviewProps) => {
  const investmentTransactions = useMemo(
    () => transactions.filter(isInvestment).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  const totalInvested = useMemo(
    () => investmentTransactions.reduce((sum, t) => sum + t.amount, 0),
    [investmentTransactions]
  );

  const thisMonthInvested = useMemo(() => {
    const now = new Date();
    return investmentTransactions
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [investmentTransactions]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    investmentTransactions.forEach((t) => {
      const current = map.get(t.category) || 0;
      map.set(t.category, current + t.amount);
    });
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount, percentage: totalInvested > 0 ? (amount / totalInvested) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [investmentTransactions, totalInvested]);

  if (investmentTransactions.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Nenhum investimento registrado"
        description="Registre suas aplicações e acompanhe a evolução dos seus investimentos ao longo do tempo."
        action={{ label: "Registrar Investimento", onClick: onAddInvestment }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <PiggyBank className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Total Investido</span>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalInvested)}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Este Mês</span>
          </div>
          <p className="text-xl font-bold text-foreground">{formatCurrency(thisMonthInvested)}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-secondary/10">
              <ArrowUpRight className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Aportes</span>
          </div>
          <p className="text-xl font-bold text-foreground">{investmentTransactions.length}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 1 && (
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            Distribuição por Categoria
          </h3>
          <div className="space-y-2">
            {categoryBreakdown.map(({ category, amount, percentage }) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground truncate">{category}</span>
                  <span className="text-foreground font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          Histórico de Investimentos
        </h3>
        <div className="divide-y divide-border">
          {investmentTransactions.slice(0, 20).map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(t.date), "dd MMM yyyy", { locale: ptBR })} • {t.category}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
        {investmentTransactions.length > 20 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Exibindo os 20 mais recentes de {investmentTransactions.length} aportes
          </p>
        )}
      </div>
    </div>
  );
};

export default InvestmentsOverview;
