import {
  ShoppingBag, Utensils, Car, Home, Gamepad2, Heart, GraduationCap,
  Briefcase, Banknote, Gift, Building2, Truck, Users, FileText,
  Receipt, Landmark, Package, Wrench, Megaphone, LucideIcon,
  TrendingUp, Bitcoin, PiggyBank, Shield, BarChart3, Coins, Building, CircleDollarSign,
} from "lucide-react";

export interface FinanceCategory {
  name: string;
  icon: LucideIcon;
  color: string;
}

export const personalIncomeCategories: FinanceCategory[] = [
  { name: "Salário", icon: Briefcase, color: "#22c55e" },
  { name: "Presente", icon: Gift, color: "#a855f7" },
  { name: "Freelance", icon: Banknote, color: "#14b8a6" },
];

export const personalExpenseCategories: FinanceCategory[] = [
  { name: "Alimentação", icon: Utensils, color: "#f97316" },
  { name: "Transporte", icon: Car, color: "#3b82f6" },
  { name: "Moradia", icon: Home, color: "#8b5cf6" },
  { name: "Lazer", icon: Gamepad2, color: "#ec4899" },
  { name: "Saúde", icon: Heart, color: "#ef4444" },
  { name: "Educação", icon: GraduationCap, color: "#14b8a6" },
  { name: "Compras", icon: ShoppingBag, color: "#f59e0b" },
];

export const investmentCategories: FinanceCategory[] = [
  { name: "LCI/LCA", icon: Landmark, color: "#3b82f6" },
  { name: "Tesouro Direto", icon: Shield, color: "#22c55e" },
  { name: "Fundos de Investimento", icon: BarChart3, color: "#8b5cf6" },
  { name: "Ações", icon: TrendingUp, color: "#ef4444" },
  { name: "FIIs (Fundos Imobiliários)", icon: Building, color: "#f97316" },
  { name: "Criptomoedas", icon: Bitcoin, color: "#f59e0b" },
  { name: "Previdência Privada", icon: PiggyBank, color: "#6366f1" },
  { name: "Poupança", icon: Coins, color: "#14b8a6" },
  { name: "Outro", icon: CircleDollarSign, color: "#6b7280" },
];

// Legacy combined lists for backward compat
export const personalCategories: FinanceCategory[] = [
  ...personalExpenseCategories,
  ...personalIncomeCategories,
  { name: "Investimento", icon: Banknote, color: "#6366f1" },
];

export const businessCategories: FinanceCategory[] = [
  { name: "Receita de Vendas", icon: Banknote, color: "#22c55e" },
  { name: "Serviços Prestados", icon: Wrench, color: "#3b82f6" },
  { name: "Fornecedores", icon: Truck, color: "#f97316" },
  { name: "Folha de Pagamento", icon: Users, color: "#8b5cf6" },
  { name: "Impostos", icon: Landmark, color: "#ef4444" },
  { name: "Aluguel Comercial", icon: Building2, color: "#6366f1" },
  { name: "Marketing", icon: Megaphone, color: "#ec4899" },
  { name: "Materiais/Estoque", icon: Package, color: "#f59e0b" },
  { name: "Nota Fiscal", icon: Receipt, color: "#14b8a6" },
  { name: "Despesas Gerais", icon: FileText, color: "#6b7280" },
];

export const categoryColors: Record<string, string> = {
  // Personal
  "Alimentação": "#f97316",
  "Transporte": "#3b82f6",
  "Moradia": "#8b5cf6",
  "Lazer": "#ec4899",
  "Saúde": "#ef4444",
  "Educação": "#14b8a6",
  "Compras": "#f59e0b",
  "Salário": "#22c55e",
  "Freelance": "#14b8a6",
  "Investimento": "#6366f1",
  "Investimento / Objetivo": "#10b981",
  "Presente": "#a855f7",
  // Investment
  "LCI/LCA": "#3b82f6",
  "Tesouro Direto": "#22c55e",
  "Fundos de Investimento": "#8b5cf6",
  "Ações": "#ef4444",
  "FIIs (Fundos Imobiliários)": "#f97316",
  "Criptomoedas": "#f59e0b",
  "Previdência Privada": "#6366f1",
  "Poupança": "#14b8a6",
  "Outro": "#6b7280",
  // Business
  "Receita de Vendas": "#22c55e",
  "Serviços Prestados": "#3b82f6",
  "Fornecedores": "#f97316",
  "Folha de Pagamento": "#8b5cf6",
  "Impostos": "#ef4444",
  "Aluguel Comercial": "#6366f1",
  "Marketing": "#ec4899",
  "Materiais/Estoque": "#f59e0b",
  "Nota Fiscal": "#14b8a6",
  "Despesas Gerais": "#6b7280",
};
