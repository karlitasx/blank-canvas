import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Lightbulb, X, Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  name: string;
  percent: number;
  color: string;
  description: string;
}

interface BudgetMethod {
  emoji: string;
  title: string;
  description: string;
  categories: Category[];
}

const methods: BudgetMethod[] = [
  {
    emoji: "⚖️",
    title: "Método 50/30/20",
    description:
      "O método mais popular e equilibrado para organizar seu orçamento. Simples de aplicar e recomendado para iniciantes.",
    categories: [
      {
        name: "Necessidades",
        percent: 50,
        color: "#ef4444",
        description: "Moradia, alimentação, transporte, saúde e contas essenciais",
      },
      {
        name: "Desejos",
        percent: 30,
        color: "#f97316",
        description: "Lazer, restaurantes, streaming, compras não essenciais",
      },
      {
        name: "Investimentos",
        percent: 20,
        color: "#22c55e",
        description: "Poupança, reserva de emergência, ações, renda fixa",
      },
    ],
  },
  {
    emoji: "🌿",
    title: "Método 70/20/10",
    description:
      "Ideal para quem tem despesas maiores e quer começar a investir aos poucos. Mais flexível no dia a dia.",
    categories: [
      {
        name: "Gastos Gerais",
        percent: 70,
        color: "#ef4444",
        description: "Todas as despesas do dia a dia, incluindo moradia e lazer",
      },
      {
        name: "Investimentos",
        percent: 20,
        color: "#22c55e",
        description: "Reserva de emergência, investimentos e objetivos financeiros",
      },
      {
        name: "Doações / Dízimo",
        percent: 10,
        color: "#3b82f6",
        description: "Contribuições sociais, religiosas ou filantrópicas",
      },
    ],
  },
  {
    emoji: "📊",
    title: "Método 60/20/20",
    description:
      "Boa opção para quem precisa de mais folga nas despesas fixas mas quer manter disciplina nos investimentos.",
    categories: [
      {
        name: "Despesas Fixas",
        percent: 60,
        color: "#ef4444",
        description: "Aluguel, contas, alimentação, transporte e seguros",
      },
      {
        name: "Objetivos",
        percent: 20,
        color: "#3b82f6",
        description: "Metas de curto e médio prazo, viagens, compras planejadas",
      },
      {
        name: "Investimentos",
        percent: 20,
        color: "#22c55e",
        description: "Poupança de longo prazo, aposentadoria, renda passiva",
      },
    ],
  },
  {
    emoji: "🏺",
    title: "Método dos Potes",
    description:
      "Popularizado por T. Harv Eker, divide a renda em 6 'potes'. É ideal para quem quer um controle mais detalhado e visual do dinheiro.",
    categories: [
      {
        name: "Necessidades",
        percent: 55,
        color: "#ef4444",
        description: "Moradia, alimentação, contas básicas e transporte",
      },
      {
        name: "Educação",
        percent: 10,
        color: "#3b82f6",
        description: "Cursos, livros, treinamentos e desenvolvimento pessoal",
      },
      {
        name: "Diversão",
        percent: 10,
        color: "#f97316",
        description: "Lazer, restaurantes, hobbies e entretenimento",
      },
      {
        name: "Poupança LP",
        percent: 10,
        color: "#22c55e",
        description: "Poupança de longo prazo, aposentadoria e liberdade financeira",
      },
      {
        name: "Doações",
        percent: 10,
        color: "#ec4899",
        description: "Contribuições para causas sociais, presentes e caridade",
      },
      {
        name: "Livre",
        percent: 5,
        color: "#8b5cf6",
        description: "Gastos sem culpa, pequenos luxos e recompensas pessoais",
      },
    ],
  },
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MethodCard = ({ method }: { method: BudgetMethod }) => {
  const [showSimulator, setShowSimulator] = useState(false);
  const [income, setIncome] = useState("");

  const incomeValue = parseFloat(income) || 0;

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (parseInt(value || "0") / 100).toFixed(2);
    setIncome(value);
  };

  const formatDisplay = (value: string) => {
    if (!value) return "";
    return parseFloat(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const chartData = method.categories.map((c) => ({
    name: c.name,
    value: c.percent,
  }));

  return (
    <>
      <div className="glass-card rounded-2xl p-6 space-y-5">
        {/* Header */}
        <div>
          <h4 className="text-lg font-bold flex items-center gap-2">
            <span className="text-2xl">{method.emoji}</span>
            {method.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
        </div>

        {/* Donut Chart */}
        <div className="flex justify-center">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                stroke="none"
              >
                {method.categories.map((cat, idx) => (
                  <Cell key={idx} fill={cat.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories legend with descriptions */}
        <div className="space-y-2">
          {method.categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-sm font-bold text-muted-foreground">{cat.percent}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Simulate button */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowSimulator(true)}
        >
          <Calculator className="w-4 h-4" />
          Simular com minha renda
        </Button>
      </div>

      {/* Simulator Modal */}
      <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{method.emoji}</span>
              {method.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Explanation */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {method.description} Informe sua renda mensal abaixo para ver a divisão ideal do seu dinheiro.
              </p>
            </div>

            {/* Income input */}
            <div className="space-y-2">
              <Label className="font-semibold">Sua Renda Mensal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  R$
                </span>
                <Input
                  type="text"
                  value={formatDisplay(income)}
                  onChange={handleCurrencyInput}
                  className="h-12 text-base pl-10"
                  placeholder="0,00"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            {incomeValue > 0 && (
              <div className="space-y-1 rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-center text-muted-foreground mb-3">
                  Divisão sugerida da sua renda:
                </p>
                {method.categories.map((cat) => {
                  const amount = (incomeValue * cat.percent) / 100;
                  return (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">({cat.percent}%)</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: cat.color }}>
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const BudgetMethods = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Métodos de Divisão do Orçamento</h3>
          <p className="text-sm text-muted-foreground">
            Aprenda diferentes formas de organizar sua renda
          </p>
        </div>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <MethodCard key={method.title} method={method} />
        ))}
      </div>
    </div>
  );
};

export default BudgetMethods;
