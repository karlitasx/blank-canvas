import { PageHeader } from "@/components/ui/page-header";
import { RoutinePlanner } from "@/components/routine/RoutinePlanner";
import { CalendarDays } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";

const Routine = () => {
  const { theme } = usePreferences();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 md:pb-6 animate-fade-in">
      <PageHeader 
        title="Rotina" 
        description="Organize seu dia e acompanhe seu progresso"
        icon={<CalendarDays className="text-primary w-8 h-8" />}
      />

      <RoutinePlanner />
    </div>
  );
};

export default Routine;
