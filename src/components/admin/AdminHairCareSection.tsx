import { useState } from "react";
import { Scissors, User, Plus, Eye, Calendar, Droplets, Leaf, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useAdminHairCare } from "@/hooks/useAdminHairCare";
import type { HairScheduleItem } from "@/hooks/useHairCare";

const TREATMENT_TYPES = [
  { value: "hidratacao", label: "Hidratação", icon: Droplets, color: "text-sky-400" },
  { value: "nutricao", label: "Nutrição", icon: Leaf, color: "text-emerald-400" },
  { value: "reconstrucao", label: "Reconstrução", icon: Wrench, color: "text-amber-400" },
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const HAIR_TYPE_LABELS: Record<string, string> = {
  liso: "Liso (1)", ondulado: "Ondulado (2)", cacheado: "Cacheado (3)", crespo: "Crespo (4)",
};
const PROBLEM_LABELS: Record<string, string> = {
  ressecamento: "Ressecamento", quebra: "Quebra", frizz: "Frizz", oleosidade: "Oleosidade", queda: "Queda", quimicamente_danificado: "Dano químico",
};
const GOAL_LABELS: Record<string, string> = {
  crescimento: "Crescimento", hidratacao: "Hidratação", reconstrucao: "Reconstrução", definicao: "Definição de cachos", brilho: "Brilho e maciez", anti_queda: "Reduzir queda",
};

const AdminHairCareSection = () => {
  const { subscribers, loading, createSchedule } = useAdminHairCare();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Schedule creation state
  const [title, setTitle] = useState("Cronograma Capilar");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Omit<HairScheduleItem, "id" | "schedule_id" | "created_at">[]>([]);
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems(prev => [...prev, {
      day_of_week: 1,
      week_number: 1,
      treatment_type: "hidratacao",
      product_recommendation: null,
      yara_note: null,
      sort_order: prev.length,
    }]);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!selectedUser || items.length === 0) {
      toast({ title: "Adicione ao menos 1 tratamento", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await createSchedule(selectedUser, title, durationWeeks, startsAt, notes || null, items);
      toast({ title: "Cronograma criado com sucesso! ✨" });
      setShowCreate(false);
      setItems([]);
      setSelectedUser(null);
    } catch (err) {
      toast({ title: "Erro ao criar cronograma", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32" /></div>;
  }

  const selectedSub = subscribers.find(s => s.user_id === selectedUser);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-pink-400" />
          <h3 className="font-semibold">Cronograma Capilar</h3>
          <span className="text-xs text-muted-foreground">({subscribers.length} assinantes)</span>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma assinante ativa encontrada.</p>
      ) : (
        <div className="space-y-3">
          {subscribers.map(sub => (
            <div key={sub.user_id} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{sub.display_name || "Sem nome"}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {sub.hair_profile ? (
                        <>
                          <span>{HAIR_TYPE_LABELS[sub.hair_profile.hair_type] || sub.hair_profile.hair_type}</span>
                          <span>•</span>
                          <span>{PROBLEM_LABELS[sub.hair_profile.main_problem] || sub.hair_profile.main_problem}</span>
                          <span>•</span>
                          <span>{GOAL_LABELS[sub.hair_profile.goal] || sub.hair_profile.goal}</span>
                        </>
                      ) : (
                        <span className="text-amber-400">Perfil capilar não preenchido</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {sub.hair_profile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedUser(sub.user_id); setShowCreate(true); }}
                      className="gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {sub.has_schedule ? "Novo" : "Criar"} cronograma
                    </Button>
                  )}
                </div>
              </div>

              {/* Show hair profile details if expanded */}
              {sub.hair_profile && sub.hair_profile.extra_notes && (
                <p className="text-xs text-muted-foreground mt-2 pl-13">
                  📝 {sub.hair_profile.extra_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create schedule modal */}
      {showCreate && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-background w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 space-y-4 animate-slide-up">
            <h3 className="font-semibold text-lg">Criar cronograma para {selectedSub.display_name}</h3>

            {selectedSub.hair_profile && (
              <div className="p-3 rounded-xl bg-muted/50 text-xs space-y-1">
                <p><strong>Tipo:</strong> {HAIR_TYPE_LABELS[selectedSub.hair_profile.hair_type]}</p>
                <p><strong>Textura:</strong> {selectedSub.hair_profile.texture}</p>
                <p><strong>Problema:</strong> {PROBLEM_LABELS[selectedSub.hair_profile.main_problem]}</p>
                <p><strong>Objetivo:</strong> {GOAL_LABELS[selectedSub.hair_profile.goal]}</p>
                <p><strong>Lavagem:</strong> {selectedSub.hair_profile.wash_frequency}</p>
                {selectedSub.hair_profile.extra_notes && <p><strong>Obs:</strong> {selectedSub.hair_profile.extra_notes}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Título</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Duração (semanas)</label>
                <Input type="number" min={1} max={12} value={durationWeeks} onChange={e => setDurationWeeks(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Início</label>
                <Input type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Observações para a usuária</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Dicas, orientações gerais..." rows={2} className="resize-none" />
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tratamentos</label>
                <Button size="sm" variant="outline" onClick={addItem} className="gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </Button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Semana</label>
                      <Input
                        type="number"
                        min={1}
                        max={durationWeeks}
                        value={item.week_number}
                        onChange={e => updateItem(idx, "week_number", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Dia</label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={item.day_of_week}
                        onChange={e => updateItem(idx, "day_of_week", Number(e.target.value))}
                      >
                        {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tipo</label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={item.treatment_type}
                        onChange={e => updateItem(idx, "treatment_type", e.target.value)}
                      >
                        {TREATMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <Input
                    placeholder="Produto recomendado (opcional)"
                    value={item.product_recommendation || ""}
                    onChange={e => updateItem(idx, "product_recommendation", e.target.value || null)}
                  />
                  <Input
                    placeholder="Observação da Yara (opcional)"
                    value={item.yara_note || ""}
                    onChange={e => updateItem(idx, "yara_note", e.target.value || null)}
                  />
                  <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => removeItem(idx)}>
                    Remover
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setItems([]); }}>
                Cancelar
              </Button>
              <Button className="flex-1 btn-gradient" onClick={handleCreate} disabled={saving || items.length === 0}>
                {saving ? "Criando..." : "Criar cronograma"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHairCareSection;
