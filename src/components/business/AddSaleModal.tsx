import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BusinessSale } from "@/hooks/useBusinessFinance";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (sale: Omit<BusinessSale, "id" | "created_at">) => Promise<void>;
}

const AddSaleModal = ({ open, onClose, onAdd }: Props) => {
  const [amount, setAmount] = useState("");
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Informe o valor da venda"); return; }
    setSaving(true);
    await onAdd({
      amount: Number(amount),
      client_name: clientName || null,
      payment_method: paymentMethod,
      sale_date: saleDate,
      notes: notes || null,
    });
    toast.success("Venda registrada!");
    setAmount(""); setClientName(""); setNotes("");
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Venda</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Valor *</Label>
            <Input type="number" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
          </div>
          <div>
            <Label>Cliente (opcional)</Label>
            <Input placeholder="Nome do cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div>
            <Label>Forma de pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observação (opcional)</Label>
            <Textarea placeholder="Detalhes da venda..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full btn-gradient py-4 rounded-xl">
            {saving ? "Salvando..." : "Registrar Venda"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSaleModal;
