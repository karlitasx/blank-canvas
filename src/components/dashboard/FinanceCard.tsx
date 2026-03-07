import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";

const FinanceCard = () => {
  const { t, formatCurrency } = usePreferences();
  const balance = 12450.0;
  const income = 8500.0;
  const expenses = 4200.0;
  const savingsPercent = Math.round(((income - expenses) / income) * 100);

  const chartData = [40, 55, 45, 65, 50, 70, 60];

  return (
    <div className="glass-card p-6 animate-slide-up animation-delay-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg logo-gradient">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-lg">{t('dashboard.finances')}</h3>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          +{savingsPercent}% {t('finance.savings')}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">{t('finance.balance')}</p>
        <p className="text-3xl font-bold">
          {formatCurrency(balance)}
        </p>
      </div>

      <div className="h-16 flex items-end gap-1 mb-6">
        {chartData.map((value, index) => (
          <div
            key={index}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-accent opacity-60 hover:opacity-100 transition-opacity"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-glass">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground">{t('finance.income')}</span>
          </div>
          <p className="font-semibold text-green-400">
            +{formatCurrency(income)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-glass">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-muted-foreground">{t('finance.expense')}</span>
          </div>
          <p className="font-semibold text-red-400">
            -{formatCurrency(expenses)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;
