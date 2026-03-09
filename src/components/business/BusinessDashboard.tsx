import { useState } from "react";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign, Receipt, AlertTriangle, Calendar, Settings, BarChart3, ShoppingCart, FileText, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useBusinessFinance } from "@/hooks/useBusinessFinance";
import AddSaleModal from "./AddSaleModal";
import AddExpenseModal from "./AddExpenseModal";
import SalesList from "./SalesList";
import ExpensesList from "./ExpensesList";
import MeiSection from "./MeiSection";
import SimplesSection from "./SimplesSection";
import FiscalAgenda from "./FiscalAgenda";
import BusinessSettingsModal from "./BusinessSettingsModal";
import BusinessChart from "./BusinessChart";

interface Props {
  biz: ReturnType<typeof useBusinessFinance>;
}

const BusinessDashboard = ({ biz }: Props) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const typeLabel =
    biz.settings?.business_type === "mei" ? "MEI" :
    biz.settings?.business_type === "simples_nacional" ? "Simples Nacional" : "Autônomo";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/finance")} className="-ml-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Finanças Empresariais</h1>
            <p className="text-muted-foreground text-sm">{typeLabel}{biz.settings?.company_name ? ` — ${biz.settings.company_name}` : ""}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary via-primary/90 to-secondary p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/70 font-medium">Faturamento</span>
            </div>
            <p className="text-lg font-bold text-primary-foreground">{formatCurrency(biz.monthlySales)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/70 font-medium">Despesas</span>
            </div>
            <p className="text-lg font-bold text-primary-foreground">{formatCurrency(biz.monthlyExpenses)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/70 font-medium">Lucro</span>
            </div>
            <p className={`text-lg font-bold ${biz.estimatedProfit >= 0 ? "text-primary-foreground" : "text-red-300"}`}>
              {formatCurrency(biz.estimatedProfit)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Receipt className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/70 font-medium">Impostos</span>
            </div>
            <p className="text-lg font-bold text-primary-foreground">{formatCurrency(biz.estimatedTax)}</p>
          </div>
        </div>

        {/* MEI Alert */}
        {biz.settings?.business_type === "mei" && biz.meiLimitPercent >= 80 && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="text-xs text-yellow-100 font-medium">
              Atenção: {biz.meiLimitPercent.toFixed(1)}% do limite anual MEI atingido
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button onClick={() => setShowSaleModal(true)} className="btn-gradient gap-2 py-4 rounded-xl">
          <Plus className="w-4 h-4" /> Registrar Venda
        </Button>
        <Button onClick={() => setShowExpenseModal(true)} variant="outline" className="gap-2 py-4 rounded-xl">
          <Plus className="w-4 h-4" /> Registrar Despesa
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 rounded-xl p-1 h-auto">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg py-2 text-xs font-medium">
            <BarChart3 className="w-3.5 h-3.5 mr-1" /> Resumo
          </TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg py-2 text-xs font-medium">
            <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Vendas
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg py-2 text-xs font-medium">
            <FileText className="w-3.5 h-3.5 mr-1" /> Despesas
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg py-2 text-xs font-medium">
            <Bell className="w-3.5 h-3.5 mr-1" /> Fiscal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-5 space-y-6 animate-fade-in">
          <BusinessChart sales={biz.sales} />
          {biz.settings?.business_type === "mei" && <MeiSection biz={biz} />}
          {biz.settings?.business_type === "simples_nacional" && <SimplesSection biz={biz} />}
        </TabsContent>

        <TabsContent value="sales" className="mt-5 animate-fade-in">
          <SalesList sales={biz.sales} onDelete={biz.deleteSale} formatCurrency={formatCurrency} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-5 animate-fade-in">
          <ExpensesList expenses={biz.expenses} onDelete={biz.deleteExpense} formatCurrency={formatCurrency} />
        </TabsContent>

        <TabsContent value="fiscal" className="mt-5 animate-fade-in">
          <FiscalAgenda biz={biz} />
        </TabsContent>
      </Tabs>

      <AddSaleModal open={showSaleModal} onClose={() => setShowSaleModal(false)} onAdd={biz.addSale} />
      <AddExpenseModal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} onAdd={biz.addExpense} />
      <BusinessSettingsModal open={showSettings} onClose={() => setShowSettings(false)} biz={biz} />
    </div>
  );
};

export default BusinessDashboard;
