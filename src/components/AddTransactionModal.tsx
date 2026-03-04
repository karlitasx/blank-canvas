import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Repeat } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  personalIncomeCategories, personalExpenseCategories, investmentCategories,
  businessCategories, type FinanceCategory,
} from "@/lib/financeCategories";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type TransactionType = "income" | "expense" | "investment";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  financeType?: "personal" | "business";
  onAdd: (transaction: {
    description: string;
    category: string;
    amount: number;
    type: "income" | "expense";
    date: Date;
    recurring: boolean;
    finance_type?: "personal" | "business";
  }) => void;
}

const paymentMethods = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Pix",
  "Transferência Bancária",
  "Boleto",
];

const frequencies = ["Mensal", "Semanal", "Quinzenal", "Anual"];
const daysOfMonth = Array.from({ length: 31 }, (_, i) => `Dia ${i + 1}`);

const AddTransactionModal = ({
  isOpen,
  onClose,
  onAdd,
  financeType = "personal",
}: AddTransactionModalProps) => {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [recurring, setRecurring] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [frequency, setFrequency] = useState("Mensal");
  const [dayOfMonth, setDayOfMonth] = useState("Dia 1");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const getCategoriesForType = (): FinanceCategory[] => {
    if (financeType === "business") return businessCategories;
    switch (type) {
      case "income": return personalIncomeCategories;
      case "expense": return personalExpenseCategories;
      case "investment": return investmentCategories;
      default: return personalExpenseCategories;
    }
  };

  const categories = getCategoriesForType();

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory("");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (parseInt(value || "0") / 100).toFixed(2);
    setAmount(value);
  };

  const handleSubmit = () => {
    if (!amount || !description || !category) return;

    onAdd({
      description,
      category,
      amount: parseFloat(amount),
      type: type === "investment" ? "expense" : type,
      date,
      recurring,
      finance_type: financeType,
    });

    setAmount("");
    setDescription("");
    setCategory("");
    setDate(new Date());
    setRecurring(false);
    setType("expense");
    setPaymentMethod("");
    setNotes("");
    setFrequency("Mensal");
    setDayOfMonth("Dia 1");
    setStartDate(new Date());
    setEndDate(null);
    onClose();
  };

  const formatDisplayAmount = () => {
    if (!amount) return "R$ 0,00";
    return parseFloat(amount).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const typeButtons: { key: TransactionType; label: string; activeClass: string }[] = [
    { key: "income", label: "Receita", activeClass: "bg-success/20 text-success border border-success" },
    { key: "expense", label: "Despesa", activeClass: "bg-destructive/20 text-destructive border border-destructive" },
    { key: "investment", label: "Investimento", activeClass: "bg-primary/20 text-primary border border-primary" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              {typeButtons.map((btn) => (
                <Button
                  key={btn.key}
                  type="button"
                  variant="ghost"
                  onClick={() => handleTypeChange(btn.key)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium transition-all text-sm",
                    type === btn.key ? btn.activeClass : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              value={formatDisplayAmount()}
              onChange={handleAmountChange}
              placeholder="R$ 0,00"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === "investment"
                  ? "Ex: Aporte mensal Tesouro Selic"
                  : financeType === "business"
                  ? "Ex: Pagamento fornecedor"
                  : "Ex: Almoço no restaurante"
              }
            />
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <Label>{type === "investment" ? "Tipo de Investimento *" : "Categoria *"}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Gasto fixo</p>
                <p className="text-xs text-muted-foreground">Será gerada automaticamente</p>
              </div>
            </div>
            <Switch checked={recurring} onCheckedChange={setRecurring} />
          </div>

          {/* Recurrence Settings */}
          {recurring && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">Configurações de Recorrência</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Frequência *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dia do Mês *</Label>
                  <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfMonth.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data de Fim (opcional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Sem fim"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate ?? undefined} onSelect={(d) => setEndDate(d ?? null)} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Date (when not recurring) */}
          {!recurring && (
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais (opcional)"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 gradient-primary"
              disabled={!amount || !description || !category}
            >
              Salvar Transação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
