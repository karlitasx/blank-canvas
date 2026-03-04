import {
  Briefcase, Car, Coffee, CreditCard, DollarSign, Gift, GraduationCap,
  Heart, Home, Landmark, LineChart, Package, Percent, PiggyBank,
  Receipt, Shirt, ShoppingBag, ShoppingCart, Smartphone, Stethoscope,
  TrendingUp, Utensils, Wifi, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

export interface FinanceCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const personalIncomeCategories: FinanceCategory[] = [
  { id: "salary", name: "Salário", icon: DollarSign, color: "#22c55e" },
  { id: "freelance", name: "Freelance", icon: Briefcase, color: "#3b82f6" },
  { id: "investments_income", name: "Rendimentos", icon: TrendingUp, color: "#8b5cf6" },
  { id: "gifts", name: "Presentes", icon: Gift, color: "#ec4899" },
  { id: "other_income", name: "Outros", icon: Receipt, color: "#6b7280" },
];

export const personalExpenseCategories: FinanceCategory[] = [
  { id: "food", name: "Alimentação", icon: Utensils, color: "#f97316" },
  { id: "transport", name: "Transporte", icon: Car, color: "#3b82f6" },
  { id: "housing", name: "Moradia", icon: Home, color: "#8b5cf6" },
  { id: "health", name: "Saúde", icon: Stethoscope, color: "#ef4444" },
  { id: "education", name: "Educação", icon: GraduationCap, color: "#06b6d4" },
  { id: "shopping", name: "Compras", icon: ShoppingBag, color: "#ec4899" },
  { id: "entertainment", name: "Lazer", icon: Coffee, color: "#f59e0b" },
  { id: "clothing", name: "Vestuário", icon: Shirt, color: "#a855f7" },
  { id: "bills", name: "Contas", icon: Zap, color: "#eab308" },
  { id: "internet", name: "Internet/Tel", icon: Wifi, color: "#14b8a6" },
  { id: "subscriptions", name: "Assinaturas", icon: CreditCard, color: "#6366f1" },
  { id: "maintenance", name: "Manutenção", icon: Wrench, color: "#78716c" },
  { id: "other_expense", name: "Outros", icon: Receipt, color: "#6b7280" },
];

export const investmentCategories: FinanceCategory[] = [
  { id: "stocks", name: "Ações", icon: LineChart, color: "#22c55e" },
  { id: "fixed_income", name: "Renda Fixa", icon: Landmark, color: "#3b82f6" },
  { id: "crypto", name: "Criptomoedas", icon: Smartphone, color: "#f59e0b" },
  { id: "real_estate", name: "Imóveis", icon: Home, color: "#8b5cf6" },
  { id: "savings", name: "Poupança", icon: PiggyBank, color: "#06b6d4" },
  { id: "funds", name: "Fundos", icon: Percent, color: "#ec4899" },
  { id: "other_investment", name: "Outros", icon: Package, color: "#6b7280" },
];

export const businessCategories: FinanceCategory[] = [
  { id: "revenue", name: "Receita", icon: DollarSign, color: "#22c55e" },
  { id: "supplies", name: "Insumos", icon: Package, color: "#f97316" },
  { id: "payroll", name: "Folha de Pagamento", icon: Briefcase, color: "#3b82f6" },
  { id: "taxes", name: "Impostos", icon: Receipt, color: "#ef4444" },
  { id: "marketing", name: "Marketing", icon: TrendingUp, color: "#8b5cf6" },
  { id: "rent", name: "Aluguel", icon: Home, color: "#06b6d4" },
  { id: "utilities", name: "Utilidades", icon: Zap, color: "#eab308" },
  { id: "equipment", name: "Equipamentos", icon: Wrench, color: "#78716c" },
  { id: "services", name: "Serviços", icon: ShoppingCart, color: "#14b8a6" },
  { id: "other_business", name: "Outros", icon: Receipt, color: "#6b7280" },
];
