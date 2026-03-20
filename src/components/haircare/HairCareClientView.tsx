import { useState } from "react";
import { 
  Scissors, User, Calendar, Stethoscope, ShoppingBag, 
  Droplets, AlertTriangle, TrendingUp, Target, Sparkles,
  ChevronDown, ChevronUp, MessageSquare
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useHairCare } from "@/hooks/useHairCare";
import { useHairClientData } from "@/hooks/useHairClientData";
import { useHairAccess } from "@/hooks/useHairAccess";
import { useSubscription } from "@/hooks/useSubscription";
import PremiumGate from "./PremiumGate";
import HairProfileForm from "./HairProfileForm";
import HairScheduleView from "./HairScheduleView";
import { format } from "date-fns";

// Collapsible Section component
const Section = ({ title, icon: Icon, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-2xl overflow-hidden animate-fade-in">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20">
            <Icon className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="font-semibold text-sm md:text-base">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 md:px-5 md:pb-5 space-y-3">{children}</div>}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-right max-w-[60%]">{value}</span>
    </div>
  );
};

const PROFILE_LABELS: Record<string, Record<string, string>> = {
  hair_type: { liso: "Liso (1)", ondulado: "Ondulado (2)", cacheado: "Cacheado (3)", crespo: "Crespo (4)" },
  porosity: { baixa: "Baixa", media: "Média", alta: "Alta" },
  chemical_state: { virgem: "Virgem", colorido: "Colorido", descolorido: "Descolorido", quimica: "Com química" },
  damage_level: { baixo: "Baixo", medio: "Médio", alto: "Alto", muito_alto: "Muito alto" },
};

