import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "gradient" | "glass";
  gradientColors?: string;
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  variant = "glass",
  gradientColors = "from-primary to-secondary",
  className,
}: StatCardProps) => {
  const baseClasses = "relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-105";
  
  const variantClasses = {
    default: "bg-card text-card-foreground border border-border",
    gradient: `bg-gradient-to-br ${gradientColors} text-white shadow-lg`,
    glass: "glass-card",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {/* Background decoration for gradient variant */}
      {variant === "gradient" && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}
      
      <div className="relative z-10 flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            variant === "gradient" ? "bg-white/20" : "bg-primary/20"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5",
              variant === "gradient" ? "text-white" : "text-primary"
            )}
          />
        </div>
        
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-2xl font-bold truncate",
              variant === "gradient" ? "text-white" : "text-foreground"
            )}
          >
            {value}
          </p>
          <p
            className={cn(
              "text-xs truncate",
              variant === "gradient" ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {label}
          </p>
          {subValue && (
            <p
              className={cn(
                "text-xs mt-0.5",
                variant === "gradient" ? "text-white/60" : "text-primary"
              )}
            >
              {subValue}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                variant === "gradient" ? "text-white/80" : "text-muted-foreground"
              )}
            >
              <span className={trend.value >= 0 ? "text-green-400" : "text-red-400"}>
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span>{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
