import { useState } from "react";
import {
  Plus, Target, Clock, Pause, CheckCircle2, LayoutGrid, Table,
  Pencil, Trash2, ArrowRight, DollarSign, MoreHorizontal, X, Check,
  ChevronRight, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinanceGoals, type GoalStatus, type FinanceGoal } from "@/hooks/useFinanceGoals";
import { toast } from "sonner";

type ViewMode = "kanban" | "table";

const columns: { key: GoalStatus; label: string; icon: React.ElementType; color: string; borderColor: string }[] = [
  { key: "planning", label: "Planejamento", icon: Target, color: "text-muted-foreground", borderColor: "border-muted-foreground/30" },
  { key: "in_progress", label: "Em Progresso", icon: Clock, color: "text-blue-500", borderColor: "border-blue-500/30" },
  { key: "paused", label: "Pausado", icon: Pause, color: "text-amber-500", borderColor: "border-amber-500/30" },
  { key: "completed", label: "Concluído", icon: CheckCircle2, color: "text-green-500", borderColor: "border-green-500/30" },
];

const emptyMessages: Record<GoalStatus, string> = {
  planning: "Arraste metas aqui ou clique no + para criar uma nova",
  in_progress: "Arraste metas em planejamento para cá quando começar",
  paused: "Metas pausadas aparecerão aqui",
  completed: "Suas conquistas aparecerão aqui! 🎉",
};

const statusTransitions: Record<GoalStatus, { next?: GoalStatus; prev?: GoalStatus }> = {
  planning: { next: "in_progress" },
  in_progress: { next: "paused", prev: "planning" },
  paused: { next: "in_progress", prev: "planning" },
  completed: { prev: "in_progress" },
};

