import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export const CardSkeleton = ({ className }: LoadingSkeletonProps) => (
  <div className={cn("glass-card p-6 animate-pulse", className)}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl bg-muted/50" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted/50 rounded w-3/4" />
        <div className="h-3 bg-muted/50 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-muted/50 rounded" />
      <div className="h-3 bg-muted/50 rounded w-5/6" />
    </div>
  </div>
);

export const HabitSkeleton = ({ className }: LoadingSkeletonProps) => (
  <div className={cn("glass-card p-4 animate-pulse", className)}>
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-full bg-muted/50" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted/50 rounded w-1/2" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-muted/50 rounded-full" />
          <div className="h-4 w-8 bg-muted/50 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const StatSkeleton = ({ className }: LoadingSkeletonProps) => (
  <div className={cn("glass-card p-4 animate-pulse", className)}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-muted/50" />
      <div className="h-4 bg-muted/50 rounded w-20" />
    </div>
    <div className="h-8 bg-muted/50 rounded w-24 mb-2" />
    <div className="h-3 bg-muted/50 rounded w-16" />
  </div>
);

export const ChartSkeleton = ({ className }: LoadingSkeletonProps) => (
  <div className={cn("glass-card p-6 animate-pulse", className)}>
    <div className="h-5 bg-muted/50 rounded w-32 mb-4" />
    <div className="flex items-end gap-2 h-40">
      {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-muted/50 rounded-t"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  </div>
);

export const AvatarSkeleton = ({ className }: LoadingSkeletonProps) => (
  <div className={cn("w-16 h-16 rounded-full bg-muted/50 animate-pulse", className)} />
);

export const ListSkeleton = ({ count = 3, className }: LoadingSkeletonProps & { count?: number }) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <HabitSkeleton key={i} />
    ))}
  </div>
);
