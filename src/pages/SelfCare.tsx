import { useState, useEffect } from "react";
import { Heart, Sparkles, Brain, Palette, Activity, CheckCircle, Leaf, Scissors } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { useSelfCare } from "@/hooks/useSelfCare";
import { usePoints } from "@/hooks/usePoints";
import { useAdmin } from "@/hooks/useAdmin";
import EmotionalCheckIn from "@/components/selfcare/EmotionalCheckIn";
import MicroRitual from "@/components/selfcare/MicroRitual";
import PillarBalance from "@/components/selfcare/PillarBalance";
import ShareRitual from "@/components/selfcare/ShareRitual";
import WeeklyEvolution from "@/components/selfcare/WeeklyEvolution";
import GymRatsChallenges from "@/components/selfcare/GymRatsChallenges";
import HairCareModule from "@/components/haircare/HairCareModule";
import AdminHairCareSection from "@/components/admin/AdminHairCareSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Self-care tips array
const selfCareTips = [
  "Faça uma pausa de 5 minutos para respirar profundamente",
  "Beba um copo de água agora mesmo",
  "Estique seu corpo por 2 minutos",
  "Escreva 3 coisas pelas quais você é grato(a)",
  "Ouça sua música favorita",
  "Faça uma caminhada de 10 minutos",
  "Desconecte-se das redes sociais por 1 hora",
  "Prepare um lanche saudável",
  "Ligue para alguém que você ama",
  "Organize um espaço pequeno do seu ambiente",
  "Pratique 5 minutos de meditação",
  "Tome um banho relaxante",
  "Leia algumas páginas de um livro",
  "Faça algo criativo: desenhe, pinte ou escreva",
  "Agradeça a si mesmo(a) por algo que fez hoje",
  "Durma 30 minutos mais cedo hoje",
  "Coma uma fruta ou vegetal",
  "Assista a um vídeo engraçado",
  "Faça uma lista de suas conquistas recentes",
  "Pratique o perdão - deixe ir algo que te incomoda",
  "Dance por 5 minutos",
  "Tome um chá ou café em paz",
  "Escreva uma carta para você do futuro",
  "Faça algo gentil por alguém",
];

// Categories
const categories = [
  { id: "body", name: "Corpo", icon: Activity, color: "from-green-400 to-emerald-500", activities: ["Exercício", "Alongamento", "Caminhada", "Yoga"] },
  { id: "mind", name: "Mente", icon: Brain, color: "from-blue-400 to-indigo-500", activities: ["Meditação", "Leitura", "Aprendizado", "Jogos mentais"] },
  { id: "emotional", name: "Emocional", icon: Heart, color: "from-pink-400 to-rose-500", activities: ["Conversar", "Diário", "Terapia", "Música"] },
  { id: "creative", name: "Criativo", icon: Palette, color: "from-purple-400 to-violet-500", activities: ["Desenhar", "Escrever", "Cozinhar", "Artesanato"] },
];

