import { useState } from "react";
import { Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Achievement, RARITY_COLORS, RARITY_LABELS } from "@/types/achievements";
import { cn } from "@/lib/utils";

interface ShareAchievementModalProps {
  achievement: Achievement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (achievementId: string, message?: string) => Promise<boolean>;
}

export const ShareAchievementModal = ({
  achievement,
  open,
  onOpenChange,
  onShare,
}: ShareAchievementModalProps) => {
  const [message, setMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!achievement) return;

    setIsSharing(true);
    const success = await onShare(achievement.id, message);
    setIsSharing(false);

    if (success) {
      setMessage("");
      onOpenChange(false);
    }
  };

  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Conquista
          </DialogTitle>
          <DialogDescription>
            Mostre sua conquista para a comunidade!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Achievement Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br",
                RARITY_COLORS[achievement.rarity]
              )}
            >
              {achievement.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {achievement.name}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full bg-gradient-to-r text-white",
                    RARITY_COLORS[achievement.rarity]
                  )}
                >
                  {RARITY_LABELS[achievement.rarity]}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {achievement.points} pts
                </span>
              </div>
            </div>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Adicionar uma mensagem (opcional)
            </label>
            <Textarea
              placeholder="Compartilhe como você conquistou isso! 🎉"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/200
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleShare} disabled={isSharing} className="gap-2">
            <Share2 className="h-4 w-4" />
            {isSharing ? "Compartilhando..." : "Compartilhar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
