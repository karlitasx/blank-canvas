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
      iconColor: "text-green-500",
      iconBg: "bg-green-500/10",
      valueColor: "text-green-500",
    },
    {
      label: "Despesas",
      sublabel: "Total de saídas",
      value: expenses,
      icon: TrendingDown,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      valueColor: "text-red-500",
    },
    {
      label: "Investimentos",
      sublabel: "Total investido",
      value: investments,
      icon: BarChart3,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
      valueColor: "text-violet-500",
    },
    {
      label: "Saldo Atual",
      sublabel: "Resultado positivo",
      value: balance,
      icon: Wallet,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      valueColor: balance >= 0 ? "text-primary" : "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="glass-card p-4 md:p-5 rounded-2xl flex flex-col gap-3 hover:shadow-md transition-shadow"
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
