// Achievement Categories
export type AchievementCategory = 
  | 'habits' 
  | 'streaks' 
  | 'finance' 
  | 'selfcare' 
  | 'community' 
  | 'special';

// Achievement Rarity
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

// User Levels - Updated
export type UserLevel = 
  | 'Novata' 
  | 'Iniciante' 
  | 'Intermediária' 
  | 'Avançada' 
  | 'Expert' 
  | 'Mestre';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  requirement: AchievementRequirement;
  unlockedAt?: string;
}

export interface AchievementRequirement {
  type: 
    | 'habits_completed' 
    | 'streak_days' 
    | 'total_streak' 
    | 'habits_created'
    | 'transactions_logged'
    | 'savings_goal_reached'
    | 'budget_under'
    | 'selfcare_checkins'
    | 'gratitude_entries'
    | 'mood_streak'
    | 'community_points'
    | 'wishes_completed'
    | 'perfect_day'
    | 'weekly_goal'
    | 'monthly_goal'
    | 'first_action'
    | 'category_master';
  value: number;
  category?: string;
}

export interface UserAchievementState {
  unlockedAchievements: string[]; // Array of achievement IDs
  totalPoints: number;
  level: UserLevel;
  levelProgress: number; // 0-100 percentage to next level
  lastChecked: string;
}

// Level thresholds - Updated with new values
export const LEVEL_THRESHOLDS: Record<UserLevel, number> = {
  'Novata': 0,
  'Iniciante': 101,
  'Intermediária': 501,
  'Avançada': 1501,
  'Expert': 3001,
  'Mestre': 6001,
};

// Level emojis
export const LEVEL_EMOJIS: Record<UserLevel, string> = {
  'Novata': '⚪',
  'Iniciante': '🟢',
  'Intermediária': '🔵',
  'Avançada': '🟣',
  'Expert': '🟠',
  'Mestre': '🔴',
};

// Level colors
export const LEVEL_COLORS: Record<UserLevel, string> = {
  'Novata': 'from-gray-400 to-gray-500',
  'Iniciante': 'from-green-400 to-green-600',
  'Intermediária': 'from-blue-400 to-blue-600',
  'Avançada': 'from-purple-400 to-purple-600',
  'Expert': 'from-orange-400 to-orange-600',
  'Mestre': 'from-red-400 to-red-600',
};

