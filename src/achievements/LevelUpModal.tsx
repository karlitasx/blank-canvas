import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { 
  UserLevel, 
  LEVEL_THRESHOLDS, 
  LEVEL_EMOJIS, 
  LEVEL_COLORS 
} from "@/types/achievements";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: UserLevel;
  totalPoints: number;
}

const LevelUpModal = ({ isOpen, onClose, newLevel, totalPoints }: LevelUpModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Trigger confetti burst
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#9333EA', '#EC4899', '#F59E0B', '#10B981'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
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

      // Center burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });

      // Play level up sound
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Ascending notes
        oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // G4
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.15); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.3); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.45); // G5
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
      } catch {
        // Silent fallback
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

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
        {/* Sparkles decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
        </div>

        {/* Level emoji */}
        <div className="relative inline-block mb-4">
          <div 
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center text-6xl bg-gradient-to-br shadow-2xl",
              LEVEL_COLORS[newLevel]
            )}
            style={{ animation: 'bounce 1s ease-in-out infinite' }}
          >
            {LEVEL_EMOJIS[newLevel]}
          </div>
          {/* Glow effect */}
          <div 
            className={cn(
              "absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-br blur-xl opacity-60 -z-10",
              LEVEL_COLORS[newLevel]
            )}
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-2 text-gradient">
          Level Up! 🎉
        </h2>

        {/* New level name */}
        <div className={cn(
          "inline-block px-6 py-2 rounded-full text-lg font-bold uppercase mb-4 bg-gradient-to-r text-white",
          LEVEL_COLORS[newLevel]
        )}>
          {newLevel}
        </div>

        {/* Points */}
        <p className="text-muted-foreground mb-6">
          Você alcançou <span className="font-bold text-foreground">{totalPoints} pontos!</span>
        </p>

        {/* Continue button */}
        <button
          onClick={handleClose}
          className="w-full btn-gradient px-6 py-3 rounded-xl text-lg font-semibold"
        >
          Continuar 🚀
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
