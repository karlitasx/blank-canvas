import { useState } from "react";
import { Plus, Trash2, CalendarCheck, CheckCircle2, Circle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFiscalReminders } from "@/hooks/useFiscalReminders";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import type { BusinessType } from "@/hooks/useBusinessSettings";

const reminderTypes = [
  { value: "das", label: "Pagamento do DAS" },
  { value: "declaracao_mei", label: "Declaração Anual do MEI" },
  { value: "imposto_simples", label: "Imposto Simples Nacional" },
  { value: "outro", label: "Outro" },
];

interface FiscalAgendaProps {
  businessType: BusinessType;
}

const FiscalAgenda = ({ businessType }: FiscalAgendaProps) => {
  const { reminders, addReminder, toggleComplete, deleteReminder } = useFiscalReminders();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_date: format(new Date(), "yyyy-MM-dd"), reminder_type: "das" });

  const filteredTypes = reminderTypes.filter(t => {
    if (businessType === "mei") return true;
    if (businessType === "simples") return t.value !== "declaracao_mei";
    return t.value === "outro";
  });

  const handleAdd = async () => {
    if (!form.title || !form.due_date) return;
    await addReminder({ title: form.title, description: form.description || null, due_date: form.due_date, reminder_type: form.reminder_type });
    setForm({ title: "", description: "", due_date: format(new Date(), "yyyy-MM-dd"), reminder_type: "das" });
    setOpen(false);
  };

  const pending = reminders.filter(r => !r.is_completed);
  const completed = reminders.filter(r => r.is_completed);

  const getStatusColor = (dueDate: string) => {
    const d = new Date(dueDate);
    if (isPast(d) && !isToday(d)) return "text-red-500";
    if (differenceInDays(d, new Date()) <= 7) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Agenda Fiscal</h3>
          <p className="text-sm text-muted-foreground">Obrigações e lembretes fiscais</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="btn-gradient gap-2 rounded-xl"><Plus className="w-4 h-4" /> Novo Lembrete</Button></DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Novo Lembrete Fiscal</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Título *</Label><Input placeholder="Ex: Pagar DAS Janeiro" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1" /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.reminder_type} onValueChange={v => setForm(p => ({ ...p, reminder_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{filteredTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Data de Vencimento</Label><Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="mt-1" /></div>
              <div><Label>Descrição (opcional)</Label><Input placeholder="Detalhes" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" /></div>
              <Button onClick={handleAdd} className="w-full btn-gradient rounded-xl">Adicionar Lembrete</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pending.length === 0 && completed.length === 0 ? (
        <div className="glass-card p-8 rounded-xl text-center">
          <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum lembrete fiscal cadastrado</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Bell className="w-4 h-4" /> Pendentes ({pending.length})</p>
              {pending.map(r => (
                <div key={r.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleComplete(r.id, true)}>
                      <Circle className={`w-5 h-5 ${getStatusColor(r.due_date)}`} />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(r.due_date), "dd/MM/yyyy")} · {reminderTypes.find(t => t.value === r.reminder_type)?.label}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Concluídos ({completed.length})</p>
              {completed.slice(0, 5).map(r => (
                <div key={r.id} className="glass-card p-3 rounded-xl flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleComplete(r.id, false)}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-foreground line-through">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(r.due_date), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FiscalAgenda;
