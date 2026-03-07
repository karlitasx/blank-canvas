export interface AchievementShare {
  id: string;
  user_id: string;
  achievement_id: string;
  message?: string | null;
  created_at: string;
  // Joined data
  author_name?: string;
  author_avatar?: string;
}

export interface PublicUserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}
