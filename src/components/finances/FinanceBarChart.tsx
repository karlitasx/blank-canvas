import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const monthlyData = [
  { name: "Ago", receitas: 7200, despesas: 4100 },
  { name: "Set", receitas: 8100, despesas: 4500 },
  { name: "Out", receitas: 7800, despesas: 5200 },
  { name: "Nov", receitas: 8500, despesas: 4800 },
  { name: "Dez", receitas: 9200, despesas: 5100 },
  { name: "Jan", receitas: 8500, despesas: 4200 },
];

const yearlyData = [
  { name: "2020", receitas: 72000, despesas: 48000 },
  { name: "2021", receitas: 85000, despesas: 52000 },
  { name: "2022", receitas: 92000, despesas: 58000 },
  { name: "2023", receitas: 98000, despesas: 62000 },
  { name: "2024", receitas: 105000, despesas: 65000 },
  { name: "2025", receitas: 50000, despesas: 25000 },
];

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "hsl(142, 76%, 45%)",
  },
  despesas: {
    label: "Despesas",
    color: "hsl(0, 84%, 60%)",
  },
};

const FinanceBarChart = () => {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  const data = viewMode === "monthly" ? monthlyData : yearlyData;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Receitas vs Despesas</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-glass hover:bg-white/10"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setViewMode("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "yearly"
                ? "bg-primary text-primary-foreground"
                : "bg-glass hover:bg-white/10"
            }`}
          >
            Anual
          </button>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
              tickFormatter={(value) =>
                viewMode === "monthly"
                  ? `${(value / 1000).toFixed(0)}k`
                  : `${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Legend />
            <Bar
              dataKey="receitas"
              fill="hsl(142, 76%, 45%)"
              radius={[4, 4, 0, 0]}
              name="Receitas"
            />
            <Bar
              dataKey="despesas"
              fill="hsl(0, 84%, 60%)"
              radius={[4, 4, 0, 0]}
              name="Despesas"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default FinanceBarChart;
