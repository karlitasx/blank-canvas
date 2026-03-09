import { useState } from "react";
import { Plus, DollarSign, Wallet, ArrowLeft, Building2, User, LayoutGrid, BarChart3, FileText, Target, CreditCard, FolderKanban, TrendingDown, Sparkles, Shield, X, Filter } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SummaryCards from "@/components/finances/SummaryCards";
import FinanceBarChart from "@/components/finances/FinanceBarChart";
import CategoryDonut from "@/components/finances/CategoryDonut";
import TransactionsList from "@/components/finances/TransactionsList";
import AddTransactionModal from "@/components/finances/AddTransactionModal";
import FinanceFilters from "@/components/finances/FinanceFilters";
import SavingsGoal from "@/components/finances/SavingsGoal";
import MetasKanban from "@/components/finances/MetasKanban";
import OrganizationTab from "@/components/finances/OrganizationTab";
import EmergencyFundCalculator from "@/components/finances/EmergencyFundCalculator";
import BudgetMethods from "@/components/finances/BudgetMethods";
import FinanceTypeSelector, { type FinanceType } from "@/components/finances/FinanceTypeSelector";
import VeveAssistant from "@/components/finances/VeveAssistant";
import ExpenseOverview from "@/components/finances/ExpenseOverview";
import LgpdNotice from "@/components/finances/LgpdNotice";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSupabaseFinances } from "@/hooks/useSupabaseFinances";

const Finances = () => {
  const [financeType, setFinanceType] = useState<FinanceType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [activeTab, setActiveTab] = useState("summary");
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);
  const [veveOpen, setVeveOpen] = useState(false);

  const { transactions, isLoaded, stats, addTransaction, deleteTransaction, filterTransactions, getCategoryData } =
    useSupabaseFinances(financeType || undefined);

  const categoryData = getCategoryData();

  const handleAddTransaction = async (transaction: {
    description: string;
    category: string;
    amount: number;
    type: "income" | "expense";
    date: Date;
    recurring: boolean;
    finance_type?: "personal" | "business";
    cnpj?: string;
    invoice_number?: string;
    cost_center?: string;
  }) => {
    await addTransaction({
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      finance_type: transaction.finance_type,
      cnpj: transaction.cnpj,
      invoice_number: transaction.invoice_number,
      cost_center: transaction.cost_center,
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleClearFilters = () => {
    setSelectedPeriod("month");
    setSelectedType("all");
    setSelectedCategory(null);
  };

  // Show type selector if not chosen
  if (!financeType) {
    return (
      <DashboardLayout activeNav="/finance">
        <FinanceTypeSelector onSelect={setFinanceType} />
      </DashboardLayout>
    );
  }

  const filteredTransactions = filterTransactions(selectedType);
  const isBusiness = financeType === "business";
  const typeLabel = isBusiness ? "Empresariais" : "Pessoais";
  const TypeIcon = isBusiness ? Building2 : User;

  if (!isLoaded) {
    return (
      <DashboardLayout activeNav="/finance">
        <div className="space-y-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNav="/finance">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFinanceType(null)}
          className="shrink-0 -ml-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Finanças {typeLabel}</h1>
          <p className="text-muted-foreground text-sm">
            {isBusiness ? "Controle do seu negócio" : "Controle total da sua vida financeira"}
          </p>
        </div>
      </div>

      {/* Summary Card with gradient + month nav */}
      <SummaryCards balance={stats.balance} income={stats.income} expenses={stats.expenses} />

      {/* Main Tabs: Resumo | Transações | IA */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="w-full grid grid-cols-3 bg-muted/50 rounded-xl p-1 h-auto">
          <TabsTrigger
            value="summary"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg py-2.5 text-sm font-medium"
          >
            Resumo
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg py-2.5 text-sm font-medium"
          >
            Transações
          </TabsTrigger>
          <TabsTrigger
            value="ia"
            className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg py-2.5 text-sm font-medium"
          >
            IA
          </TabsTrigger>
        </TabsList>

        {/* Resumo */}
        <TabsContent value="summary" className="space-y-6 animate-fade-in mt-5">
          {/* Centered Add Transaction */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="btn-gradient gap-2 px-8 py-5 text-sm font-semibold rounded-xl shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              Adicionar transação
            </Button>
            <div className="flex items-center gap-3">
              <LgpdNotice />
            </div>
          </div>

          {/* Security Banner */}
          {showSecurityBanner && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex gap-3 items-start">
              <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  <strong>Seus dados estão seguros.</strong>{" "}
                  <span className="text-muted-foreground">
                    Não compartilhamos suas informações financeiras com terceiros.
                  </span>
                </p>
              </div>
              <button onClick={() => setShowSecurityBanner(false)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Nenhuma transação ainda"
              description={
                isBusiness
                  ? "Registre a primeira transação empresarial."
                  : "Registre sua primeira receita ou despesa."
              }
              action={{
                label: "Adicionar Transação",
                onClick: () => setIsModalOpen(true),
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <FinanceBarChart />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CategoryDonut
                      data={categoryData}
                      selectedCategory={selectedCategory}
                      onCategoryClick={setSelectedCategory}
                    />
                    <SavingsGoal
                      goal={10000}
                      current={Math.max(0, stats.balance)}
                      monthlyExpenses={stats.expenses}
                      budgetLimit={4000}
                    />
                  </div>
                </div>
                <div className="xl:col-span-1">
                  <TransactionsList
                    transactions={filteredTransactions.map(t => ({ ...t, date: t.date }))}
                    onDelete={handleDeleteTransaction}
                    categoryFilter={selectedCategory}
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Transações */}
        <TabsContent value="transactions" className="animate-fade-in mt-5 space-y-4">
          {/* Filters */}
          <FinanceFilters
            selectedPeriod={selectedPeriod}
            selectedType={selectedType}
            onPeriodChange={setSelectedPeriod}
            onTypeChange={setSelectedType}
            onClearFilters={handleClearFilters}
          />

          {/* Add Transaction inline */}
          <div className="flex justify-center">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="btn-gradient gap-2 px-6 py-4 text-sm font-semibold rounded-xl shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Adicionar transação
            </Button>
          </div>

          <TransactionsList
            transactions={filteredTransactions.map(t => ({ ...t, date: t.date }))}
            onDelete={handleDeleteTransaction}
            categoryFilter={selectedCategory}
          />
        </TabsContent>

        {/* IA */}
        <TabsContent value="ia" className="animate-fade-in mt-5">
          <div className="glass-card p-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Assistente Financeira</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Tire suas dúvidas sobre finanças com a Veve, sua assistente de inteligência artificial.
            </p>
            <Button
              onClick={() => setVeveOpen(true)}
              className="btn-gradient gap-2 px-6 py-4 rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              Abrir Veve
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
        financeType={financeType}
      />

      <VeveAssistant externalOpen={veveOpen} onExternalOpenChange={setVeveOpen} />
    </DashboardLayout>
  );
};

export default Finances;
