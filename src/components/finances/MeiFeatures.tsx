import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Plus, Receipt, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessSales } from "@/hooks/useBusinessSales";
import { useDasPayments } from "@/hooks/useDasPayments";
import { format } from "date-fns";

// Valores atualizados para 2026
const MEI_ANNUAL_LIMIT = 81000; // Limite MEI 2026
const DAS_MEI_2026 = 75.90; // DAS MEI 2026 = 5% do salário mínimo (R$ 1.518)

const MeiFeatures = () => {
  const { yearlyTotal } = useBusinessSales();
  const { payments, addPayment, markAsPaid } = useDasPayments();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [amount, setAmount] = useState(DAS_MEI_2026.toFixed(2));

  const percentage = (yearlyTotal / MEI_ANNUAL_LIMIT) * 100;
  const remaining = MEI_ANNUAL_LIMIT - yearlyTotal;

  const handleAdd = async () => {
    if (!month) return;
    await addPayment(month, Number(amount) || DAS_MEI_2026);
    setOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Recursos MEI</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Valores 2026</span>
      </div>

      {/* Info Card */}
      <div className="glass-card p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">DAS MEI 2026</p>
            <p className="text-xs text-muted-foreground mt-1">
              Valor mensal: <strong>R$ {DAS_MEI_2026.toFixed(2)}</strong> (5% do salário mínimo de R$ 1.518,00). 
              Vencimento: dia 20 de cada mês.
            </p>
          </div>
        </div>
      </div>

      {/* Annual Limit */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          {percentage > 80 ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          <h4 className="font-semibold text-foreground">Limite Anual de Faturamento 2026</h4>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Faturado</p>
            <p className="text-base font-bold text-foreground">R$ {yearlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Limite</p>
            <p className="text-base font-bold text-foreground">R$ {MEI_ANNUAL_LIMIT.toLocaleString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Disponível</p>
            <p className={`text-base font-bold ${remaining < 10000 ? "text-red-500" : "text-emerald-500"}`}>R$ {Math.max(0, remaining).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all ${percentage > 80 ? "bg-red-500" : percentage > 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{percentage.toFixed(1)}% do limite utilizado</p>
        {percentage > 80 && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400 font-medium">⚠️ Atenção! Você já utilizou mais de 80% do limite anual. Considere avaliar o enquadramento no Simples Nacional.</p>
          </div>
        )}
      </div>

      {/* DAS Payments */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Pagamento do DAS</h4>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1 rounded-xl"><Plus className="w-3.5 h-3.5" /> Adicionar</Button></DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>Adicionar DAS</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Mês de Referência</Label><Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="mt-1" /></div>
                <div>
                  <Label>Valor (padrão 2026: R$ {DAS_MEI_2026.toFixed(2)})</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={handleAdd} className="w-full btn-gradient rounded-xl">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum registro de DAS</p>
        ) : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {p.status === "pago" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.reference_month}</p>
                    <p className="text-xs text-muted-foreground">R$ {p.amount.toFixed(2)} · {p.status === "pago" ? "Pago" : "Pendente"}</p>
                  </div>
                </div>
                {p.status !== "pago" && (
                  <Button size="sm" variant="outline" onClick={() => markAsPaid(p.id)} className="rounded-xl text-xs">Marcar Pago</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Datas Importantes */}
      <div className="glass-card p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Datas Importantes MEI 2026</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">Vencimento DAS mensal</span>
            <span className="text-sm font-medium text-primary">Dia 20</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-foreground">DASN-SIMEI (Declaração Anual)</span>
            <span className="text-sm font-medium text-primary">Até 31/05/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeiFeatures;
