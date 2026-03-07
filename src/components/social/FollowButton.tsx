import { useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollows } from "@/hooks/useFollows";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
}

export const FollowButton = ({
  targetUserId,
  size = "default",
  variant = "default",
  className,
}: FollowButtonProps) => {
  const { isFollowing, follow, unfollow } = useFollows();
  const [loading, setLoading] = useState(false);
  
  const isCurrentlyFollowing = isFollowing(targetUserId);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (isCurrentlyFollowing) {
        await unfollow(targetUserId);
      } else {
        await follow(targetUserId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={isCurrentlyFollowing ? "outline" : variant}
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "gap-2 transition-all",
        isCurrentlyFollowing && "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isCurrentlyFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          Seguindo
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Seguir
        </>
      )}
    </Button>
  );
};
