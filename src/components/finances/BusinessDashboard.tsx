import { TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useBusinessSales } from "@/hooks/useBusinessSales";
import { useBusinessExpenses } from "@/hooks/useBusinessExpenses";
import type { BusinessType } from "@/hooks/useBusinessSettings";

interface BusinessDashboardProps {
  businessType: BusinessType;
}

const MEI_ANNUAL_LIMIT = 81000;

const SIMPLES_RATES: Record<string, number> = {
  "1": 0.06, "2": 0.112, "3": 0.135, "4": 0.16, "5": 0.21, "6": 0.335,
};

const BusinessDashboard = ({ businessType }: BusinessDashboardProps) => {
  const { monthlyTotal: revenue, yearlyTotal, monthlyData } = useBusinessSales();
  const { monthlyTotal: expenses } = useBusinessExpenses();

  const profit = revenue - expenses;
  const estimatedTax = businessType === "mei" ? 71.6 : businessType === "simples" ? revenue * 0.06 : revenue * 0.15;

  const cards = [
    { label: "Faturamento", value: revenue, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Despesas", value: expenses, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Lucro Estimado", value: profit, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Impostos Previstos", value: estimatedTax, icon: Receipt, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-lg font-bold text-foreground">
                R$ {card.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          );
        })}
      </div>

      {businessType === "mei" && (
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Limite Anual MEI</p>
            <p className="text-xs text-muted-foreground">
              R$ {yearlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {MEI_ANNUAL_LIMIT.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${yearlyTotal / MEI_ANNUAL_LIMIT > 0.8 ? "bg-red-500" : yearlyTotal / MEI_ANNUAL_LIMIT > 0.6 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min((yearlyTotal / MEI_ANNUAL_LIMIT) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {((yearlyTotal / MEI_ANNUAL_LIMIT) * 100).toFixed(1)}% utilizado
          </p>
          {yearlyTotal / MEI_ANNUAL_LIMIT > 0.8 && (
            <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-xs text-red-400 font-medium">⚠️ Atenção: Você está próximo do limite anual de faturamento do MEI!</p>
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-4 rounded-xl">
        <p className="text-sm font-semibold text-foreground mb-4">Faturamento Mensal ({new Date().getFullYear()})</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Faturamento"]}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
