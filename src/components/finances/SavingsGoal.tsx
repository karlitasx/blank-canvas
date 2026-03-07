import { Target, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SavingsGoalProps {
  goal: number;
  current: number;
  monthlyExpenses: number;
  budgetLimit: number;
}

const SavingsGoal = ({ goal, current, monthlyExpenses, budgetLimit }: SavingsGoalProps) => {
  const progress = Math.min((current / goal) * 100, 100);
  const isOverBudget = monthlyExpenses > budgetLimit;
  const overBudgetPercent = ((monthlyExpenses - budgetLimit) / budgetLimit) * 100;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-4">
      {/* Savings Goal */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg logo-gradient">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Meta de Economia</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>

          <div className="relative">
            <Progress value={progress} className="h-3" />
            <div
              className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Economizado</p>
              <p className="font-semibold text-green-500">{formatCurrency(current)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Meta</p>
              <p className="font-semibold">{formatCurrency(goal)}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Faltam {formatCurrency(goal - current)} para atingir sua meta
          </p>
        </div>
      </div>

      {/* Budget Alert */}
      {isOverBudget && (
        <div className="glass-card p-4 border border-red-400/50 bg-red-500/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-red-400">Alerta de Gastos</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Você ultrapassou seu limite mensal em{" "}
                <span className="text-red-400 font-medium">
                  {formatCurrency(monthlyExpenses - budgetLimit)}
                </span>{" "}
                ({overBudgetPercent.toFixed(1)}% acima do orçamento)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoal;