// All achievements definition
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // === HABITS CATEGORY ===
  {
    id: 'first_habit',
    name: 'Primeiro Passo',
    description: 'Complete seu primeiro hábito',
    emoji: '🌱',
    category: 'habits',
    rarity: 'common',
    points: 10,
    requirement: { type: 'habits_completed', value: 1 }
  },
  {
    id: 'habit_collector',
    name: 'Colecionador',
    description: 'Crie 5 hábitos diferentes',
    emoji: '📚',
    category: 'habits',
    rarity: 'common',
    points: 20,
    requirement: { type: 'habits_created', value: 5 }
  },
  {
    id: 'habit_master',
    name: 'Mestre dos Hábitos',
    description: 'Complete 50 hábitos no total',
    emoji: '🏅',
    category: 'habits',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'habits_completed', value: 50 }
  },
  {
    id: 'habit_legend',
    name: 'Lenda dos Hábitos',
    description: 'Complete 200 hábitos no total',
    emoji: '👑',
    category: 'habits',
    rarity: 'legendary',
    points: 200,
    requirement: { type: 'habits_completed', value: 200 }
  },
  {
    id: 'perfect_day',
    name: 'Dia Perfeito',
    description: 'Complete todos os hábitos em um dia',
    emoji: '⭐',
    category: 'habits',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'perfect_day', value: 1 }
  },
  {
    id: 'perfect_week',
    name: 'Semana Perfeita',
    description: 'Complete todos os hábitos por 7 dias seguidos',
    emoji: '🌟',
    category: 'habits',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'weekly_goal', value: 7 }
  },

  // === STREAKS CATEGORY ===
  {
    id: 'streak_3',
    name: 'Aquecendo',
    description: 'Mantenha um streak de 3 dias',
    emoji: '🔥',
    category: 'streaks',
    rarity: 'common',
    points: 15,
    requirement: { type: 'streak_days', value: 3 }
  },
  {
    id: 'streak_7',
    name: 'Consistente',
    description: 'Mantenha um streak de 7 dias',
    emoji: '💪',
    category: 'streaks',
    rarity: 'rare',
    points: 35,
    requirement: { type: 'streak_days', value: 7 }
  },
  {
    id: 'streak_14',
    name: 'Determinado',
    description: 'Mantenha um streak de 14 dias',
    emoji: '🎯',
    category: 'streaks',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'streak_days', value: 14 }
  },
  {
    id: 'streak_30',
    name: 'Imparável',
    description: 'Mantenha um streak de 30 dias',
    emoji: '🚀',
    category: 'streaks',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'streak_days', value: 30 }
  },
  {
    id: 'streak_60',
    name: 'Disciplina de Ferro',
    description: 'Mantenha um streak de 60 dias',
    emoji: '⚔️',
    category: 'streaks',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'streak_days', value: 60 }
  },
  {
    id: 'streak_100',
    name: 'Centenário',
    description: 'Mantenha um streak de 100 dias',
    emoji: '💯',
    category: 'streaks',
    rarity: 'legendary',
    points: 300,
    requirement: { type: 'streak_days', value: 100 }
  },
  {
    id: 'streak_365',
    name: 'Lendário',
    description: 'Mantenha um streak de 365 dias',
    emoji: '🏆',
    category: 'streaks',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'streak_days', value: 365 }
  },

  // === FINANCE CATEGORY ===
  {
    id: 'first_transaction',
    name: 'Controlador',
    description: 'Registre sua primeira transação',
    emoji: '💰',
    category: 'finance',
    rarity: 'common',
    points: 10,
    requirement: { type: 'transactions_logged', value: 1 }
  },
  {
    id: 'finance_tracker',
    name: 'Rastreador Financeiro',
    description: 'Registre 30 transações',
    emoji: '📊',
    category: 'finance',
    rarity: 'rare',
    points: 40,
    requirement: { type: 'transactions_logged', value: 30 }
  },
  {
    id: 'finance_master',
    name: 'Mestre das Finanças',
    description: 'Registre 100 transações',
    emoji: '🏦',
    category: 'finance',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'transactions_logged', value: 100 }
  },
  {
    id: 'savings_starter',
    name: 'Poupador Iniciante',
    description: 'Alcance 25% de uma meta de economia',
    emoji: '🐷',
    category: 'finance',
    rarity: 'common',
    points: 20,
    requirement: { type: 'savings_goal_reached', value: 25 }
  },
  {
    id: 'savings_pro',
    name: 'Poupador Pro',
    description: 'Alcance 100% de uma meta de economia',
    emoji: '💎',
    category: 'finance',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'savings_goal_reached', value: 100 }
  },
  {
    id: 'budget_keeper',
    name: 'Guardião do Orçamento',
    description: 'Fique abaixo do orçamento por 30 dias',
    emoji: '🛡️',
    category: 'finance',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'budget_under', value: 30 }
  },

  // === SELF-CARE CATEGORY ===
  {
    id: 'first_checkin',
    name: 'Auto-conhecimento',
    description: 'Faça seu primeiro check-in de humor',
    emoji: '🪞',
    category: 'selfcare',
    rarity: 'common',
    points: 10,
    requirement: { type: 'selfcare_checkins', value: 1 }
  },
  {
    id: 'selfcare_week',
    name: 'Semana de Cuidado',
    description: 'Faça check-in por 7 dias seguidos',
    emoji: '🌈',
    category: 'selfcare',
    rarity: 'rare',
    points: 35,
    requirement: { type: 'mood_streak', value: 7 }
  },
  {
    id: 'selfcare_month',
    name: 'Mês de Autocuidado',
    description: 'Faça check-in por 30 dias seguidos',
    emoji: '🦋',
    category: 'selfcare',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'mood_streak', value: 30 }
  },
  {
    id: 'gratitude_starter',
    name: 'Gratidão Iniciante',
    description: 'Escreva 5 entradas de gratidão',
    emoji: '🙏',
    category: 'selfcare',
    rarity: 'common',
    points: 15,
    requirement: { type: 'gratitude_entries', value: 5 }
  },
  {
    id: 'gratitude_master',
    name: 'Mestre da Gratidão',
    description: 'Escreva 50 entradas de gratidão',
    emoji: '✨',
    category: 'selfcare',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'gratitude_entries', value: 50 }
  },

  // === COMMUNITY CATEGORY ===
  {
    id: 'community_join',
    name: 'Bem-vindo à Comunidade',
    description: 'Entre no ranking pela primeira vez',
    emoji: '👋',
    category: 'community',
    rarity: 'common',
    points: 10,
    requirement: { type: 'community_points', value: 1 }
  },
  {
    id: 'community_100',
    name: 'Participante Ativo',
    description: 'Acumule 100 pontos na comunidade',
    emoji: '🤝',
    category: 'community',
    rarity: 'common',
    points: 25,
    requirement: { type: 'community_points', value: 100 }
  },
  {
    id: 'community_500',
    name: 'Estrela da Comunidade',
    description: 'Acumule 500 pontos na comunidade',
    emoji: '⭐',
    category: 'community',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'community_points', value: 500 }
  },
  {
    id: 'community_1000',
    name: 'Líder Comunitário',
    description: 'Acumule 1000 pontos na comunidade',
    emoji: '🏆',
    category: 'community',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'community_points', value: 1000 }
  },

  // === SPECIAL CATEGORY ===
  {
    id: 'wish_granted',
    name: 'Desejo Realizado',
    description: 'Complete um item da wishlist',
    emoji: '🌠',
    category: 'special',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'wishes_completed', value: 1 }
  },
  {
    id: 'wish_master',
    name: 'Realizador de Sonhos',
    description: 'Complete 5 itens da wishlist',
    emoji: '🧞',
    category: 'special',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'wishes_completed', value: 5 }
  },
  {
    id: 'early_adopter',
    name: 'Pioneiro',
    description: 'Use o app nos primeiros 30 dias',
    emoji: '🚀',
    category: 'special',
    rarity: 'legendary',
    points: 100,
    requirement: { type: 'first_action', value: 1 }
  },
  {
    id: 'health_master',
    name: 'Mestre da Saúde',
    description: 'Complete 30 hábitos de saúde',
    emoji: '💚',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'category_master', value: 30, category: 'health' }
  },
  {
    id: 'productivity_master',
    name: 'Mestre da Produtividade',
    description: 'Complete 30 hábitos de produtividade',
    emoji: '⚡',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'category_master', value: 30, category: 'productivity' }
  },
  {
    id: 'spiritual_master',
    name: 'Mestre Espiritual',
    description: 'Complete 30 hábitos espirituais',
    emoji: '🧘',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'category_master', value: 30, category: 'spiritual' }
  },
  {
    id: 'financial_master',
    name: 'Mestre Financeiro',
    description: 'Complete 30 hábitos financeiros',
    emoji: '💰',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'category_master', value: 30, category: 'financial' }
  },
  {
    id: 'selfcare_master',
    name: 'Mestre do Autocuidado',
    description: 'Complete 30 hábitos de autocuidado',
    emoji: '🌸',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'category_master', value: 30, category: 'selfcare' }
  },
];

// Rarity colors
export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  habits: 'Hábitos',
  streaks: 'Streaks',
  finance: 'Finanças',
  selfcare: 'Autocuidado',
  community: 'Comunidade',
  special: 'Especiais',
};

export const CATEGORY_EMOJIS: Record<AchievementCategory, string> = {
  habits: '✅',
  streaks: '🔥',
  finance: '💰',
  selfcare: '🌸',
  community: '👥',
  special: '⭐',
};
