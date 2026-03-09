import { useState } from "react";
import {
  Settings, Tag, CreditCard, Plus, Pencil, Trash2, DollarSign, X, Check,
  ShoppingBag, Utensils, Car, Home, Gamepad2, Heart, GraduationCap,
  Briefcase, Banknote, Gift, Truck, Users, FileText, Receipt, Landmark,
  Package, Wrench, Megaphone, Building2, Target, Wallet, Star, type LucideIcon,
  Smartphone, QrCode, Building, CircleDollarSign, ArrowLeftRight, Coins,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { personalCategories, businessCategories, type FinanceCategory } from "@/lib/financeCategories";
import { useFinanceCategories, type FinanceCategoryRecord } from "@/hooks/useFinanceCategories";
import { useFinanceCards, type FinanceCard } from "@/hooks/useFinanceCards";
import { usePaymentMethods, type PaymentMethod } from "@/hooks/usePaymentMethods";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface OrganizationTabProps {
  financeType: "personal" | "business";
}

// Icon map for dynamic rendering
const iconMap: Record<string, LucideIcon> = {
  Tag, ShoppingBag, Utensils, Car, Home, Gamepad2, Heart, GraduationCap,
  Briefcase, Banknote, Gift, Truck, Users, FileText, Receipt, Landmark,
  Package, Wrench, Megaphone, Building2, Target, Wallet, Star, CreditCard,
  DollarSign, Settings, Smartphone, QrCode, Building, CircleDollarSign,
  ArrowLeftRight, Coins,
};

const availableIcons = Object.keys(iconMap);

const availableColors = [
  "#f97316", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444",
  "#14b8a6", "#f59e0b", "#22c55e", "#6366f1", "#a855f7",
  "#6b7280", "#10b981",
];

const incomeCategories = ["Salário", "Investimento", "Presente", "Freelance", "Renda Extra", "Outros", "Receita de Vendas", "Serviços Prestados"];

const paymentTypeOptions = [
  { value: "pix", label: "Pix", icon: "QrCode" },
  { value: "credit", label: "Cartão de Crédito", icon: "CreditCard" },
  { value: "debit", label: "Cartão de Débito", icon: "CreditCard" },
  { value: "cash", label: "Dinheiro", icon: "Coins" },
  { value: "transfer", label: "Transferência", icon: "ArrowLeftRight" },
  { value: "boleto", label: "Boleto", icon: "FileText" },
  { value: "other", label: "Outro", icon: "Wallet" },
];

const OrganizationTab = ({ financeType }: OrganizationTabProps) => {
  const [subTab, setSubTab] = useState("categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<FinanceCategoryRecord | null>(null);

  // Category form state
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("Tag");
  const [formColor, setFormColor] = useState("#6b7280");
  const [formType, setFormType] = useState<"income" | "expense">("expense");

  // Card state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FinanceCard | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardLastDigits, setCardLastDigits] = useState("");
  const [cardColor, setCardColor] = useState("#3b82f6");
  const [cardLimit, setCardLimit] = useState("");
  const [cardClosingDay, setCardClosingDay] = useState("1");
  const [cardDueDay, setCardDueDay] = useState("10");

  // Payment method state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentName, setPaymentName] = useState("");
  const [paymentType, setPaymentType] = useState("pix");
  const [paymentIcon, setPaymentIcon] = useState("QrCode");
  const [paymentColor, setPaymentColor] = useState("#3b82f6");

  const { categories: customCategories, isLoaded, addCategory, updateCategory, deleteCategory } =
    useFinanceCategories(financeType);
  const { cards, isLoaded: cardsLoaded, addCard, updateCard, deleteCard } = useFinanceCards();
  const { methods: paymentMethods, isLoaded: paymentsLoaded, addMethod, updateMethod, deleteMethod } = usePaymentMethods();

  // Merge default + custom categories
  const defaultCats = financeType === "business" ? businessCategories : personalCategories;

  const allCategories: (FinanceCategory & { id?: string; isCustom?: boolean })[] = [
    ...defaultCats.map((c) => ({ ...c, isCustom: false })),
    ...customCategories.map((c) => ({
      name: c.name,
      icon: iconMap[c.icon_name] || Tag,
      color: c.color,
      id: c.id,
      isCustom: true,
      _type: c.type,
    })),
  ];

  const receitas = allCategories.filter((c) => {
    if ((c as any)._type) return (c as any)._type === "income";
    return incomeCategories.includes(c.name);
  });

  const despesas = allCategories.filter((c) => {
    if ((c as any)._type) return (c as any)._type === "expense";
    return !incomeCategories.includes(c.name);
  });

  const openCreateModal = () => {
    setEditingCat(null);
    setFormName("");
    setFormIcon("Tag");
    setFormColor("#6b7280");
    setFormType("expense");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: FinanceCategoryRecord) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon_name);
    setFormColor(cat.color);
    setFormType(cat.type);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    if (editingCat) {
      await updateCategory(editingCat.id, {
        name: formName.trim(),
        icon_name: formIcon,
        color: formColor,
        type: formType,
      });
      toast.success("Categoria atualizada!");
    } else {
      await addCategory({
        name: formName.trim(),
        icon_name: formIcon,
        color: formColor,
        type: formType,
        finance_type: financeType,
      });
      toast.success("Categoria criada!");
    }
    setIsModalOpen(false);
  };

  // Card helpers
  const openCreateCardModal = () => {
    setEditingCard(null);
    setCardName(""); setCardType("credit"); setCardBrand("Visa");
    setCardLastDigits(""); setCardColor("#3b82f6");
    setCardLimit(""); setCardClosingDay("1"); setCardDueDay("10");
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (card: FinanceCard) => {
    setEditingCard(card);
    setCardName(card.name); setCardType(card.card_type); setCardBrand(card.brand);
    setCardLastDigits(card.last_digits); setCardColor(card.card_color);
    setCardLimit(card.credit_limit > 0 ? String(card.credit_limit) : "");
    setCardClosingDay(String(card.closing_day)); setCardDueDay(String(card.due_day));
    setIsCardModalOpen(true);
  };

  const handleSaveCard = async () => {
    if (!cardName.trim()) { toast.error("Nome do cartão é obrigatório"); return; }
    const payload = {
      name: cardName.trim(), card_type: cardType, brand: cardBrand,
      last_digits: cardLastDigits, card_color: cardColor,
      credit_limit: parseFloat(cardLimit) || 0,
      closing_day: parseInt(cardClosingDay) || 1,
      due_day: parseInt(cardDueDay) || 10,
      is_active: true,
    };
    if (editingCard) {
      await updateCard(editingCard.id, payload);
      toast.success("Cartão atualizado!");
    } else {
      await addCard(payload);
      toast.success("Cartão adicionado!");
    }
    setIsCardModalOpen(false);
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCard(id);
    toast.success("Cartão excluído!");
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    toast.success("Categoria excluída!");
  };

  // Payment method helpers
  const openCreatePaymentModal = () => {
    setEditingPayment(null);
    setPaymentName("");
    setPaymentType("pix");
    setPaymentIcon("QrCode");
    setPaymentColor("#3b82f6");
    setIsPaymentModalOpen(true);
  };

  const openEditPaymentModal = (method: PaymentMethod) => {
    setEditingPayment(method);
    setPaymentName(method.name);
    setPaymentType(method.type);
    setPaymentIcon(method.icon_name);
    setPaymentColor(method.color);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async () => {
    if (!paymentName.trim()) { toast.error("Nome é obrigatório"); return; }
    const payload = {
      name: paymentName.trim(),
      type: paymentType,
      icon_name: paymentIcon,
      color: paymentColor,
      is_active: true,
    };
    if (editingPayment) {
      await updateMethod(editingPayment.id, payload);
      toast.success("Forma de pagamento atualizada!");
    } else {
      await addMethod(payload);
      toast.success("Forma de pagamento adicionada!");
    }
    setIsPaymentModalOpen(false);
  };

  const handleDeletePayment = async (id: string) => {
    await deleteMethod(id);
    toast.success("Forma de pagamento excluída!");
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-muted">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Organização</h2>
          <p className="text-sm text-muted-foreground">Gerencie categorias, cartões e formas de pagamento</p>
        </div>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm"
          >
            <Tag className="w-4 h-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger
            value="cards"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm"
          >
            <CreditCard className="w-4 h-4" />
            Cartões
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm"
          >
            <Wallet className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        {/* ===== CATEGORIAS ===== */}
        <TabsContent value="categories" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Categorias</h3>
              <p className="text-sm text-muted-foreground">Organize suas transações por categorias</p>
            </div>
            <Button onClick={openCreateModal} className="btn-gradient gap-2 rounded-full">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Categoria</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>

          <CategorySection
            title="Receitas"
            categories={receitas}
            type="income"
            onEdit={openEditModal}
            onDelete={handleDelete}
            customCategories={customCategories}
          />

          <CategorySection
            title="Despesas"
            categories={despesas}
            type="expense"
            onEdit={openEditModal}
            onDelete={handleDelete}
            customCategories={customCategories}
          />
        </TabsContent>

        {/* ===== CARTÕES ===== */}
        <TabsContent value="cards" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Cartões</h3>
              <p className="text-sm text-muted-foreground">Gerencie seus cartões de crédito e débito</p>
            </div>
            <Button onClick={openCreateCardModal} className="btn-gradient gap-2 rounded-full">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Cartão</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>

          {!cardsLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : cards.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Nenhum cartão cadastrado"
              description="Adicione seus cartões de crédito e débito para organizar seus gastos."
              action={{ label: "Adicionar Cartão", onClick: openCreateCardModal }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="relative rounded-2xl p-5 text-white overflow-hidden group"
                  style={{ background: `linear-gradient(135deg, ${card.card_color}, ${card.card_color}cc)` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                      {card.card_type === "credit" ? "Crédito" : "Débito"}
                    </span>
                    <span className="text-sm font-bold">{card.brand}</span>
                  </div>
                  <p className="text-lg font-mono tracking-widest mb-4">
                    •••• •••• •••• {card.last_digits || "••••"}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{card.name}</p>
                    {card.card_type === "credit" && card.credit_limit > 0 && (
                      <p className="text-xs opacity-80">
                        Limite: {card.credit_limit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    )}
                  </div>
                  {card.card_type === "credit" && (
                    <p className="text-[10px] opacity-60 mt-1">
                      Fecha dia {card.closing_day} · Vence dia {card.due_day}
                    </p>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditCardModal(card)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== FORMAS DE PAGAMENTO ===== */}
        <TabsContent value="payments" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Formas de Pagamento</h3>
              <p className="text-sm text-muted-foreground">Configure como você paga e recebe</p>
            </div>
            <Button onClick={openCreatePaymentModal} className="btn-gradient gap-2 rounded-full">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Forma</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>

          {/* Default payment types info */}
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Tipos disponíveis:</p>
            <div className="flex flex-wrap gap-2">
              {paymentTypeOptions.map((opt) => {
                const Icon = iconMap[opt.icon] || Wallet;
                return (
                  <span key={opt.value} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </span>
                );
              })}
            </div>
          </div>

          {!paymentsLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : paymentMethods.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Nenhuma forma de pagamento"
              description="Adicione suas formas de pagamento preferidas como Pix, cartão, dinheiro, etc."
              action={{ label: "Adicionar Forma de Pagamento", onClick: openCreatePaymentModal }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = iconMap[method.icon_name] || Wallet;
                const typeLabel = paymentTypeOptions.find((o) => o.value === method.type)?.label || method.type;
                return (
                  <div
                    key={method.id}
                    className="glass-card rounded-xl p-4 flex items-center gap-3 group hover:shadow-md transition-all"
                    style={{ borderLeft: `3px solid ${method.color}` }}
                  >
                    <div className="p-2.5 rounded-full" style={{ backgroundColor: `${method.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: method.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{method.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                        {typeLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditPaymentModal(method)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(method.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== CATEGORY MODAL ===== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Alimentação"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormType("income")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formType === "income"
                      ? "bg-green-500/20 text-green-600 border border-green-500"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Receita
                </button>
                <button
                  onClick={() => setFormType("expense")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formType === "expense"
                      ? "bg-red-500/20 text-red-600 border border-red-500"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Despesa
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">
                {availableIcons.map((iconName) => {
                  const Icon = iconMap[iconName];
                  return (
                    <button
                      key={iconName}
                      onClick={() => setFormIcon(iconName)}
                      className={`p-2 rounded-lg transition-all ${
                        formIcon === iconName
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: formColor }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prévia</Label>
              <div
                className="glass-card rounded-xl p-4 flex items-center gap-3"
                style={{ borderLeft: `3px solid ${formColor}` }}
              >
                <div className="p-2.5 rounded-full" style={{ backgroundColor: `${formColor}20` }}>
                  {(() => {
                    const PreviewIcon = iconMap[formIcon] || Tag;
                    return <PreviewIcon className="w-5 h-5" style={{ color: formColor }} />;
                  })()}
                </div>
                <div>
                  <p className="font-medium text-sm">{formName || "Nome da categoria"}</p>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      formType === "income" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {formType === "income" ? "Receita" : "Despesa"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1 btn-gradient" disabled={!formName.trim()}>
                <Check className="w-4 h-4 mr-1" />
                {editingCat ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== CARD MODAL ===== */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome do Cartão</Label>
              <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Ex: Nubank Crédito" />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <button onClick={() => setCardType("credit")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${cardType === "credit" ? "bg-primary/20 text-primary border border-primary" : "bg-muted hover:bg-muted/80"}`}>
                  Crédito
                </button>
                <button onClick={() => setCardType("debit")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${cardType === "debit" ? "bg-primary/20 text-primary border border-primary" : "bg-muted hover:bg-muted/80"}`}>
                  Débito
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bandeira</Label>
                <Select value={cardBrand} onValueChange={setCardBrand}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Visa", "Mastercard", "Elo", "Amex", "Hipercard", "Outro"].map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Últimos 4 dígitos</Label>
                <Input value={cardLastDigits} onChange={(e) => setCardLastDigits(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" maxLength={4} />
              </div>
            </div>

            {cardType === "credit" && (
              <>
                <div className="space-y-2">
                  <Label>Limite</Label>
                  <Input type="number" value={cardLimit} onChange={(e) => setCardLimit(e.target.value)} placeholder="5000" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Dia de Fechamento</Label>
                    <Select value={cardClosingDay} onValueChange={setCardClosingDay}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>Dia {i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dia de Vencimento</Label>
                    <Select value={cardDueDay} onValueChange={setCardDueDay}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>Dia {i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Cor do Cartão</Label>
              <div className="flex flex-wrap gap-2">
                {["#3b82f6", "#8b5cf6", "#ef4444", "#22c55e", "#f97316", "#ec4899", "#6366f1", "#14b8a6", "#1e293b", "#6b7280"].map((c) => (
                  <button key={c} onClick={() => setCardColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${cardColor === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4 text-white text-sm" style={{ background: `linear-gradient(135deg, ${cardColor}, ${cardColor}cc)` }}>
              <div className="flex justify-between mb-3">
                <span className="text-xs uppercase opacity-80">{cardType === "credit" ? "Crédito" : "Débito"}</span>
                <span className="font-bold text-xs">{cardBrand}</span>
              </div>
              <p className="font-mono tracking-widest mb-2">•••• •••• •••• {cardLastDigits || "••••"}</p>
              <p className="font-medium">{cardName || "Nome do cartão"}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsCardModalOpen(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSaveCard} className="flex-1 btn-gradient" disabled={!cardName.trim()}>
                <Check className="w-4 h-4 mr-1" />
                {editingCard ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== PAYMENT METHOD MODAL ===== */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={paymentName}
                onChange={(e) => setPaymentName(e.target.value)}
                placeholder="Ex: Pix Nubank, Dinheiro, etc."
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={paymentType} onValueChange={(v) => {
                setPaymentType(v);
                const opt = paymentTypeOptions.find((o) => o.value === v);
                if (opt) setPaymentIcon(opt.icon);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setPaymentColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      paymentColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">
                {availableIcons.map((iconName) => {
                  const Icon = iconMap[iconName];
                  return (
                    <button
                      key={iconName}
                      onClick={() => setPaymentIcon(iconName)}
                      className={`p-2 rounded-lg transition-all ${
                        paymentIcon === iconName
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: paymentColor }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Prévia</Label>
              <div
                className="glass-card rounded-xl p-4 flex items-center gap-3"
                style={{ borderLeft: `3px solid ${paymentColor}` }}
              >
                <div className="p-2.5 rounded-full" style={{ backgroundColor: `${paymentColor}20` }}>
                  {(() => {
                    const PreviewIcon = iconMap[paymentIcon] || Wallet;
                    return <PreviewIcon className="w-5 h-5" style={{ color: paymentColor }} />;
                  })()}
                </div>
                <div>
                  <p className="font-medium text-sm">{paymentName || "Nome da forma"}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                    {paymentTypeOptions.find((o) => o.value === paymentType)?.label || paymentType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSavePayment} className="flex-1 btn-gradient" disabled={!paymentName.trim()}>
                <Check className="w-4 h-4 mr-1" />
                {editingPayment ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Category Section ---

interface CategorySectionProps {
  title: string;
  categories: (FinanceCategory & { id?: string; isCustom?: boolean })[];
  type: "income" | "expense";
  onEdit: (cat: FinanceCategoryRecord) => void;
  onDelete: (id: string) => void;
  customCategories: FinanceCategoryRecord[];
}

const CategorySection = ({ title, categories, type, onEdit, onDelete, customCategories }: CategorySectionProps) => {
  const titleColor = type === "income" ? "text-green-500" : "text-red-500";
  const badgeColor = type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";
  const labelBg = type === "income" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600";
  const labelText = type === "income" ? "Receita" : "Despesa";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className={`w-4 h-4 ${titleColor}`} />
        <h4 className={`font-semibold ${titleColor}`}>{title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
          {categories.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isCustom = cat.isCustom;
          const customRecord = isCustom
            ? customCategories.find((c) => c.id === cat.id)
            : null;

          return (
            <div
              key={cat.id || `default-${idx}`}
              className="glass-card rounded-xl p-4 flex items-center gap-3 group hover:shadow-md transition-all"
              style={{ borderLeft: `3px solid ${cat.color}` }}
            >
              <div className="p-2.5 rounded-full" style={{ backgroundColor: `${cat.color}20` }}>
                <Icon className="w-5 h-5" style={{ color: cat.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{cat.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${labelBg}`}>
                  {labelText}
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isCustom && customRecord && (
                  <>
                    <button
                      onClick={() => onEdit(customRecord)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(customRecord.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {!isCustom && (
                  <span className="text-[10px] text-muted-foreground italic px-1">padrão</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrganizationTab;
