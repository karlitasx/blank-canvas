import { Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessExpense } from "@/hooks/useBusinessFinance";
import { EmptyState } from "@/components/ui/empty-state";

interface Props {
  expenses: BusinessExpense[];
  onDelete: (id: string) => Promise<void>;
  formatCurrency: (v: number) => string;
}

const categoryLabels: Record<string, string> = {
  material: "Material",
  marketing: "Marketing",
  ferramentas: "Ferramentas",
  impostos: "Impostos",
  aluguel: "Aluguel",
  funcionarios: "Funcionários",
  transporte: "Transporte",
  outros: "Outros",
};

const categoryColors: Record<string, string> = {
  material: "bg-orange-500/15 text-orange-600",
  marketing: "bg-pink-500/15 text-pink-600",
  ferramentas: "bg-blue-500/15 text-blue-600",
  impostos: "bg-red-500/15 text-red-600",
  aluguel: "bg-purple-500/15 text-purple-600",
  funcionarios: "bg-indigo-500/15 text-indigo-600",
  transporte: "bg-cyan-500/15 text-cyan-600",
  outros: "bg-muted text-muted-foreground",
};

const ExpensesList = ({ expenses, onDelete, formatCurrency }: Props) => {
  if (expenses.length === 0) {
    return <EmptyState icon={Receipt} title="Nenhuma despesa registrada" description="Registre sua primeira despesa empresarial." />;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-foreground">Despesas recentes</h3>
      {expenses.map(expense => (
        <div key={expense.id} className="glass-card p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{formatCurrency(Number(expense.amount))}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[expense.category] || categoryColors.outros}`}>
                {categoryLabels[expense.category] || expense.category}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(expense.expense_date + "T12:00:00").toLocaleDateString("pt-BR")}
            </span>
            {expense.description && <p className="text-xs text-muted-foreground mt-1">{expense.description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} className="text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ExpensesList;
