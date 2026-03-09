import { useState } from "react";
import { Newspaper, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface NovidadeItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: "development" | "launched";
  isVisible: boolean;
}

const STORAGE_KEY = "admin_novidades";

const getStored = (): NovidadeItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
};

const save = (items: NovidadeItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const AdminNovidadesSection = () => {
  const [items, setItems] = useState<NovidadeItem[]>(getStored);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", emoji: "🚀", status: "development" as "development" | "launched", isVisible: true });

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", description: "", emoji: "🚀", status: "development", isVisible: true });
    setOpen(true);
  };

  const openEdit = (item: NovidadeItem) => {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description, emoji: item.emoji, status: item.status, isVisible: item.isVisible });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    let updated: NovidadeItem[];
    if (editingId) {
      updated = items.map(i => i.id === editingId ? { ...i, ...form } : i);
      toast.success("Novidade atualizada!");
    } else {
      updated = [{ id: Date.now().toString(), ...form }, ...items];
      toast.success("Novidade criada!");
    }
    setItems(updated);
    save(updated);
    setOpen(false);
  };

  const toggleVisibility = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, isVisible: !i.isVisible } : i);
    setItems(updated);
    save(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    save(updated);
    toast.success("Novidade removida!");
  };

  return (
    <>
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Gestão de Novidades</h3>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova Novidade
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Novidade" : "Criar Novidade"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Emoji</Label>
                  <Input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} className="text-center text-xl" maxLength={2} />
                </div>
                <div className="col-span-3">
                  <Label>Título *</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: "development" | "launched") => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Em desenvolvimento</SelectItem>
                      <SelectItem value="launched">Lançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.isVisible} onCheckedChange={checked => setForm({ ...form, isVisible: checked })} />
                  <Label>Visível</Label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1">{editingId ? "Salvar" : "Criar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma novidade cadastrada. Adicione itens para exibir na página de Novidades.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className={`p-3 rounded-lg border ${item.isVisible ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.title}</span>
                      <Badge variant={item.status === "launched" ? "default" : "secondary"} className="text-xs">
                        {item.status === "launched" ? "Lançado" : "Em dev"}
                      </Badge>
                      {!item.isVisible && <Badge variant="outline" className="text-xs">Oculto</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Editar">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleVisibility(item.id)} title={item.isVisible ? "Ocultar" : "Mostrar"}>
                      {item.isVisible ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)} className="text-destructive hover:text-destructive" title="Excluir">
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

export default AdminNovidadesSection;