const emojis = ["🎯", "🏠", "🚗", "✈️", "💻", "📱", "🎓", "💍", "🏋️", "📚", "🎸", "🏖️", "💰", "🏢", "🎮", "👶"];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MetasKanban = () => {
  const { goals, isLoaded, addGoal, updateGoal, deleteGoal, changeStatus, addAmount } = useFinanceGoals();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinanceGoal | null>(null);
  const [addValueGoalId, setAddValueGoalId] = useState<string | null>(null);
  const [addValueAmount, setAddValueAmount] = useState("");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEmoji, setFormEmoji] = useState("🎯");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formCurrentAmount, setFormCurrentAmount] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formTargetDate, setFormTargetDate] = useState("");

  const getGoalsByStatus = (status: GoalStatus) =>
    goals.filter((g) => g.status === status);

  const openCreateModal = (initialStatus: GoalStatus = "planning") => {
    setEditingGoal(null);
    setFormTitle("");
    setFormDescription("");
    setFormEmoji("🎯");
    setFormTargetAmount("");
    setFormCurrentAmount("");
    setFormPriority("medium");
    setFormTargetDate("");
    setIsModalOpen(true);
  };

  const openEditModal = (goal: FinanceGoal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormDescription(goal.description || "");
    setFormEmoji(goal.emoji);
    setFormTargetAmount(goal.target_amount.toString());
    setFormCurrentAmount(goal.current_amount.toString());
    setFormPriority(goal.priority);
    setFormTargetDate(goal.target_date || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formTargetAmount) {
      toast.error("Preencha o título e o valor da meta");
      return;
    }

    const data = {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      emoji: formEmoji,
      target_amount: parseFloat(formTargetAmount),
      current_amount: parseFloat(formCurrentAmount || "0"),
      status: (editingGoal?.status || "planning") as GoalStatus,
      priority: formPriority,
      target_date: formTargetDate || undefined,
    };

    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
      toast.success("Meta atualizada!");
    } else {
      await addGoal(data);
      toast.success("Meta criada!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
    toast.success("Meta excluída!");
  };

  const handleAddValue = async () => {
    if (!addValueGoalId || !addValueAmount) return;
    const amount = parseFloat(addValueAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Insira um valor válido");
      return;
    }
    await addAmount(addValueGoalId, amount);
    toast.success(`${formatCurrency(amount)} adicionado!`);
    setAddValueGoalId(null);
    setAddValueAmount("");
  };

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (parseInt(value || "0") / 100).toFixed(2);
    setter(value);
  };

  const formatDisplayAmount = (value: string) => {
    if (!value) return "R$ 0,00";
    return parseFloat(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Quadro de Metas</h2>
          <p className="text-sm text-muted-foreground">
            Organize suas metas financeiras em um kanban visual
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-muted p-1 gap-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                viewMode === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table className="w-4 h-4" />
              Tabela
            </button>
          </div>
          <Button onClick={() => openCreateModal()} className="btn-gradient gap-2 rounded-full">
            <Plus className="w-4 h-4" />
            Nova Meta
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const Icon = col.icon;
            const items = getGoalsByStatus(col.key);

            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <span className="font-semibold text-sm">{col.label}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {items.length}
                  </span>
                  {col.key === "planning" && (
                    <button
                      onClick={() => openCreateModal()}
                      className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {items.length === 0 && (
                  <div className={`border-2 border-dashed ${col.borderColor} rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[140px]`}>
                    <div className="p-3 rounded-full bg-muted mb-3">
                      <Target className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {emptyMessages[col.key]}
                    </p>
                  </div>
                )}

                {items.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onChangeStatus={changeStatus}
                    onAddValue={(id) => {
                      setAddValueGoalId(id);
                      setAddValueAmount("");
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        goals.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="p-4 rounded-full bg-muted inline-block mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Nenhuma meta cadastrada</h3>
            <p className="text-muted-foreground text-sm">Crie sua primeira meta financeira.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Meta</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Progresso</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Valor</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal) => {
                    const progress = goal.target_amount > 0
                      ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
                      : 0;
                    const colDef = columns.find((c) => c.key === goal.status)!;

                    return (
                      <tr key={goal.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{goal.emoji}</span>
                            <span className="font-medium">{goal.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-medium ${colDef.color}`}>{colDef.label}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 justify-end">
                            <Progress value={progress} className="w-20 h-2" />
                            <span className="text-xs font-medium w-10 text-right">{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openEditModal(goal)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Emoji */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="flex flex-wrap gap-1.5">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setFormEmoji(e)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                      formEmoji === e ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ex: Casa própria" maxLength={80} />
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Descreva sua meta..." maxLength={300} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valor da Meta</Label>
                <Input
                  type="text"
                  value={formatDisplayAmount(formTargetAmount)}
                  onChange={(e) => handleCurrencyInput(e, setFormTargetAmount)}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Já Guardado</Label>
                <Input
                  type="text"
                  value={formatDisplayAmount(formCurrentAmount)}
                  onChange={(e) => handleCurrencyInput(e, setFormCurrentAmount)}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <div className="flex gap-2">
                {[
                  { key: "low", label: "Baixa", color: "text-muted-foreground" },
                  { key: "medium", label: "Média", color: "text-amber-500" },
                  { key: "high", label: "Alta", color: "text-red-500" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setFormPriority(p.key)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                      formPriority === p.key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className={p.color}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data alvo (opcional)</Label>
              <Input type="date" value={formTargetDate} onChange={(e) => setFormTargetDate(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} className="flex-1 btn-gradient" disabled={!formTitle.trim() || !formTargetAmount}>
                <Check className="w-4 h-4 mr-1" />
                {editingGoal ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Value Modal */}
      <Dialog open={!!addValueGoalId} onOpenChange={() => setAddValueGoalId(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Valor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Quanto você guardou?</Label>
              <Input
                type="text"
                value={formatDisplayAmount(addValueAmount)}
                onChange={(e) => handleCurrencyInput(e, setAddValueAmount)}
                placeholder="R$ 0,00"
                className="text-xl font-bold h-14 text-center"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setAddValueGoalId(null)} className="flex-1">Cancelar</Button>
              <Button onClick={handleAddValue} className="flex-1 btn-gradient" disabled={!addValueAmount || parseFloat(addValueAmount) <= 0}>
                <DollarSign className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Goal Card ---

interface GoalCardProps {
  goal: FinanceGoal;
  onEdit: (goal: FinanceGoal) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: GoalStatus) => void;
  onAddValue: (id: string) => void;
}

const GoalCard = ({ goal, onEdit, onDelete, onChangeStatus, onAddValue }: GoalCardProps) => {
  const progress = goal.target_amount > 0
    ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
    : 0;

  const transitions = statusTransitions[goal.status];
  const colDef = columns.find((c) => c.key === goal.status)!;

  return (
    <div className="glass-card p-4 rounded-xl space-y-3 group hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{goal.emoji}</span>
          <span className="font-medium text-sm truncate">{goal.title}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onAddValue(goal.id)}>
              <DollarSign className="w-4 h-4 mr-2" /> Adicionar valor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(goal)}>
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {transitions.next && (
              <DropdownMenuItem onClick={() => onChangeStatus(goal.id, transitions.next!)}>
                <ChevronRight className="w-4 h-4 mr-2" />
                Mover para {columns.find((c) => c.key === transitions.next)?.label}
              </DropdownMenuItem>
            )}
            {transitions.prev && (
              <DropdownMenuItem onClick={() => onChangeStatus(goal.id, transitions.prev!)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar para {columns.find((c) => c.key === transitions.prev)?.label}
              </DropdownMenuItem>
            )}
            {goal.status !== "completed" && (
              <DropdownMenuItem onClick={() => onChangeStatus(goal.id, "completed")}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como concluída
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {goal.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
      )}

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              progress >= 100 ? "bg-green-500" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
          </p>
          <span className={`text-xs font-semibold ${progress >= 100 ? "text-green-500" : ""}`}>
            {progress.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Quick add value button */}
      {goal.status !== "completed" && (
        <button
          onClick={() => onAddValue(goal.id)}
          className="w-full py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Guardar valor
        </button>
      )}
    </div>
  );
};

export default MetasKanban;
