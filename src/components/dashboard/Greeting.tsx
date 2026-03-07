import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/contexts/PreferencesContext";

const Greeting = () => {
  const { user } = useAuth();
  const { t } = usePreferences();
  const hour = new Date().getHours();
  let greeting = t('greeting.evening');
  if (hour < 12) greeting = t('greeting.morning');
  else if (hour < 18) greeting = t('greeting.afternoon');

  const userName = user?.user_metadata?.full_name 
    || user?.email?.split('@')[0] 
    || "Usuário";

  return (
    <div className="mb-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        {greeting},{" "}
        <span className="text-gradient">{userName}</span>! 👋
      </h1>
    </div>
  );
};

export default Greeting;
