import { useState } from "react";
import { Scissors, User, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { useHairCare } from "@/hooks/useHairCare";
import PremiumGate from "./PremiumGate";
import HairProfileForm from "./HairProfileForm";
import HairScheduleView from "./HairScheduleView";

const HairCareModule = () => {
  const { isPremium, loading: subLoading } = useSubscription();
  const {
    hairProfile,
    activeSchedule,
    treatmentLogs,
    loading,
    saveHairProfile,
    logTreatment,
  } = useHairCare();

  const [activeTab, setActiveTab] = useState<"schedule" | "profile">("schedule");

  if (subLoading || loading) {
    return (
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isPremium) {
    return <PremiumGate />;
  }

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl animate-slide-up space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
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

      {/* Content */}
      {activeTab === "profile" && (
        <HairProfileForm existingProfile={hairProfile} onSave={saveHairProfile} />
      )}

      {activeTab === "schedule" && (
        <>
          {!hairProfile ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground text-sm">
                Preencha seu perfil capilar primeiro para que a Yara possa criar seu cronograma.
              </p>
              <button
                onClick={() => setActiveTab("profile")}
                className="text-primary text-sm underline underline-offset-4"
              >
                Preencher perfil capilar →
              </button>
            </div>
          ) : !activeSchedule ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                A Yara ainda não criou seu cronograma. Aguarde — ela vai preparar um plano especial para você! 💕
              </p>
            </div>
          ) : (
            <HairScheduleView
              schedule={activeSchedule}
              treatmentLogs={treatmentLogs}
              onLogTreatment={logTreatment}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HairCareModule;