const SelfCare = () => {
  const [currentTip, setCurrentTip] = useState("");
  const [tipCompleted, setTipCompleted] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("autocuidado");
  

  // New immersive state
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [gratitudes, setGratitudes] = useState(["", "", ""]);
  const [checkInSaved, setCheckInSaved] = useState(false);

  const {
    todayCheckIn,
    weeklyCheckIns,
    todayPillarActions,
    weeklyPillarActions,
    loading,
    saveCheckIn,
    completeRitual,
    addPillarAction,
    refetch,
  } = useSelfCare();

  const { awardPoints } = usePoints();

  // Load existing data
  useEffect(() => {
    if (todayCheckIn) {
      setSelectedEmotion(todayCheckIn.emotional_state);
      setNote(todayCheckIn.note || "");
      setEnergyLevel(todayCheckIn.energy_level);
      setGratitudes(
        todayCheckIn.gratitudes.length >= 3
          ? todayCheckIn.gratitudes
          : [...todayCheckIn.gratitudes, ...Array(3 - todayCheckIn.gratitudes.length).fill("")]
      );
      setCheckInSaved(true);
    }
  }, [todayCheckIn]);

  // Random tip on mount
  useEffect(() => {
    setCurrentTip(selfCareTips[Math.floor(Math.random() * selfCareTips.length)]);
  }, []);

  const handleSaveCheckIn = async () => {
    if (!selectedEmotion) {
      toast({ title: "Selecione como você está", description: "Escolha um estado emocional", variant: "destructive" });
      return;
    }

    try {
      await saveCheckIn({
        emotional_state: selectedEmotion,
        note,
        energy_level: energyLevel,
        gratitudes,
      });

      setCheckInSaved(true);

      // Award points for check-in
      const today = new Date().toISOString().split("T")[0];
      await awardPoints("selfcare_checkin" as any, `checkin-${today}`);

      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, colors: ["#7f1d1d", "#1e3a8a", "#f59e0b"] });
      toast({ title: "Check-in salvo ✨", description: "Seu momento de reconexão foi registrado" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleCompleteRitual = async (type: string) => {
    try {
      await completeRitual(type);
      const today = new Date().toISOString().split("T")[0];
      await awardPoints("selfcare_ritual" as any, `ritual-${today}`);
      toast({ title: "Ritual concluído 🌿", description: "+5 pontos por cuidar de você" });
      refetch();
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleAddPillarAction = async (pillar: "mind" | "body" | "energy", text: string) => {
    try {
      await addPillarAction(pillar, text);
      await awardPoints("selfcare_pillar" as any, `pillar-${pillar}-${text}-${new Date().toISOString().split("T")[0]}`);
      toast({ title: "Ação registrada ✓" });
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleCompleteTip = () => {
    setTipCompleted(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ["#a855f7", "#ec4899", "#3b82f6"] });
    toast({ title: "Parabéns! 🎉", description: "+10 pontos por cuidar de você!" });
  };

  const handleNewTip = () => {
    setCurrentTip(selfCareTips[Math.floor(Math.random() * selfCareTips.length)]);
    setTipCompleted(false);
  };




  return (
    <DashboardLayout activeNav="/selfcare">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl logo-gradient">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Autocuidado</h1>
              <p className="text-sm text-muted-foreground">Seu ritual diário de reconexão</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Emotional Check-In */}
        <div className="glass-card p-6 md:p-8 mb-6 animate-slide-up rounded-2xl">
          <EmotionalCheckIn
            selectedEmotion={selectedEmotion}
            onSelectEmotion={setSelectedEmotion}
            note={note}
            onNoteChange={setNote}
            energyLevel={energyLevel}
            onEnergyChange={setEnergyLevel}
            gratitudes={gratitudes}
            onGratitudesChange={setGratitudes}
            onSave={handleSaveCheckIn}
            alreadySaved={checkInSaved}
          />
        </div>

        {/* SECTION 2: Micro-Ritual (only after check-in) */}
        {checkInSaved && selectedEmotion && (
          <div className="glass-card p-6 md:p-8 mb-6 animate-slide-up animation-delay-100 rounded-2xl">
            <MicroRitual
              emotionalState={selectedEmotion}
              ritualCompleted={todayCheckIn?.ritual_completed || false}
              onCompleteRitual={handleCompleteRitual}
            />
            <ShareRitual ritualCompleted={todayCheckIn?.ritual_completed || false} />
          </div>
        )}

        {/* SECTION 3: Pillar Balance */}
        {checkInSaved && (
          <div className="glass-card p-6 md:p-8 mb-6 animate-slide-up animation-delay-200 rounded-2xl">
            <PillarBalance
              todayActions={todayPillarActions}
              weeklyActions={weeklyPillarActions}
              onAddAction={handleAddPillarAction}
            />
          </div>
        )}

        {/* SECTION 4: Weekly Evolution */}
        <div className="glass-card p-6 mb-6 animate-slide-up animation-delay-200 rounded-2xl">
          <WeeklyEvolution weeklyCheckIns={weeklyCheckIns} />
        </div>

        {/* Daily Tip (kept) */}
        <div className="glass-card p-6 mb-6 animate-slide-up rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-warning" />
            <h3 className="font-medium text-sm">Dica do Dia</h3>
          </div>
          <p className="text-sm mb-4 text-foreground/80">{currentTip}</p>
          <div className="flex gap-3">
            {!tipCompleted ? (
              <button onClick={handleCompleteTip} className="btn-gradient px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:scale-105 transition-transform">
                <CheckCircle className="w-4 h-4" />
                Feito
              </button>
            ) : (
              <span className="text-sm text-primary flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Concluído!</span>
            )}
            <button onClick={handleNewTip} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-all">Nova dica</button>
          </div>
        </div>

        {/* Categories (kept) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="glass-card p-4 animate-slide-up hover:scale-[1.02] transition-transform rounded-2xl" style={{ animationDelay: `${(i + 3) * 100}ms` }}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-sm mb-1">{cat.name}</h4>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {cat.activities.map(a => <li key={a}>• {a}</li>)}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Hair Care Module */}
        <HairCareModule />

        {/* GymRats-style Challenges */}
        <GymRatsChallenges className="mb-6 animate-slide-up" />
      </div>
    </DashboardLayout>
  );
};

export default SelfCare;