const HairCareClientView = () => {
  const { isPremium, loading: subLoading } = useSubscription();
  const { hasAccess, isHairAdmin, loading: accessLoading } = useHairAccess();
  const { hairProfile, activeSchedule, treatmentLogs, loading, saveHairProfile, logTreatment } = useHairCare();
  const { diagnosis, products, washingSteps, restrictions, evolution, checkins, goals, tips, loading: clientLoading, submitCheckin } = useHairClientData(activeSchedule?.id);

  const [activeTab, setActiveTab] = useState<"schedule" | "profile">("schedule");
  const [checkinWeek, setCheckinWeek] = useState(1);
  const [checkinText, setCheckinText] = useState("");
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  if (subLoading || loading || accessLoading || clientLoading) {
    return (
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Access control: premium OR hair_client_access OR hair_admin
  if (!isPremium && !hasAccess && !isHairAdmin) {
    return <PremiumGate />;
  }

  const handleCheckin = async () => {
    if (!activeSchedule || !checkinText.trim()) return;
    setSubmittingCheckin(true);
    try {
      await submitCheckin(activeSchedule.id, checkinWeek, checkinText.trim());
      toast({ title: "Check-in enviado ✨" });
      setCheckinText("");
    } catch {
      toast({ title: "Erro ao enviar check-in", variant: "destructive" });
    } finally {
      setSubmittingCheckin(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-6 md:p-8 rounded-2xl animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20">
            <Scissors className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Cronograma Capilar da Yara</h2>
            <p className="text-xs text-muted-foreground">Seu plano personalizado de cuidados</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === "schedule"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Cronograma
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === "profile"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <User className="w-4 h-4" />
            Meu Perfil Capilar
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="glass-card p-6 md:p-8 rounded-2xl animate-fade-in">
          <HairProfileForm existingProfile={hairProfile} onSave={saveHairProfile} />
        </div>
      )}

      {/* Schedule Tab - All Sections */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          {!hairProfile ? (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Preencha seu perfil capilar primeiro para que a Yara possa criar seu cronograma.
              </p>
              <button onClick={() => setActiveTab("profile")} className="text-primary text-sm underline underline-offset-4">
                Preencher perfil capilar →
              </button>
            </div>
          ) : !activeSchedule ? (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                A Yara ainda não criou seu cronograma. Aguarde — ela vai preparar um plano especial para você! 💕
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Perfil Capilar (resumo) */}
              <Section title="Meu Perfil Capilar" icon={User} defaultOpen={false}>
                <InfoRow label="Tipo de cabelo" value={PROFILE_LABELS.hair_type[hairProfile.hair_type] || hairProfile.hair_type} />
                <InfoRow label="Textura" value={hairProfile.texture} />
                <InfoRow label="Porosidade" value={PROFILE_LABELS.porosity[(hairProfile as any).porosity] || (hairProfile as any).porosity} />
                <InfoRow label="Comprimento" value={(hairProfile as any).length} />
                <InfoRow label="Espessura" value={(hairProfile as any).thickness} />
                <InfoRow label="Estado químico" value={PROFILE_LABELS.chemical_state[(hairProfile as any).chemical_state] || (hairProfile as any).chemical_state} />
                <InfoRow label="Nível de dano" value={PROFILE_LABELS.damage_level[(hairProfile as any).damage_level] || (hairProfile as any).damage_level} />
                <InfoRow label="Couro cabeludo" value={(hairProfile as any).scalp_type} />
                <InfoRow label="Queixas" value={(hairProfile as any).complaints} />
                <InfoRow label="Frequência de lavagem" value={hairProfile.wash_frequency} />
                <InfoRow label="Objetivo" value={hairProfile.goal} />
                {hairProfile.extra_notes && <InfoRow label="Observações" value={hairProfile.extra_notes} />}
              </Section>

              {/* Section 2: Diagnóstico da Yara */}
              {diagnosis && (
                <Section title="Diagnóstico da Yara" icon={Stethoscope} defaultOpen={true}>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="text-sm whitespace-pre-wrap">{diagnosis.analysis}</p>
                  </div>
                  <InfoRow label="Nível de hidratação" value={diagnosis.hydration_level} />
                  <InfoRow label="Proteínas recomendadas" value={diagnosis.recommended_proteins} />
                  <InfoRow label="Restrições" value={diagnosis.restrictions} />
                  {diagnosis.alerts && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-200">{diagnosis.alerts}</p>
                    </div>
                  )}
                  {diagnosis.photo_url && (
                    <img src={diagnosis.photo_url} alt="Diagnóstico" className="w-full max-w-sm rounded-xl border border-border" />
                  )}
                </Section>
              )}

              {/* Section 3: Cronograma Semanal */}
              <Section title="Cronograma Semanal" icon={Calendar} defaultOpen={true}>
                <HairScheduleView
                  schedule={activeSchedule}
                  treatmentLogs={treatmentLogs}
                  onLogTreatment={logTreatment}
                />
              </Section>

              {/* Section 4: Produtos Recomendados */}
              {products.length > 0 && (
                <Section title="Produtos Recomendados" icon={ShoppingBag}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map(product => (
                      <div key={product.id} className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.brand && <p className="text-xs text-muted-foreground">🏷️ {product.brand}</p>}
                        {product.how_to_use && <p className="text-xs text-muted-foreground">📋 {product.how_to_use}</p>}
                        {product.price_range && <p className="text-xs text-muted-foreground">💰 {product.price_range}</p>}
                        {product.substitute && <p className="text-xs text-muted-foreground">🔄 Substituto: {product.substitute}</p>}
                        {product.purchase_link && (
                          <a href={product.purchase_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-2">
                            Onde comprar →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Section 5: Passo a Passo da Lavagem */}
              {washingSteps && (
                <Section title="Passo a Passo da Lavagem" icon={Droplets}>
                  <div className="space-y-3">
                    {washingSteps.pre_poo && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">1. Pré-poo ✅</p>
                        <p className="text-sm">{washingSteps.pre_poo_instructions || "Aplicar antes da lavagem"}</p>
                      </div>
                    )}
                    {washingSteps.shampoo_instructions && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">2. Shampoo</p>
                        <p className="text-sm">{washingSteps.shampoo_instructions}</p>
                        {washingSteps.shampoo_frequency && <p className="text-xs text-muted-foreground mt-1">Frequência: {washingSteps.shampoo_frequency}</p>}
                      </div>
                    )}
                    {washingSteps.conditioner_instructions && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">3. Condicionador</p>
                        <p className="text-sm">{washingSteps.conditioner_instructions}</p>
                      </div>
                    )}
                    {washingSteps.mask_instructions && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">4. Máscara</p>
                        <p className="text-sm">{washingSteps.mask_instructions}</p>
                        {washingSteps.mask_duration && <p className="text-xs text-muted-foreground mt-1">Tempo: {washingSteps.mask_duration}</p>}
                      </div>
                    )}
                    {washingSteps.leave_in_instructions && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">5. Leave-in</p>
                        <p className="text-sm">{washingSteps.leave_in_instructions}</p>
                      </div>
                    )}
                    {washingSteps.finishing_instructions && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">6. Finalizadores</p>
                        <p className="text-sm">{washingSteps.finishing_instructions}</p>
                      </div>
                    )}
                    {washingSteps.drying_technique && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs font-semibold text-primary mb-1">7. Secagem</p>
                        <p className="text-sm">{washingSteps.drying_technique}</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Section 6: Alertas e Restrições */}
              {restrictions && (
                <Section title="Alertas e Restrições" icon={AlertTriangle}>
                  {restrictions.ingredients_to_avoid && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs font-semibold text-red-400 mb-1">🚫 Ingredientes para evitar</p>
                      <p className="text-sm">{restrictions.ingredients_to_avoid}</p>
                    </div>
                  )}
                  {restrictions.contraindicated_procedures && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-semibold text-amber-400 mb-1">⚠️ Procedimentos contraindicados</p>
                      <p className="text-sm">{restrictions.contraindicated_procedures}</p>
                    </div>
                  )}
                  {restrictions.min_chemical_interval && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">⏳ Intervalo mínimo entre químicas</p>
                      <p className="text-sm">{restrictions.min_chemical_interval}</p>
                    </div>
                  )}
                </Section>
              )}

              {/* Section 7: Evolução e Acompanhamento */}
              <Section title="Evolução e Acompanhamento" icon={TrendingUp}>
                {/* Evolution photos */}
                {evolution.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {evolution.map(evo => (
                      <div key={evo.id} className="rounded-xl overflow-hidden border border-border">
                        <img src={evo.photo_url} alt={evo.month_label} className="w-full h-32 object-cover" />
                        <div className="p-2">
                          <p className="text-xs font-medium">{evo.month_label}</p>
                          {evo.notes && <p className="text-xs text-muted-foreground">{evo.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">A Yara adicionará fotos de evolução aqui 📸</p>
                )}

                {/* Weekly check-in */}
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Check-in semanal
                  </p>

                  {checkins.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {checkins.map(c => (
                        <div key={c.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex justify-between">
                            <p className="text-xs font-medium">Semana {c.week_number}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(c.created_at), "dd/MM")}</p>
                          </div>
                          <p className="text-sm mt-1">{c.feedback}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <select
                      value={checkinWeek}
                      onChange={e => setCheckinWeek(Number(e.target.value))}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm w-24"
                    >
                      {Array.from({ length: activeSchedule.duration_weeks }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Sem {i + 1}</option>
                      ))}
                    </select>
                    <Textarea
                      value={checkinText}
                      onChange={e => setCheckinText(e.target.value)}
                      placeholder="Como seu cabelo reagiu esta semana?"
                      rows={2}
                      className="resize-none flex-1"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCheckin}
                    disabled={!checkinText.trim() || submittingCheckin}
                    className="btn-gradient"
                  >
                    {submittingCheckin ? "Enviando..." : "Enviar check-in"}
                  </Button>
                </div>
              </Section>

              {/* Section 8: Metas Capilares */}
              {goals && (
                <Section title="Metas Capilares" icon={Target}>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <p className="text-sm font-medium">{goals.main_goal}</p>
                      {goals.target_length && <p className="text-xs text-muted-foreground mt-1">🎯 Meta: {goals.target_length}</p>}
                      {goals.target_date && <p className="text-xs text-muted-foreground">📅 Prazo: {format(new Date(goals.target_date), "dd/MM/yyyy")}</p>}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>✨ Brilho</span>
                          <span>{goals.brightness_progress}%</span>
                        </div>
                        <Progress value={goals.brightness_progress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>🧵 Elasticidade</span>
                          <span>{goals.elasticity_progress}%</span>
                        </div>
                        <Progress value={goals.elasticity_progress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>🤲 Maciez</span>
                          <span>{goals.softness_progress}%</span>
                        </div>
                        <Progress value={goals.softness_progress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">📊 Progresso geral</span>
                          <span className="font-medium">{goals.overall_progress}%</span>
                        </div>
                        <Progress value={goals.overall_progress} className="h-3" />
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* Section 9: Dicas Exclusivas da Yara */}
              {tips && (
                <Section title="Dicas Exclusivas da Yara" icon={Sparkles}>
                  {tips.personal_message && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <p className="text-xs font-semibold text-pink-400 mb-1">💌 Recado da Yara</p>
                      <p className="text-sm italic">{tips.personal_message}</p>
                    </div>
                  )}
                  {tips.tips_content && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs font-semibold mb-1">💡 Dicas personalizadas</p>
                      <p className="text-sm whitespace-pre-wrap">{tips.tips_content}</p>
                    </div>
                  )}
                  {tips.nutrition_tips && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-xs font-semibold mb-1">🥗 Alimentação e suplementação</p>
                      <p className="text-sm whitespace-pre-wrap">{tips.nutrition_tips}</p>
                    </div>
                  )}
                </Section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HairCareClientView;
