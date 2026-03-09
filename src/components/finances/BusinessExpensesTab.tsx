import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBusinessExpenses, BUSINESS_EXPENSE_CATEGORIES } from "@/hooks/useBusinessExpenses";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { format } from "date-fns";

const BusinessExpensesTab = () => {
  const { expenses, monthlyTotal, categoryData, addExpense, deleteExpense } = useBusinessExpenses();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", category: "outros", description: "", expense_date: format(new Date(), "yyyy-MM-dd") });

  const handleAdd = async () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    await addExpense({ amount: Number(form.amount), category: form.category, description: form.description || null, expense_date: form.expense_date });
    setForm({ amount: "", category: "outros", description: "", expense_date: format(new Date(), "yyyy-MM-dd") });
    setOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Despesas Empresariais</h3>
          <p className="text-sm text-muted-foreground">Controle seus gastos do negócio</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="btn-gradient gap-2 rounded-xl"><Plus className="w-4 h-4" /> Nova Despesa</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Registrar Despesa</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Valor *</Label><Input type="number" step="0.01" placeholder="0,00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="mt-1" /></div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{BUSINESS_EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Data</Label><Input type="date" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} className="mt-1" /></div>
              <div><Label>Descrição (opcional)</Label><Input placeholder="Descrição" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" /></div>
              <Button onClick={handleAdd} className="w-full btn-gradient rounded-xl">Salvar Despesa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <p className="text-xs text-muted-foreground">Total de Despesas do Mês</p>
        <p className="text-xl font-bold text-red-500">R$ {monthlyTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
      </div>

      {categoryData.length > 0 && (
        <div className="glass-card p-4 rounded-xl">
          <p className="text-sm font-semibold text-foreground mb-4">Distribuição por Categoria</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map(c => (
              <span key={c.name} className="text-xs flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} /> {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Despesas Recentes</p>
        {expenses.length === 0 ? (
          <div className="glass-card p-6 rounded-xl text-center">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma despesa registrada</p>
          </div>
        ) : (
          expenses.slice(0, 10).map(exp => (
            <div key={exp.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">R$ {exp.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">{BUSINESS_EXPENSE_CATEGORIES.find(c => c.value === exp.category)?.label || exp.category} · {format(new Date(exp.expense_date), "dd/MM/yyyy")}</p>
                </div>
              </div>
              <button onClick={() => deleteExpense(exp.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BusinessExpensesTab;
