import { useState } from "react";
import { Plus, ToggleLeft, ToggleRight, Clock, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  emoji: string;
  xp_reward: number;
  unlock_condition: string;
  is_active: boolean;
  is_permanent: boolean;
  expires_at: string | null;
}

interface AdminAchievementsSectionProps {
  achievements: Achievement[];
  onCreate: (achievement: {
    achievement_key: string;
    name: string;
    description: string;
    emoji: string;
    xp_reward: number;
    unlock_condition: string;
    is_permanent: boolean;
    expires_at?: string;
  }) => Promise<boolean>;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit?: (id: string, data: {
    name: string;
    description: string;
    emoji: string;
    xp_reward: number;
    unlock_condition: string;
    is_permanent: boolean;
    expires_at?: string;
  }) => Promise<boolean>;
  onDelete?: (id: string) => void;
}

const emptyForm = {
  achievement_key: "",
  name: "",
  description: "",
  emoji: "🏆",
  xp_reward: 100,
  unlock_condition: "",
  is_permanent: true,
  expires_at: "",
};

const AdminAchievementsSection = ({
  achievements,
  onCreate,
  onToggleActive,
  onEdit,
  onDelete,
}: AdminAchievementsSectionProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (a: Achievement) => {
    setEditingId(a.id);
    setForm({
      achievement_key: a.achievement_key,
      name: a.name,
      description: a.description,
      emoji: a.emoji,
      xp_reward: a.xp_reward,
      unlock_condition: a.unlock_condition,
      is_permanent: a.is_permanent,
      expires_at: a.expires_at || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.achievement_key || !form.unlock_condition) return;

    setLoading(true);
    let success = false;
    if (editingId && onEdit) {
      success = await onEdit(editingId, {
        name: form.name,
        description: form.description,
        emoji: form.emoji,
        xp_reward: form.xp_reward,
        unlock_condition: form.unlock_condition,
        is_permanent: form.is_permanent,
        expires_at: form.is_permanent ? undefined : form.expires_at || undefined,
      });
    } else {
      success = await onCreate({
        ...form,
        expires_at: form.is_permanent ? undefined : form.expires_at || undefined,
      });
    }
    setLoading(false);

    if (success) {
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    }
  };

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Gestão de Conquistas</h3>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova Conquista
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Conquista" : "Criar Nova Conquista"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Emoji</Label>
                  <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="text-center text-xl" maxLength={2} />
                </div>
                <div className="col-span-3">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Maratonista" required />
                </div>
              </div>
              <div>
                <Label>Chave única *</Label>
                <Input value={form.achievement_key} onChange={(e) => setForm({ ...form, achievement_key: e.target.value.toLowerCase().replace(/\s/g, "_") })} placeholder="ex: marathon_runner" required disabled={!!editingId} />
              </div>
              <div>
                <Label>Descrição *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="O que o usuário precisa fazer..." rows={2} required />
              </div>
              <div>
                <Label>Condição de Desbloqueio *</Label>
                <Input value={form.unlock_condition} onChange={(e) => setForm({ ...form, unlock_condition: e.target.value })} placeholder="Ex: Complete 30 hábitos" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>XP Recompensa</Label>
                  <Input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 0 })} min={0} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.is_permanent} onCheckedChange={(checked) => setForm({ ...form, is_permanent: checked })} />
                  <Label>Permanente</Label>
                </div>
              </div>
              {!form.is_permanent && (
                <div>
                  <Label>Data de Expiração</Label>
                  <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Conquista"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {achievements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conquista customizada</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-3 rounded-lg border ${achievement.is_active ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{achievement.name}</span>
                      <Badge variant="secondary" className="text-xs">+{achievement.xp_reward} XP</Badge>
                      {!achievement.is_permanent && <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" />Temporária</Badge>}
                      {!achievement.is_active && <Badge variant="secondary" className="text-xs">Inativa</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{achievement.unlock_condition}</p>
                    {achievement.expires_at && (
                      <p className="text-xs text-muted-foreground">Expira: {format(new Date(achievement.expires_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(achievement)} title="Editar">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onToggleActive(achievement.id, !achievement.is_active)} title={achievement.is_active ? "Desativar" : "Ativar"}>
                      {achievement.is_active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                    {onDelete && (
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(achievement.id)} className="text-destructive hover:text-destructive" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conquista</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A conquista será permanentemente removida.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId && onDelete) onDelete(deleteId); setDeleteId(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminAchievementsSection;
