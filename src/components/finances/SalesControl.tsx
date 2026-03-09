import { useState } from "react";
import { Plus, Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessSales } from "@/hooks/useBusinessSales";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";

const paymentMethods = ["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto", "Transferência"];

const SalesControl = () => {
  const { sales, monthlyTotal, yearlyTotal, monthlyData, addSale, deleteSale } = useBusinessSales();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", client_name: "", payment_method: "pix", notes: "", sale_date: format(new Date(), "yyyy-MM-dd") });

  const handleAdd = async () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    await addSale({
      amount: Number(form.amount),
      client_name: form.client_name || null,
      payment_method: form.payment_method,
      notes: form.notes || null,
      sale_date: form.sale_date,
    });
    setForm({ amount: "", client_name: "", payment_method: "pix", notes: "", sale_date: format(new Date(), "yyyy-MM-dd") });
    setOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Controle de Faturamento</h3>
          <p className="text-sm text-muted-foreground">Registre e acompanhe suas vendas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2 rounded-xl"><Plus className="w-4 h-4" /> Nova Venda</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Registrar Venda</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Valor *</Label><Input type="number" step="0.01" placeholder="0,00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="mt-1" /></div>
              <div><Label>Cliente (opcional)</Label><Input placeholder="Nome do cliente" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} className="mt-1" /></div>
              <div><Label>Data</Label><Input type="date" value={form.sale_date} onChange={e => setForm(p => ({ ...p, sale_date: e.target.value }))} className="mt-1" /></div>
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={form.payment_method} onValueChange={v => setForm(p => ({ ...p, payment_method: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Observação (opcional)</Label><Input placeholder="Observação" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="mt-1" /></div>
              <Button onClick={handleAdd} className="w-full btn-gradient rounded-xl">Salvar Venda</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Total do Mês</p>
          <p className="text-xl font-bold text-emerald-500">R$ {monthlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-xs text-muted-foreground">Total Anual</p>
          <p className="text-xl font-bold text-foreground">R$ {yearlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <p className="text-sm font-semibold text-foreground mb-4">Evolução do Faturamento</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Faturamento"]} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Vendas Recentes</p>
        {sales.length === 0 ? (
          <div className="glass-card p-6 rounded-xl text-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada</p>
          </div>
        ) : (
          sales.slice(0, 10).map(sale => (
            <div key={sale.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">R$ {sale.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">{sale.client_name || "Sem cliente"} · {sale.payment_method} · {format(new Date(sale.sale_date), "dd/MM/yyyy")}</p>
                </div>
              </div>
              <button onClick={() => deleteSale(sale.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalesControl;
