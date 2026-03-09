import { useState } from "react";
import { Calendar, CheckCircle, Droplets, Leaf, Wrench, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { HairSchedule, HairScheduleItem, HairTreatmentLog } from "@/hooks/useHairCare";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

const TREATMENT_ICONS: Record<string, { icon: typeof Droplets; color: string; label: string }> = {
  hidratacao: { icon: Droplets, color: "text-sky-400", label: "Hidratação" },
  nutricao: { icon: Leaf, color: "text-emerald-400", label: "Nutrição" },
  reconstrucao: { icon: Wrench, color: "text-amber-400", label: "Reconstrução" },
};

const RATINGS = [
  { value: "otimo", label: "Ótimo", emoji: "🌟" },
  { value: "bom", label: "Bom", emoji: "👍" },
  { value: "nao_funcionou", label: "Não funcionou", emoji: "😕" },
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface Props {
  schedule: HairSchedule;
  treatmentLogs: HairTreatmentLog[];
  onLogTreatment: (itemId: string, rating: string, reaction?: string, note?: string) => Promise<any>;
}

const HairScheduleView = ({ schedule, treatmentLogs, onLogTreatment }: Props) => {
  const [selectedItem, setSelectedItem] = useState<HairScheduleItem | null>(null);
  const [rating, setRating] = useState("bom");
  const [reaction, setReaction] = useState("");
  const [note, setNote] = useState("");
  const [logging, setLogging] = useState(false);

  const items = schedule.items || [];
  const completedItemIds = new Set(treatmentLogs.map(l => l.schedule_item_id));

  // Group items by week
  const weeks: Record<number, HairScheduleItem[]> = {};
  items.forEach(item => {
    if (!weeks[item.week_number]) weeks[item.week_number] = [];
    weeks[item.week_number].push(item);
  });

  // Find next upcoming treatment
  const today = new Date();
  const todayDow = today.getDay();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const scheduleStart = new Date(schedule.starts_at);
  const weeksSinceStart = Math.max(0, Math.floor((today.getTime() - scheduleStart.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const currentWeek = (weeksSinceStart % schedule.duration_weeks) + 1;

  const nextTreatment = items
    .filter(i => i.week_number === currentWeek && i.day_of_week >= todayDow && !completedItemIds.has(i.id))
    .sort((a, b) => a.day_of_week - b.day_of_week)[0];

  const handleLog = async () => {
    if (!selectedItem) return;
    setLogging(true);
    try {
      await onLogTreatment(selectedItem.id, rating, reaction || undefined, note || undefined);
      toast({ title: "Tratamento registrado ✨" });
      setSelectedItem(null);
      setRating("bom");
      setReaction("");
      setNote("");
    } catch {
      toast({ title: "Erro ao registrar", variant: "destructive" });
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20">
          <Calendar className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h3 className="font-semibold">{schedule.title}</h3>
          <p className="text-xs text-muted-foreground">
            {schedule.duration_weeks} semanas • Início: {format(new Date(schedule.starts_at), "dd/MM/yyyy")}
          </p>
        </div>
      </div>

      {schedule.notes && (
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3.5 h-3.5" /> Observação da Yara
          </p>
          <p className="text-sm">{schedule.notes}</p>
        </div>
      )}

      {/* Next treatment highlight */}
      {nextTreatment && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
          <p className="text-xs font-medium text-pink-400 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Próximo tratamento
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const t = TREATMENT_ICONS[nextTreatment.treatment_type];
                const Icon = t?.icon || Droplets;
                return <Icon className={`w-5 h-5 ${t?.color || "text-muted-foreground"}`} />;
              })()}
              <div>
                <p className="font-medium text-sm">
                  {TREATMENT_ICONS[nextTreatment.treatment_type]?.label || nextTreatment.treatment_type}
                </p>
                <p className="text-xs text-muted-foreground">{DAY_NAMES[nextTreatment.day_of_week]}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setSelectedItem(nextTreatment)}>
              Registrar
            </Button>
          </div>
        </div>
      )}

      {/* Weekly calendar */}
      {Object.entries(weeks).sort(([a], [b]) => Number(a) - Number(b)).map(([weekNum, weekItems]) => (
        <div key={weekNum} className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Semana {weekNum} {Number(weekNum) === currentWeek && <span className="text-primary">(atual)</span>}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {weekItems.map((item) => {
              const isCompleted = completedItemIds.has(item.id);
              const t = TREATMENT_ICONS[item.treatment_type];
              const Icon = t?.icon || Droplets;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCompleted ? "bg-emerald-500/20" : "bg-muted"
                      }`}>
                        {isCompleted
                          ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                          : <Icon className={`w-4 h-4 ${t?.color || "text-muted-foreground"}`} />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {DAY_NAMES[item.day_of_week]} — {t?.label || item.treatment_type}
                        </p>
                        {item.product_recommendation && (
                          <p className="text-xs text-muted-foreground">📦 {item.product_recommendation}</p>
                        )}
                        {item.yara_note && (
                          <p className="text-xs text-muted-foreground italic mt-0.5">💬 {item.yara_note}</p>
                        )}
                      </div>
                    </div>
                    {!isCompleted && (
                      <Button size="sm" variant="ghost" onClick={() => setSelectedItem(item)}>
                        ✓
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Treatment log modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-background w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4 animate-slide-up">
            <h3 className="font-semibold">Registrar tratamento</h3>
            <p className="text-sm text-muted-foreground">
              {TREATMENT_ICONS[selectedItem.treatment_type]?.label || selectedItem.treatment_type} — {DAY_NAMES[selectedItem.day_of_week]}
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Como o cabelo ficou?</label>
              <div className="flex gap-2">
                {RATINGS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRating(r.value)}
                    className={`flex-1 p-3 rounded-xl border text-center text-sm transition-all ${
                      rating === r.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-lg block mb-1">{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reação do cabelo (opcional)</label>
              <Textarea
                value={reaction}
                onChange={(e) => setReaction(e.target.value)}
                placeholder="Ex: Ficou mais macio, com brilho..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observação (opcional)</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Usei produto diferente..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedItem(null)}>
                Cancelar
              </Button>
              <Button className="flex-1 btn-gradient" onClick={handleLog} disabled={logging}>
                {logging ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Treatment history */}
      {treatmentLogs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Histórico recente
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {treatmentLogs.slice(0, 10).map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    {RATINGS.find(r => r.value === log.rating)?.emoji || "👍"} {log.rating === "otimo" ? "Ótimo" : log.rating === "bom" ? "Bom" : "Não funcionou"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.treatment_date), "dd/MM")}
                  </p>
                </div>
                {log.hair_reaction && <p className="text-xs text-muted-foreground mt-1">{log.hair_reaction}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HairScheduleView;
