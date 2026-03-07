import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";

interface SummaryCardsProps {
  balance: number;
  income: number;
  expenses: number;
  investments?: number;
}

const SummaryCards = ({ balance, income, expenses, investments = 0 }: SummaryCardsProps) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const cards = [
    {
      label: "Receitas",
      sublabel: "Total de entradas",
      value: income,
      icon: TrendingUp,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      valueColor: "text-success",
    },
    {
      label: "Despesas",
      sublabel: "Total de saídas",
      value: expenses,
      icon: TrendingDown,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      valueColor: "text-destructive",
    },
    {
      label: "Investimentos",
      sublabel: "Total investido",
      value: investments,
      icon: BarChart3,
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
      valueColor: "text-secondary",
    },
    {
      label: "Saldo Atual",
      sublabel: "Resultado positivo",
      value: balance,
      icon: Wallet,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      valueColor: balance >= 0 ? "text-primary" : "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="glass-card p-4 md:p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-xl md:text-2xl font-bold ${card.valueColor}`}>
              {formatCurrency(card.value)}
            </p>
            <p className="text-xs text-muted-foreground">{card.sublabel}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
