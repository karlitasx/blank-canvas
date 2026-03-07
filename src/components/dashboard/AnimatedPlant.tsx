import { cn } from "@/lib/utils";

interface AnimatedPlantProps {
  stage: number; // 0-4
  className?: string;
  isAnimating?: boolean;
}

const AnimatedPlant = ({ stage, className, isAnimating }: AnimatedPlantProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Pot */}
      <svg
        viewBox="0 0 100 120"
        className={cn(
          "w-full h-full transition-all duration-500",
          isAnimating && "animate-plant-grow"
        )}
      >
        {/* Pot base */}
        <path
          d="M25 90 L30 110 L70 110 L75 90 Z"
          className="fill-amber-700"
        />
        <path
          d="M20 85 L80 85 L80 95 L20 95 Z"
          className="fill-amber-600"
        />
        
        {/* Soil */}
        <ellipse cx="50" cy="85" rx="28" ry="8" className="fill-amber-900" />
        
        {/* Stage 0: Seed */}
        {stage === 0 && (
          <g className="animate-pulse">
            <ellipse cx="50" cy="80" rx="6" ry="4" className="fill-amber-800" />
            <ellipse cx="50" cy="79" rx="4" ry="2" className="fill-amber-700" />
          </g>
        )}
        
        {/* Stage 1: Sprout */}
        {stage >= 1 && (
          <g className={cn(isAnimating && "animate-plant-grow", "animate-plant-sway")} style={{ transformOrigin: "50px 85px" }}>
            <path
              d="M50 80 Q50 70 50 60"
              className="stroke-lime-500 fill-none"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {stage === 1 && (
              <>
                <ellipse cx="45" cy="58" rx="8" ry="5" className="fill-lime-400" transform="rotate(-30 45 58)" />
                <ellipse cx="55" cy="58" rx="8" ry="5" className="fill-lime-400" transform="rotate(30 55 58)" />
              </>
            )}
          </g>
        )}
        
        {/* Stage 2: Small Plant */}
        {stage >= 2 && (
          <g className={cn(isAnimating && "animate-plant-grow", "animate-plant-sway")} style={{ transformOrigin: "50px 85px" }}>
            <path
              d="M50 80 Q50 60 50 45"
              className="stroke-green-500 fill-none"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {stage === 2 && (
              <>
                <path d="M50 65 Q35 55 30 60 Q35 65 50 65" className="fill-green-400" />
                <path d="M50 65 Q65 55 70 60 Q65 65 50 65" className="fill-green-400" />
                <path d="M50 50 Q40 40 35 45 Q40 50 50 50" className="fill-green-500" />
                <path d="M50 50 Q60 40 65 45 Q60 50 50 50" className="fill-green-500" />
              </>
            )}
          </g>
        )}
        
        {/* Stage 3: Medium Plant */}
        {stage >= 3 && (
          <g className={cn(isAnimating && "animate-plant-grow", "animate-plant-sway")} style={{ transformOrigin: "50px 85px" }}>
            <path
              d="M50 80 Q48 60 50 30"
              className="stroke-emerald-600 fill-none"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {stage === 3 && (
              <>
                <path d="M50 70 Q30 60 25 65 Q30 70 50 70" className="fill-emerald-500" />
                <path d="M50 70 Q70 60 75 65 Q70 70 50 70" className="fill-emerald-500" />
                <path d="M50 55 Q35 45 30 50 Q35 55 50 55" className="fill-emerald-400" />
                <path d="M50 55 Q65 45 70 50 Q65 55 50 55" className="fill-emerald-400" />
                <path d="M50 40 Q40 30 35 35 Q40 40 50 40" className="fill-green-500" />
                <path d="M50 40 Q60 30 65 35 Q60 40 50 40" className="fill-green-500" />
                <ellipse cx="50" cy="28" rx="8" ry="6" className="fill-emerald-400" />
              </>
            )}
          </g>
        )}
        
        {/* Stage 4: Flowering Plant */}
        {stage >= 4 && (
          <g className={cn(isAnimating && "animate-plant-grow", "animate-plant-sway")} style={{ transformOrigin: "50px 85px" }}>
            <path
              d="M50 80 Q48 55 50 25"
              className="stroke-emerald-700 fill-none"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Leaves */}
            <path d="M50 72 Q25 62 20 68 Q25 74 50 72" className="fill-emerald-600" />
            <path d="M50 72 Q75 62 80 68 Q75 74 50 72" className="fill-emerald-600" />
            <path d="M50 58 Q30 48 25 53 Q30 58 50 58" className="fill-emerald-500" />
            <path d="M50 58 Q70 48 75 53 Q70 58 50 58" className="fill-emerald-500" />
            <path d="M50 44 Q35 34 30 39 Q35 44 50 44" className="fill-green-500" />
            <path d="M50 44 Q65 34 70 39 Q65 44 50 44" className="fill-green-500" />
            
            {/* Flowers */}
            <g className="animate-sparkle">
              <circle cx="50" cy="18" r="8" className="fill-pink-400" />
              <circle cx="50" cy="18" r="4" className="fill-yellow-300" />
              <circle cx="42" cy="12" r="4" className="fill-pink-300" />
              <circle cx="58" cy="12" r="4" className="fill-pink-300" />
              <circle cx="42" cy="24" r="4" className="fill-pink-300" />
              <circle cx="58" cy="24" r="4" className="fill-pink-300" />
            </g>
            <g className="animate-sparkle" style={{ animationDelay: "0.3s" }}>
              <circle cx="30" cy="35" r="5" className="fill-purple-400" />
              <circle cx="30" cy="35" r="2" className="fill-yellow-200" />
            </g>
            <g className="animate-sparkle" style={{ animationDelay: "0.6s" }}>
              <circle cx="70" cy="35" r="5" className="fill-purple-400" />
              <circle cx="70" cy="35" r="2" className="fill-yellow-200" />
            </g>
          </g>
        )}
        
        {/* Sparkles for animation */}
        {isAnimating && (
          <>
            <circle cx="30" cy="50" r="2" className="fill-yellow-300 animate-sparkle" />
            <circle cx="70" cy="40" r="2" className="fill-yellow-300 animate-sparkle" style={{ animationDelay: "0.2s" }} />
            <circle cx="50" cy="15" r="2" className="fill-yellow-300 animate-sparkle" style={{ animationDelay: "0.4s" }} />
          </>
        )}
      </svg>
    </div>
  );
};

export default AnimatedPlant;
