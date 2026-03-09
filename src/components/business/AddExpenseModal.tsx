import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessExpense } from "@/hooks/useBusinessFinance";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<BusinessExpense, "id" | "created_at">) => Promise<void>;
}

const categories = [
  { value: "material", label: "Material" },
  { value: "marketing", label: "Marketing" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "impostos", label: "Impostos" },
  { value: "aluguel", label: "Aluguel" },
  { value: "funcionarios", label: "Funcionários" },
  { value: "transporte", label: "Transporte" },
  { value: "outros", label: "Outros" },
];

const AddExpenseModal = ({ open, onClose, onAdd }: Props) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("outros");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Informe o valor da despesa"); return; }
    setSaving(true);
    await onAdd({
      amount: Number(amount),
      category,
      expense_date: expenseDate,
      description: description || null,
    });
    toast.success("Despesa registrada!");
    setAmount(""); setDescription("");
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Despesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Valor *</Label>
            <Input type="number" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição (opcional)</Label>
            <Input placeholder="Detalhe a despesa" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full btn-gradient py-4 rounded-xl">
            {saving ? "Salvando..." : "Registrar Despesa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
