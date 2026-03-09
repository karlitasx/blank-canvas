import { useState } from "react";
import { Plus, DollarSign, Wallet, ArrowLeft, Building2, User, LayoutGrid, BarChart3, FileText, Target, CreditCard, FolderKanban, TrendingDown, Sparkles, Shield, X, Filter, Bot } from "lucide-react";
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
import VeveInlineAssistant from "@/components/finances/VeveInlineAssistant";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSupabaseFinances } from "@/hooks/useSupabaseFinances";

const financeTabs = [
  { value: "overview", label: "Resumo", icon: LayoutGrid },
  { value: "transactions", label: "Transações", icon: FileText },
  { value: "expenses", label: "Saídas", icon: TrendingDown },
  { value: "investments", label: "Investimentos", icon: BarChart3 },
  { value: "goals", label: "Metas", icon: Target },
  { value: "debts", label: "Dívidas", icon: CreditCard },
  { value: "organization", label: "Organização", icon: FolderKanban },
];

const Finances = () => {
  const [financeType, setFinanceType] = useState<FinanceType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);
  const [veveOpen, setVeveOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const handleSavingsTransaction = async (amount: number, wishName: string) => {
    await addTransaction({
      description: `Economia: ${wishName}`,
      category: "Investimento / Objetivo",
      amount,
      type: "expense",
      date: new Date(),
      finance_type: financeType || "personal",
    });
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
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNav="/finance">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFinanceType(null)}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
                <TypeIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-primary-foreground">
                  Finanças {typeLabel}
                </h1>
                <p className="text-primary-foreground/70 text-sm">
                  {isBusiness
                    ? "Gerencie o fluxo de caixa do seu negócio"
                    : "Controle total da sua vida financeira"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Action Row */}
      <div className="flex flex-col items-center gap-3 mb-6">
        {/* Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full max-w-md py-3 px-5 rounded-xl border border-border bg-card text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors"
        >
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros</span>
        </button>

        {/* Veve Button */}
        <button
          onClick={() => setVeveOpen(true)}
          className="w-full max-w-md py-3 px-5 rounded-xl border border-primary/30 text-primary flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Veve</span>
        </button>

        {/* Add Transaction - Central CTA */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="btn-gradient gap-2 px-8 py-5 text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Adicionar transação
        </Button>

        <LgpdNotice />
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="mb-6 animate-fade-in">
          <FinanceFilters
            selectedPeriod={selectedPeriod}
            selectedType={selectedType}
            onPeriodChange={setSelectedPeriod}
            onTypeChange={setSelectedType}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Security Banner */}
      {showSecurityBanner && (
        <div className="mb-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex gap-3 items-start">
          <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              <strong>Seus dados estão seguros:</strong>{" "}
              <span className="text-muted-foreground">
                Utilizamos criptografia de ponta e não compartilhamos suas informações financeiras com terceiros.
              </span>
            </p>
          </div>
          <button onClick={() => setShowSecurityBanner(false)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards balance={stats.balance} income={stats.income} expenses={stats.expenses} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="flex flex-col sm:flex-row sm:flex-wrap w-full bg-muted/50 rounded-xl p-1.5 h-auto gap-1">
          {financeTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-full sm:w-auto justify-start sm:justify-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2 text-sm px-3 py-2.5"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in mt-6">
          {transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Nenhuma transação ainda"
              description={
                isBusiness
                  ? "Registre a primeira transação empresarial para acompanhar seu fluxo de caixa."
                  : "Registre sua primeira receita ou despesa para começar a acompanhar suas finanças."
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

        {/* Saídas */}
        <TabsContent value="expenses" className="animate-fade-in mt-6">
          <ExpenseOverview
            transactions={transactions}
            onAddExpense={() => setIsModalOpen(true)}
          />
        </TabsContent>

        {/* Transações */}
        <TabsContent value="transactions" className="animate-fade-in mt-6">
          <TransactionsList
            transactions={filteredTransactions.map(t => ({ ...t, date: t.date }))}
            onDelete={handleDeleteTransaction}
            categoryFilter={selectedCategory}
          />
        </TabsContent>

        {/* IA - Assistente Veve */}
        <TabsContent value="ai" className="animate-fade-in mt-6">
          <VeveInlineAssistant />
        </TabsContent>

        {/* Investimentos */}
        <TabsContent value="investments" className="animate-fade-in mt-6 space-y-8">
          <EmergencyFundCalculator />
          <BudgetMethods />
        </TabsContent>

        {/* Metas */}
        <TabsContent value="goals" className="animate-fade-in mt-6">
          <MetasKanban />
        </TabsContent>

        {/* Dívidas */}
        <TabsContent value="debts" className="animate-fade-in mt-6">
          <EmptyState
            icon={CreditCard}
            title="Controle de dívidas em breve"
            description="Organize suas dívidas, parcelas e acompanhe sua quitação. Disponível em breve!"
          />
        </TabsContent>

        {/* Organização */}
        <TabsContent value="organization" className="animate-fade-in mt-6">
          <OrganizationTab financeType={financeType} />
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
