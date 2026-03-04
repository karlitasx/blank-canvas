export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  points: number;
  rarity: AchievementRarity;
  unlock_condition: string;
  achievement_key: string;
}

export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-secondary/20 text-secondary",
  epic: "bg-primary/20 text-primary",
  legendary: "bg-accent/20 text-accent",
};

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: "Comum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};
