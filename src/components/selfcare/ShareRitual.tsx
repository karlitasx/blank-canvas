import { useState } from "react";
import { cn } from "@/lib/utils";
import { Share2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Props {
  ritualCompleted: boolean;
}

const ShareRitual = ({ ritualCompleted }: Props) => {
  const { user } = useAuth();
  const [shared, setShared] = useState(false);
  const [shareType, setShareType] = useState<"ritual" | "reflection">("ritual");

  if (!ritualCompleted || shared) {
    if (shared) {
      return (
        <div className="text-center py-4 animate-fade-in">
          <p className="text-sm text-primary flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Compartilhado com a comunidade
          </p>
        </div>
      );
    }
    return null;
  }

  const handleShare = async () => {
    if (!user) return;

    const content = shareType === "ritual"
      ? "Concluí meu ritual de autocuidado hoje ✨"
      : "Dediquei um momento para minha reflexão diária 🌿";

    try {
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content,
        emoji: "🧘",
      });

      if (error) throw error;
      setShared(true);
      toast({ title: "Compartilhado! 🌟", description: "Sua evolução inspira outros." });
    } catch {
      toast({ title: "Erro ao compartilhar", variant: "destructive" });
    }
  };

  return (
    <div className="animate-fade-in text-center py-4">
      <p className="text-sm text-muted-foreground mb-3">
        Deseja compartilhar sua evolução na comunidade?
      </p>
      <div className="flex gap-2 justify-center mb-3">
        <button
          onClick={() => setShareType("ritual")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs transition-all",
            shareType === "ritual" ? "bg-primary/15 border border-primary/30 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          Ritual concluído ✨
        </button>
        <button
          onClick={() => setShareType("reflection")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs transition-all",
            shareType === "reflection" ? "bg-primary/15 border border-primary/30 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          Reflexão diária 🌿
        </button>
      </div>
      <button
        onClick={handleShare}
        className="btn-accent px-5 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </button>
    </div>
  );
};

export default ShareRitual;
