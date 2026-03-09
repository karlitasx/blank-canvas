import { useState } from "react";
import { Plus, Users, ToggleLeft, ToggleRight, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  start_date: string;
  end_date: string;
  target_value: number;
  is_public: boolean;
  participants_count?: number;
}

interface AdminChallengesSectionProps {
  challenges: Challenge[];
  onCreate: (challenge: {
    title: string;
    description?: string;
    emoji: string;
    start_date: string;
    end_date: string;
    target_value: number;
    is_public: boolean;
  }) => Promise<boolean>;
  onToggleVisibility: (id: string, isPublic: boolean) => void;
  onEdit?: (id: string, data: {
    title: string;
    description?: string;
    emoji: string;
    start_date: string;
    end_date: string;
    target_value: number;
    is_public: boolean;
  }) => Promise<boolean>;
  onDelete?: (id: string) => void;
}

const emptyForm = {
  title: "",
  description: "",
  emoji: "🏆",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  target_value: 7,
  is_public: true,
};

const AdminChallengesSection = ({
  challenges,
  onCreate,
  onToggleVisibility,
  onEdit,
  onDelete,
}: AdminChallengesSectionProps) => {
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

  const openEdit = (challenge: Challenge) => {
    setEditingId(challenge.id);
    setForm({
      title: challenge.title,
      description: challenge.description || "",
      emoji: challenge.emoji,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      target_value: challenge.target_value,
      is_public: challenge.is_public,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.end_date) return;

    setLoading(true);
    const payload = { ...form, description: form.description || undefined };

    let success = false;
    if (editingId && onEdit) {
      success = await onEdit(editingId, payload);
    } else {
      success = await onCreate(payload);
    }
    setLoading(false);

    if (success) {
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Gestão de Desafios</h3>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo Desafio
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Desafio" : "Criar Novo Desafio"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Emoji</Label>
                  <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="text-center text-xl" maxLength={2} />
                </div>
                <div className="col-span-3">
                  <Label>Nome *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: 7 dias de exercício" required />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalhes do desafio..." rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data Início *</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
                </div>
                <div>
                  <Label>Data Fim *</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Meta (dias/ações)</Label>
                  <Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: parseInt(e.target.value) || 1 })} min={1} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.is_public} onCheckedChange={(checked) => setForm({ ...form, is_public: checked })} />
                  <Label>Público</Label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Desafio"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {challenges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum desafio criado</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-3 rounded-lg border ${
                  isExpired(challenge.end_date) ? "bg-muted/30 border-muted" : challenge.is_public ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{challenge.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{challenge.title}</span>
                      {isExpired(challenge.end_date) && <Badge variant="secondary" className="text-xs">Expirado</Badge>}
                      {!challenge.is_public && <Badge variant="outline" className="text-xs">Oculto</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{format(new Date(challenge.start_date), "dd/MM", { locale: ptBR })} - {format(new Date(challenge.end_date), "dd/MM", { locale: ptBR })}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{challenge.participants_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(challenge)} title="Editar">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onToggleVisibility(challenge.id, !challenge.is_public)} title={challenge.is_public ? "Desativar" : "Ativar"}>
                      {challenge.is_public ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                    {onDelete && (
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(challenge.id)} className="text-destructive hover:text-destructive" title="Excluir">
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
            <AlertDialogTitle>Excluir Desafio</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O desafio será permanentemente removido.</AlertDialogDescription>
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

export default AdminChallengesSection;
