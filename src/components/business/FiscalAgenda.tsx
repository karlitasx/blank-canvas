import { useState } from "react";
import { Calendar, CheckCircle, Circle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBusinessFinance } from "@/hooks/useBusinessFinance";
import { toast } from "sonner";

interface Props {
  biz: ReturnType<typeof useBusinessFinance>;
}

const FiscalAgenda = ({ biz }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    if (!title || !dueDate) { toast.error("Preencha título e data"); return; }
    await biz.addReminder({
      title,
      description: description || null,
      due_date: dueDate,
      reminder_type: "custom",
    });
    toast.success("Lembrete adicionado!");
    setTitle(""); setDueDate(""); setDescription("");
    setShowAdd(false);
  };

  const pendingReminders = biz.reminders.filter(r => !r.is_completed);
  const completedReminders = biz.reminders.filter(r => r.is_completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Agenda Fiscal
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1 text-xs">
          <Plus className="w-3 h-3" /> Novo lembrete
        </Button>
      </div>

      {/* Default reminders info */}
      {biz.settings?.business_type === "mei" && (
        <div className="glass-card p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">📌 Obrigações MEI</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• DAS mensal — vencimento todo dia 20</li>
            <li>• Declaração Anual (DASN-SIMEI) — até 31 de maio</li>
          </ul>
        </div>
      )}

      {biz.settings?.business_type === "simples_nacional" && (
        <div className="glass-card p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">📌 Obrigações Simples Nacional</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• DAS mensal — vencimento todo dia 20</li>
            <li>• DEFIS — até 28 de março</li>
            <li>• PGDAS-D — mensal até dia 20</li>
          </ul>
        </div>
      )}

      {/* Pending */}
      {pendingReminders.length === 0 && completedReminders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum lembrete cadastrado</p>
      ) : (
        <>
          {pendingReminders.map(r => (
            <div key={r.id} className="glass-card p-4 flex items-center gap-3">
              <button onClick={() => biz.toggleReminder(r.id)}>
                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{r.title}</p>
                {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  📅 {new Date(r.due_date + "T12:00:00").toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => biz.deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {completedReminders.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Concluídos</p>
              {completedReminders.map(r => (
                <div key={r.id} className="glass-card p-3 flex items-center gap-3 opacity-60">
                  <button onClick={() => biz.toggleReminder(r.id)}>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </button>
                  <span className="text-sm text-foreground line-through flex-1">{r.title}</span>
                  <Button variant="ghost" size="icon" onClick={() => biz.deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Reminder Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Lembrete Fiscal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input placeholder="Ex: Pagar DAS" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Data de vencimento *</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input placeholder="Detalhes" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <Button onClick={handleAdd} className="w-full btn-gradient py-4 rounded-xl">
              Adicionar Lembrete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FiscalAgenda;
