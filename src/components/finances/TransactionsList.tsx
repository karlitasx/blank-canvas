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
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  TrendingUp,
  Building2,
  Users,
  Receipt,
  Megaphone,
  Package,
  FileText,
  MoreHorizontal,
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
  Investimento: { icon: TrendingUp, color: "#6366f1" },
  "Investimento / Objetivo": { icon: TrendingUp, color: "#10b981" },
  Presente: { icon: Gift, color: "#a855f7" },
  Outros: { icon: MoreHorizontal, color: "#6b7280" },
  // Business categories
  "Receita de Vendas": { icon: Briefcase, color: "#22c55e" },
  "Serviços Prestados": { icon: FileText, color: "#3b82f6" },
  Fornecedores: { icon: Package, color: "#f97316" },
  "Folha de Pagamento": { icon: Users, color: "#8b5cf6" },
  Impostos: { icon: Receipt, color: "#ef4444" },
  "Aluguel Comercial": { icon: Building2, color: "#6366f1" },
  Marketing: { icon: Megaphone, color: "#ec4899" },
  "Materiais/Estoque": { icon: Package, color: "#f59e0b" },
  "Nota Fiscal": { icon: FileText, color: "#14b8a6" },
  "Despesas Gerais": { icon: MoreHorizontal, color: "#6b7280" },
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
    <div className="glass-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {filteredTransactions.length}
        </span>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
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
            const isIncome = transaction.type === "income";
            const DirectionIcon = isIncome ? ArrowUpRight : ArrowDownLeft;

            return (
              <div
                key={transaction.id}
                className="relative overflow-hidden rounded-xl group"
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
                  className={`flex items-center gap-3 p-3.5 bg-muted/40 rounded-xl transition-all hover:bg-muted/70 ${
                    isSwiped ? "-translate-x-16" : ""
                  }`}
                >
                  {/* Direction + Category Icon */}
                  <div className="relative">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{ backgroundColor: `${categoryInfo.color}15` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: categoryInfo.color }}
                      />
                    </div>
                    {/* Small direction indicator */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                        isIncome ? "bg-emerald-500/20" : "bg-red-500/20"
                      }`}
                    >
                      <DirectionIcon
                        className={`w-3 h-3 ${isIncome ? "text-emerald-500" : "text-red-500"}`}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category} · {format(transaction.date, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-semibold text-sm ${
                        isIncome ? "text-emerald-500" : "text-destructive"
                      }`}
                    >
                      {isIncome ? "+ " : "- "}
                      {formatCurrency(transaction.amount)}
                    </span>

                    {/* Desktop delete button */}
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="hidden md:flex p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
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
