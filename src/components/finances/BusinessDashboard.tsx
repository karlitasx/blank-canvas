import { TrendingUp, TrendingDown, DollarSign, Receipt, Briefcase, AlertTriangle, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useBusinessSales } from "@/hooks/useBusinessSales";
import { useBusinessExpenses } from "@/hooks/useBusinessExpenses";
import type { BusinessType } from "@/hooks/useBusinessSettings";

interface BusinessDashboardProps {
  businessType: BusinessType;
}

// Valores atualizados para 2026
const MEI_ANNUAL_LIMIT = 81000; // Limite MEI 2026
const DAS_MEI_2026 = 75.90; // DAS MEI atualizado para 2026 (salário mínimo R$ 1.518)
const INSS_AUTONOMO_RATE = 0.20; // 20% sobre rendimentos para autônomo
const ISS_AUTONOMO_RATE = 0.05; // 5% ISS (varia por município)

// Faixas Simples Nacional 2026 (Anexo III - Serviços)
const getSimplesTaxRate = (rbt12: number): number => {
  if (rbt12 <= 180000) return 0.06;
  if (rbt12 <= 360000) return 0.112 - (9360 / rbt12);
  if (rbt12 <= 720000) return 0.135 - (17640 / rbt12);
  if (rbt12 <= 1800000) return 0.16 - (35640 / rbt12);
  if (rbt12 <= 3600000) return 0.21 - (125640 / rbt12);
  return 0.33 - (648000 / rbt12);
};

const BusinessDashboard = ({ businessType }: BusinessDashboardProps) => {
  const { monthlyTotal: revenue, yearlyTotal, monthlyData } = useBusinessSales();
  const { monthlyTotal: expenses } = useBusinessExpenses();

  const profit = revenue - expenses;
  
  // Cálculo de imposto baseado no tipo de empresa (valores 2026)
  const calculateTax = () => {
    if (businessType === "mei") {
      return DAS_MEI_2026;
    }
    if (businessType === "simples") {
      const rbt12 = yearlyTotal > 0 ? yearlyTotal : revenue * 12;
      const rate = getSimplesTaxRate(rbt12);
      return revenue * Math.max(rate, 0);
    }
    // Autônomo: INSS + ISS estimado
    const inss = Math.min(revenue * INSS_AUTONOMO_RATE, 1518 * 0.20); // Teto INSS
    const iss = revenue * ISS_AUTONOMO_RATE;
    return inss + iss;
  };

  const estimatedTax = calculateTax();

  const getBusinessTypeLabel = () => {
    switch (businessType) {
      case "mei": return "MEI";
      case "simples": return "Simples Nacional";
      case "autonomo": return "Autônomo";
      default: return "Empresa";
    }
  };

  const cards = [
    { label: "Faturamento", value: revenue, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Despesas", value: expenses, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Lucro Estimado", value: profit, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Impostos Previstos", value: estimatedTax, icon: Receipt, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Badge do tipo de empresa */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
        <Briefcase className="w-4 h-4 text-primary" />
        <span className="text-sm text-muted-foreground">Regime:</span>
        <span className="text-sm font-semibold text-foreground">{getBusinessTypeLabel()}</span>
        <span className="text-xs text-muted-foreground ml-auto">Valores 2026</span>
      </div>

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

      {/* Seção específica MEI */}
      {businessType === "mei" && (
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Limite Anual MEI 2026</p>
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

      {/* Seção específica Simples Nacional */}
      {businessType === "simples" && (
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-semibold text-foreground">Simples Nacional 2026</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">RBT12 Estimado</p>
              <p className="text-base font-bold text-foreground">
                R$ {(yearlyTotal > 0 ? yearlyTotal : revenue * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alíquota Efetiva</p>
              <p className="text-base font-bold text-primary">
                {(getSimplesTaxRate(yearlyTotal > 0 ? yearlyTotal : revenue * 12) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seção específica Autônomo */}
      {businessType === "autonomo" && (
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Impostos Autônomo 2026</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">INSS (20%)</p>
              <p className="text-base font-bold text-foreground">
                R$ {Math.min(revenue * INSS_AUTONOMO_RATE, 1518 * 0.20).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ISS (~5%)</p>
              <p className="text-base font-bold text-foreground">
                R$ {(revenue * ISS_AUTONOMO_RATE).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-muted-foreground">💡 Dica: Considere se formalizar como MEI se seu faturamento for até R$ 81.000/ano para pagar menos impostos.</p>
          </div>
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
