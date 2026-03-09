import { useState } from "react";
import { Users, Pencil, Lock, Unlock, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminGroup {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  isOpen: boolean;
}

const STORAGE_KEY = "admin_groups_config";

const getStoredGroups = (): AdminGroup[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: "1", name: "Educação Financeira", description: "Aprenda a organizar suas finanças, investir com segurança e construir uma vida financeira equilibrada.", emoji: "💰", category: "Finanças", isOpen: false },
    { id: "2", name: "Clube do Livro", description: "Compartilhe suas leituras favoritas, discuta livros sobre finanças, desenvolvimento pessoal e histórias inspiradoras.", emoji: "📚", category: "Cultura", isOpen: false },
    { id: "3", name: "Divulgue Seu Trabalho", description: "Seu espaço para brilhar! Compartilhe seus projetos, serviços e empreendimentos.", emoji: "💼", category: "Networking", isOpen: false },
    { id: "4", name: "Grupo das Empreendedoras", description: "Aprenda estratégias para alavancar seu negócio e faça conexões.", emoji: "🚀", category: "Empreendedorismo", isOpen: false },
    { id: "5", name: "Autocuidado & Bem-estar", description: "Troque experiências sobre saúde mental, rotinas de autocuidado e hábitos saudáveis.", emoji: "🧘‍♀️", category: "Saúde", isOpen: false },
    { id: "6", name: "Metas & Produtividade", description: "Defina metas, compartilhe conquistas e mantenha-se motivada.", emoji: "🎯", category: "Produtividade", isOpen: false },
  ];
};

const saveGroups = (groups: AdminGroup[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

const AdminGroupsSection = () => {
  const [groups, setGroups] = useState<AdminGroup[]>(getStoredGroups);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", emoji: "🎯", category: "", isOpen: false });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", emoji: "🎯", category: "", isOpen: false });
    setOpen(true);
  };

  const openEdit = (g: AdminGroup) => {
    setEditingId(g.id);
    setForm({ name: g.name, description: g.description, emoji: g.emoji, category: g.category, isOpen: g.isOpen });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) return;

    let updated: AdminGroup[];
    if (editingId) {
      updated = groups.map(g => g.id === editingId ? { ...g, ...form } : g);
      toast.success("Grupo atualizado!");
    } else {
      const newGroup: AdminGroup = { id: Date.now().toString(), ...form };
      updated = [...groups, newGroup];
      toast.success("Grupo criado!");
    }
    setGroups(updated);
    saveGroups(updated);
    setOpen(false);
  };

  const toggleOpen = (id: string) => {
    const updated = groups.map(g => g.id === id ? { ...g, isOpen: !g.isOpen } : g);
    setGroups(updated);
    saveGroups(updated);
    const group = updated.find(g => g.id === id);
    toast.success(group?.isOpen ? "Grupo aberto!" : "Grupo fechado!");
  };

  const deleteGroup = (id: string) => {
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated);
    saveGroups(updated);
    toast.success("Grupo removido!");
  };

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Gestão de Grupos</h3>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo Grupo
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Grupo" : "Criar Novo Grupo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Emoji</Label>
                  <Input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} className="text-center text-xl" maxLength={2} />
                </div>
                <div className="col-span-3">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Categoria *</Label>
                <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ex: Finanças, Saúde..." required />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isOpen} onCheckedChange={checked => setForm({ ...form, isOpen: checked })} />
                <Label>Grupo aberto (acessível para membros)</Label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1">{editingId ? "Salvar" : "Criar Grupo"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum grupo</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {groups.map(group => (
              <div key={group.id} className={`p-3 rounded-lg border ${group.isOpen ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{group.name}</span>
                      <Badge variant="secondary" className="text-xs">{group.category}</Badge>
                      {group.isOpen ? (
                        <Badge className="text-xs bg-green-500/20 text-green-600 border-0">Aberto</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Fechado</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(group)} title="Editar">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleOpen(group.id)} title={group.isOpen ? "Fechar" : "Abrir"}>
                      {group.isOpen ? <Unlock className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteGroup(group.id)} className="text-destructive hover:text-destructive" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

export default AdminGroupsSection;
