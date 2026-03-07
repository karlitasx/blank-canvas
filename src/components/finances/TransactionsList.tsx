import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Gamepad2,
  Heart,
  GraduationCap,
  Briefcase,
  Trash2,
} from "lucide-react";

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: Date;
}

interface TransactionsListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  categoryFilter: string | null;
}

const categoryIcons: Record<string, { icon: React.ElementType; color: string }> = {
  Alimentação: { icon: Utensils, color: "#f97316" },
  Transporte: { icon: Car, color: "#3b82f6" },
  Moradia: { icon: Home, color: "#8b5cf6" },
  Lazer: { icon: Gamepad2, color: "#ec4899" },
  Saúde: { icon: Heart, color: "#ef4444" },
  Educação: { icon: GraduationCap, color: "#14b8a6" },
  Compras: { icon: ShoppingBag, color: "#f59e0b" },
  Salário: { icon: Briefcase, color: "#22c55e" },
};

const TransactionsList = ({
  transactions,
  onDelete,
  categoryFilter,
}: TransactionsListProps) => {
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const filteredTransactions = categoryFilter
    ? transactions.filter((t) => t.category === categoryFilter)
    : transactions;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleTouchStart = (id: string) => {
    setSwipedId(id);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setSwipedId(null), 3000);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3>
        <span className="text-sm text-muted-foreground">
          {filteredTransactions.length} transações
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma transação encontrada
          </p>
        ) : (
          filteredTransactions.map((transaction) => {
            const categoryInfo = categoryIcons[transaction.category] || {
              icon: ShoppingBag,
              color: "#6b7280",
            };
            const Icon = categoryInfo.icon;
            const isSwiped = swipedId === transaction.id;

            return (
              <div
                key={transaction.id}
                className="relative overflow-hidden rounded-xl"
                onTouchStart={() => handleTouchStart(transaction.id)}
                onTouchEnd={handleTouchEnd}
              >
                {/* Delete button (mobile swipe) */}
                <div
                  className={`absolute right-0 top-0 bottom-0 flex items-center justify-center bg-destructive px-4 transition-all ${
                    isSwiped ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-2 text-destructive-foreground"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div
                  className={`flex items-center gap-4 p-4 bg-muted/50 rounded-xl transition-all hover:bg-muted ${
                    isSwiped ? "-translate-x-16" : ""
                  }`}
                >
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${categoryInfo.color}20` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: categoryInfo.color }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} •{" "}
                      {format(transaction.date, "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>

                    {/* Desktop delete button */}
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="hidden md:block p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
