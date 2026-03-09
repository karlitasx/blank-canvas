import { useEffect, useState } from "react";
import { X, Share2, Sparkles } from "lucide-react";
import { Achievement, RARITY_COLORS, RARITY_LABELS } from "@/types/achievements";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AchievementUnlockModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementUnlockModal = ({ achievement, onClose }: AchievementUnlockModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Trigger confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = 
        achievement.rarity === 'legendary' 
          ? ['#FFD700', '#FFA500', '#FF6B00'] 
          : achievement.rarity === 'epic' 
            ? ['#9333EA', '#A855F7', '#C084FC'] 
            : achievement.rarity === 'rare' 
              ? ['#3B82F6', '#60A5FA', '#93C5FD'] 
              : ['#6B7280', '#9CA3AF', '#D1D5DB'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Try to play sound (with fallback)
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch {
        // Silent fallback - sound not supported
      }
    }
  }, [achievement]);

  const handleShare = () => {
    if (!achievement) return;
    
    const shareText = `🏆 Desbloqueei a conquista "${achievement.name}" no Vertice! ${achievement.emoji}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Conquista Desbloqueada!',
        text: shareText,
      }).catch(() => {
        // User cancelled or share not supported
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!achievement) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={cn(
          "relative glass-card p-8 max-w-sm w-full text-center transform transition-all duration-500",
          isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        )}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-glass hover:bg-glass-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sparkles decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
        </div>

        {/* Rarity badge */}
        <div 
          className={cn(
            "inline-block px-4 py-1 rounded-full text-xs font-bold uppercase mb-4 bg-gradient-to-r text-white",
            RARITY_COLORS[achievement.rarity]
          )}
        >
          {RARITY_LABELS[achievement.rarity]}
        </div>

        {/* Icon */}
        <div className="relative inline-block mb-4">
          <div 
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-gradient-to-br shadow-2xl animate-bounce",
              RARITY_COLORS[achievement.rarity]
            )}
            style={{ animationDuration: '2s' }}
          >
            {achievement.emoji}
          </div>
          {/* Glow effect */}
          <div 
            className={cn(
              "absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br blur-xl opacity-50",
              RARITY_COLORS[achievement.rarity]
            )}
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2 text-gradient">
          Conquista Desbloqueada!
        </h2>

        {/* Achievement name */}
        <h3 className="text-xl font-semibold mb-2">
          {achievement.name}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-4">
          {achievement.description}
        </p>

        {/* Points */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-6">
          <span className="text-2xl">🏆</span>
          <span className="text-xl font-bold text-yellow-400">+{achievement.points} pts</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-glass hover:bg-glass-hover transition-all duration-300 hover:scale-105"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
          <button
            onClick={handleClose}
            className="flex-1 btn-gradient px-4 py-3 rounded-xl"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementUnlockModal;
