import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface ContentSkeletonProps {
  type: "card" | "list" | "chart" | "stats";
  count?: number;
  className?: string;
}

export const ContentSkeleton = ({
  type,
  count = 1,
  className,
}: ContentSkeletonProps) => {
  const renderCard = () => (
    <div className="glass-card p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );

  const renderListItem = () => (
    <div className="flex items-center gap-4 p-4 glass-card rounded-2xl">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );

  const renderChart = () => (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );

  const renderers = {
    card: renderCard,
    list: renderListItem,
    chart: renderChart,
    stats: renderStats,
  };

  const renderer = renderers[type];

  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderer()}</div>
      ))}
    </div>
  );
};
