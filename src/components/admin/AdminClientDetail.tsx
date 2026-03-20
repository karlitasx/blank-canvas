import { useState, useEffect } from "react";
import {
  ArrowLeft, Stethoscope, ShoppingBag, Droplets, AlertTriangle,
  TrendingUp, Target, Sparkles, Save, Plus, Trash2, Upload, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { useAdminHairCare } from "@/hooks/useAdminHairCare";
import type {
  HairDiagnosis, HairProduct, HairWashingSteps,
  HairRestriction, HairGoal, HairYaraTips, HairEvolution, HairWeeklyCheckin,
} from "@/hooks/useHairClientData";

type AdminHookReturn = ReturnType<typeof useAdminHairCare>;

interface Props {
  userId: string;
  displayName: string;
  admin: AdminHookReturn;
  onBack: () => void;
}

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
};

const AdminClientDetail = ({ userId, displayName, admin, onBack }: Props) => {
  const [loading, setLoading] = useState(true);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Diagnosis state
  const [diagAnalysis, setDiagAnalysis] = useState("");
  const [diagHydration, setDiagHydration] = useState("");
  const [diagProteins, setDiagProteins] = useState("");
  const [diagRestrictions, setDiagRestrictions] = useState("");
  const [diagAlerts, setDiagAlerts] = useState("");

  // Products state
  const [products, setProducts] = useState<Partial<HairProduct>[]>([]);

  // Washing steps state
  const [washSteps, setWashSteps] = useState<Partial<HairWashingSteps>>({});

  // Restrictions state
  const [restData, setRestData] = useState<Partial<HairRestriction>>({});

  // Goals state
  const [goalData, setGoalData] = useState<Partial<HairGoal>>({ main_goal: "", brightness_progress: 0, elasticity_progress: 0, softness_progress: 0, overall_progress: 0 });

  // Tips state
  const [tipsData, setTipsData] = useState<Partial<HairYaraTips>>({});

  // Evolution & Checkins (read-only in this context)
  const [evolution, setEvolution] = useState<HairEvolution[]>([]);
  const [checkins, setCheckins] = useState<HairWeeklyCheckin[]>([]);

  // Evolution upload
  const [evoMonthLabel, setEvoMonthLabel] = useState("");
  const [evoNotes, setEvoNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const schedule = await admin.getActiveSchedule(userId);
      const sid = schedule?.id || null;
      setScheduleId(sid);

      const data = await admin.getClientFullData(userId, sid || undefined);

      // Populate diagnosis
      if (data.diagnosis) {
        setDiagAnalysis(data.diagnosis.analysis || "");
        setDiagHydration(data.diagnosis.hydration_level || "");
        setDiagProteins(data.diagnosis.recommended_proteins || "");
        setDiagRestrictions(data.diagnosis.restrictions || "");
        setDiagAlerts(data.diagnosis.alerts || "");
      }

      // Populate products
      setProducts(data.products.length > 0 ? data.products : []);

      // Populate washing steps
      if (data.washingSteps) setWashSteps(data.washingSteps);

      // Populate restrictions
      if (data.restrictions) setRestData(data.restrictions);

      // Populate goals
      if (data.goals) setGoalData(data.goals);

      // Populate tips
      if (data.tips) setTipsData(data.tips);

      // Evolution & Checkins
      setEvolution(data.evolution);
      setCheckins(data.checkins);
    } catch (err) {
      console.error("Error loading client data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiagnosis = async () => {
    setSaving(true);
    try {
      await admin.saveDiagnosis(userId, {
        analysis: diagAnalysis,
        hydration_level: diagHydration || null,
        recommended_proteins: diagProteins || null,
        restrictions: diagRestrictions || null,
        alerts: diagAlerts || null,
      } as any);
      toast({ title: "Diagnóstico salvo ✨" });
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSaveProducts = async () => {
    if (!scheduleId) { toast({ title: "Crie um cronograma primeiro", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await admin.saveProducts(scheduleId, products.filter(p => p.name));
      toast({ title: "Produtos salvos ✨" });
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSaveWashing = async () => {
    if (!scheduleId) { toast({ title: "Crie um cronograma primeiro", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await admin.saveWashingSteps(scheduleId, washSteps);
      toast({ title: "Passo a passo salvo ✨" });
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSaveRestrictions = async () => {
    if (!scheduleId) { toast({ title: "Crie um cronograma primeiro", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await admin.saveRestrictions(scheduleId, restData);
      toast({ title: "Restrições salvas ✨" });
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSaveGoals = async () => {
    setSaving(true);
    try {
      await admin.saveGoals(userId, goalData as any);
      toast({ title: "Metas salvas ✨" });
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSaveTips = async () => {
    setSaving(true);
    try {
      await admin.saveTips(userId, tipsData as any);
      toast({ title: "Dicas salvas ✨" });
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleUploadEvolution = async (file: File) => {
    if (!evoMonthLabel.trim()) { toast({ title: "Preencha o mês/período", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("hair-evolution").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("hair-evolution").getPublicUrl(path);
      await admin.addEvolution(userId, publicUrl, evoMonthLabel.trim(), evoNotes.trim() || undefined);
      toast({ title: "Foto adicionada ✨" });
      setEvoMonthLabel("");
      setEvoNotes("");
      await loadData();
    } catch { toast({ title: "Erro ao enviar foto", variant: "destructive" }); }
    finally { setUploading(false); }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <h3 className="font-semibold text-lg">{displayName || "Cliente"}</h3>
        {!scheduleId && <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Sem cronograma ativo</span>}
      </div>

      {/* Diagnosis */}
      <Section title="Diagnóstico" icon={Stethoscope}>
        <Textarea value={diagAnalysis} onChange={e => setDiagAnalysis(e.target.value)} placeholder="Análise personalizada do cabelo..." rows={3} className="resize-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Nível de hidratação</label>
            <Input value={diagHydration} onChange={e => setDiagHydration(e.target.value)} placeholder="Ex: baixo, médio, alto" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Proteínas recomendadas</label>
            <Input value={diagProteins} onChange={e => setDiagProteins(e.target.value)} placeholder="Ex: queratina, colágeno" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Restrições</label>
            <Input value={diagRestrictions} onChange={e => setDiagRestrictions(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Alertas</label>
            <Input value={diagAlerts} onChange={e => setDiagAlerts(e.target.value)} />
          </div>
        </div>
        <Button size="sm" onClick={handleSaveDiagnosis} disabled={saving || !diagAnalysis.trim()} className="gap-1.5">
          <Save className="w-3.5 h-3.5" /> Salvar diagnóstico
        </Button>
      </Section>

      {/* Products */}
      <Section title="Produtos Recomendados" icon={ShoppingBag}>
        {products.map((p, i) => (
          <div key={i} className="p-3 rounded-lg border border-border space-y-2">
            <div className="flex items-center gap-2">
              <Input value={p.name || ""} onChange={e => { const copy = [...products]; copy[i] = { ...copy[i], name: e.target.value }; setProducts(copy); }} placeholder="Nome do produto" className="flex-1" />
              <Button size="icon" variant="ghost" onClick={() => setProducts(products.filter((_, j) => j !== i))}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={p.brand || ""} onChange={e => { const copy = [...products]; copy[i] = { ...copy[i], brand: e.target.value }; setProducts(copy); }} placeholder="Marca" />
              <Input value={p.price_range || ""} onChange={e => { const copy = [...products]; copy[i] = { ...copy[i], price_range: e.target.value }; setProducts(copy); }} placeholder="Faixa de preço" />
            </div>
            <Input value={p.how_to_use || ""} onChange={e => { const copy = [...products]; copy[i] = { ...copy[i], how_to_use: e.target.value }; setProducts(copy); }} placeholder="Como usar" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={p.purchase_link || ""} onChange={e => { const copy = [...products]; copy[i] = { ...copy[i], purchase_link: e.target.value }; setProducts(copy); }} placeholder="Link de compra" />
              <Input value={p.substitute || ""} onChange={e => { const copy = [...products]; copy[i] = { ...copy[i], substitute: e.target.value }; setProducts(copy); }} placeholder="Substituto" />
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setProducts([...products, { name: "" }])} className="gap-1"><Plus className="w-3.5 h-3.5" /> Produto</Button>
          <Button size="sm" onClick={handleSaveProducts} disabled={saving || !scheduleId} className="gap-1.5"><Save className="w-3.5 h-3.5" /> Salvar</Button>
        </div>
      </Section>

      {/* Washing Steps */}
      <Section title="Passo a Passo da Lavagem" icon={Droplets}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Pré-poo?</label>
            <input type="checkbox" checked={!!washSteps.pre_poo} onChange={e => setWashSteps({ ...washSteps, pre_poo: e.target.checked })} />
          </div>
          {washSteps.pre_poo && (
            <Textarea value={washSteps.pre_poo_instructions || ""} onChange={e => setWashSteps({ ...washSteps, pre_poo_instructions: e.target.value })} placeholder="Instruções de pré-poo" rows={2} className="resize-none" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Shampoo</label>
              <Textarea value={washSteps.shampoo_instructions || ""} onChange={e => setWashSteps({ ...washSteps, shampoo_instructions: e.target.value })} rows={2} className="resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Frequência shampoo</label>
              <Input value={washSteps.shampoo_frequency || ""} onChange={e => setWashSteps({ ...washSteps, shampoo_frequency: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Condicionador</label>
            <Textarea value={washSteps.conditioner_instructions || ""} onChange={e => setWashSteps({ ...washSteps, conditioner_instructions: e.target.value })} rows={2} className="resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Máscara</label>
              <Textarea value={washSteps.mask_instructions || ""} onChange={e => setWashSteps({ ...washSteps, mask_instructions: e.target.value })} rows={2} className="resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tempo da máscara</label>
              <Input value={washSteps.mask_duration || ""} onChange={e => setWashSteps({ ...washSteps, mask_duration: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Leave-in</label>
            <Textarea value={washSteps.leave_in_instructions || ""} onChange={e => setWashSteps({ ...washSteps, leave_in_instructions: e.target.value })} rows={2} className="resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Finalizadores</label>
            <Textarea value={washSteps.finishing_instructions || ""} onChange={e => setWashSteps({ ...washSteps, finishing_instructions: e.target.value })} rows={2} className="resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Técnica de secagem</label>
            <Input value={washSteps.drying_technique || ""} onChange={e => setWashSteps({ ...washSteps, drying_technique: e.target.value })} />
          </div>
        </div>
        <Button size="sm" onClick={handleSaveWashing} disabled={saving || !scheduleId} className="gap-1.5 mt-2"><Save className="w-3.5 h-3.5" /> Salvar</Button>
      </Section>

      {/* Restrictions */}
      <Section title="Alertas e Restrições" icon={AlertTriangle}>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Ingredientes para evitar</label>
            <Textarea value={restData.ingredients_to_avoid || ""} onChange={e => setRestData({ ...restData, ingredients_to_avoid: e.target.value })} rows={2} className="resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Procedimentos contraindicados</label>
            <Textarea value={restData.contraindicated_procedures || ""} onChange={e => setRestData({ ...restData, contraindicated_procedures: e.target.value })} rows={2} className="resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Intervalo mínimo entre químicas</label>
            <Input value={restData.min_chemical_interval || ""} onChange={e => setRestData({ ...restData, min_chemical_interval: e.target.value })} />
          </div>
        </div>
        <Button size="sm" onClick={handleSaveRestrictions} disabled={saving || !scheduleId} className="gap-1.5 mt-2"><Save className="w-3.5 h-3.5" /> Salvar</Button>
      </Section>

      {/* Evolution */}
      <Section title="Evolução (fotos)" icon={TrendingUp}>
        {evolution.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {evolution.map(evo => (
              <div key={evo.id} className="rounded-lg overflow-hidden border border-border">
                <img src={evo.photo_url} alt={evo.month_label} className="w-full h-24 object-cover" />
                <div className="p-2">
                  <p className="text-xs font-medium">{evo.month_label}</p>
                  {evo.notes && <p className="text-xs text-muted-foreground">{evo.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={evoMonthLabel} onChange={e => setEvoMonthLabel(e.target.value)} placeholder="Período (ex: Março 2026)" />
            <Input value={evoNotes} onChange={e => setEvoNotes(e.target.value)} placeholder="Observação (opcional)" />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm cursor-pointer hover:bg-muted/30 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Enviando..." : "Enviar foto"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadEvolution(f); }} />
            </label>
          </div>
        </div>
      </Section>

      {/* Check-ins */}
      <Section title="Check-ins das clientes" icon={Sparkles}>
        {checkins.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {checkins.map(c => (
              <div key={c.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs font-medium text-primary">Semana {c.week_number}</p>
                <p className="text-sm">{c.feedback}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum check-in recebido ainda</p>
        )}
      </Section>

      {/* Goals */}
      <Section title="Metas Capilares" icon={Target}>
        <div className="space-y-3">
          <Input value={goalData.main_goal || ""} onChange={e => setGoalData({ ...goalData, main_goal: e.target.value })} placeholder="Objetivo principal" />
          <div className="grid grid-cols-2 gap-3">
            <Input value={goalData.target_length || ""} onChange={e => setGoalData({ ...goalData, target_length: e.target.value })} placeholder="Meta de comprimento" />
            <Input type="date" value={goalData.target_date || ""} onChange={e => setGoalData({ ...goalData, target_date: e.target.value })} />
          </div>
          <div className="space-y-2">
            {[
              { key: "brightness_progress", label: "Brilho" },
              { key: "elasticity_progress", label: "Elasticidade" },
              { key: "softness_progress", label: "Maciez" },
              { key: "overall_progress", label: "Progresso geral" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <span className="text-xs font-medium">{(goalData as any)[key] || 0}%</span>
                </div>
                <input type="range" min={0} max={100} value={(goalData as any)[key] || 0} onChange={e => setGoalData({ ...goalData, [key]: Number(e.target.value) })} className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary" />
              </div>
            ))}
          </div>
        </div>
        <Button size="sm" onClick={handleSaveGoals} disabled={saving || !goalData.main_goal} className="gap-1.5 mt-2"><Save className="w-3.5 h-3.5" /> Salvar</Button>
      </Section>

      {/* Tips */}
      <Section title="Dicas Exclusivas da Yara" icon={Sparkles}>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Dicas personalizadas</label>
            <Textarea value={tipsData.tips_content || ""} onChange={e => setTipsData({ ...tipsData, tips_content: e.target.value })} rows={3} className="resize-none" placeholder="Dicas de cuidados..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Recado pessoal</label>
            <Textarea value={tipsData.personal_message || ""} onChange={e => setTipsData({ ...tipsData, personal_message: e.target.value })} rows={2} className="resize-none" placeholder="Mensagem carinhosa para a cliente..." />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Dicas de alimentação</label>
            <Textarea value={tipsData.nutrition_tips || ""} onChange={e => setTipsData({ ...tipsData, nutrition_tips: e.target.value })} rows={2} className="resize-none" placeholder="Suplementação e alimentação..." />
          </div>
        </div>
        <Button size="sm" onClick={handleSaveTips} disabled={saving} className="gap-1.5 mt-2"><Save className="w-3.5 h-3.5" /> Salvar</Button>
      </Section>
    </div>
  );
};

export default AdminClientDetail;
