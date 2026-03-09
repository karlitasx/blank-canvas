export interface Challenge {
  id: string;
  title: string;
  description?: string | null;
  emoji: string;
  challenge_type: ChallengeType;
  target_value: number;
  start_date: string;
  end_date: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  difficulty: ChallengeDifficulty;
  points_per_checkin: number;
  // Computed fields
  participants_count?: number;
  is_joined?: boolean;
  my_progress?: number;
}

export type ChallengeType = 'habits' | 'savings' | 'streak' | 'custom';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  current_progress: number;
  joined_at: string;
  completed_at?: string | null;
  // Joined from profiles
  display_name?: string;
  avatar_url?: string;
}

export interface CreateChallengeInput {
  title: string;
  description?: string;
  emoji?: string;
  challenge_type: ChallengeType;
  target_value: number;
  start_date: string;
  end_date: string;
  is_public?: boolean;
  difficulty: ChallengeDifficulty;
  points_per_checkin: number;
}

export const CHALLENGE_TYPES: { value: ChallengeType; label: string; emoji: string; unit: string }[] = [
  { value: 'habits', label: 'Hábitos Completados', emoji: '✅', unit: 'hábitos' },
  { value: 'savings', label: 'Economia', emoji: '💰', unit: 'R$' },
  { value: 'streak', label: 'Dias de Streak', emoji: '🔥', unit: 'dias' },
  { value: 'custom', label: 'Personalizado', emoji: '🎯', unit: 'pontos' },
];

export const DIFFICULTY_LEVELS: { value: ChallengeDifficulty; label: string; points: number; color: string; icon: string }[] = [
  { value: 'easy', label: 'Fácil', points: 5, color: 'text-emerald-500', icon: '🌱' },
  { value: 'medium', label: 'Médio', points: 10, color: 'text-amber-500', icon: '⚡' },
  { value: 'hard', label: 'Difícil', points: 20, color: 'text-orange-500', icon: '🔥' },
  { value: 'extreme', label: 'Extremo', points: 35, color: 'text-red-500', icon: '💀' },
];

export const CHALLENGE_EMOJIS = ['🏆', '🎯', '💪', '🔥', '⭐', '🚀', '💎', '🌟', '🏅', '🎖️'];
