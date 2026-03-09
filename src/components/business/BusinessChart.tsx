import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BusinessSale } from "@/hooks/useBusinessFinance";

interface Props {
  sales: BusinessSale[];
}

const BusinessChart = ({ sales }: Props) => {
  const data = useMemo(() => {
    const monthMap = new Map<string, number>();
    const now = new Date();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, 0);
    }

    sales.forEach(s => {
      const key = s.sale_date.substring(0, 7);
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + Number(s.amount));
      }
    });

    return Array.from(monthMap.entries()).map(([month, total]) => {
      const [y, m] = month.split("-");
      const d = new Date(Number(y), Number(m) - 1);
      return {
        month: d.toLocaleDateString("pt-BR", { month: "short" }),
        total,
      };
    });
  }, [sales]);

  return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-foreground mb-4">📈 Faturamento Mensal</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Faturamento"]}
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BusinessChart;
