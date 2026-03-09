// Achievement Categories
export type AchievementCategory = 
  | 'habits' 
  | 'streaks' 
  | 'finance' 
  | 'selfcare' 
  | 'community' 
  | 'routine'
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
    | 'category_master'
    | 'routine_completed'
    | 'events_created'
    | 'challenges_joined'
    | 'posts_created'
    | 'likes_given'
    | 'comments_made'
    | 'followers_gained'
    | 'goals_created'
    | 'goals_completed'
    | 'cards_created'
    | 'categories_created'
    | 'investments_made';
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
  // ═══════════════════════════════════════
  // === HÁBITOS (habits) ===
  // ═══════════════════════════════════════
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
    name: 'Colecionadora',
    description: 'Crie 5 hábitos diferentes',
    emoji: '📚',
    category: 'habits',
    rarity: 'common',
    points: 20,
    requirement: { type: 'habits_created', value: 5 }
  },
  {
    id: 'habit_10',
    name: 'Dedicada',
    description: 'Complete 10 hábitos no total',
    emoji: '🎯',
    category: 'habits',
    rarity: 'common',
    points: 25,
    requirement: { type: 'habits_completed', value: 10 }
  },
  {
    id: 'habit_25',
    name: 'Focada',
    description: 'Complete 25 hábitos no total',
    emoji: '🔥',
    category: 'habits',
    rarity: 'common',
    points: 35,
    requirement: { type: 'habits_completed', value: 25 }
  },
  {
    id: 'habit_master',
    name: 'Mestre dos Hábitos',
    description: 'Complete 50 hábitos no total',
    emoji: '🏅',
    category: 'habits',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'habits_completed', value: 50 }
  },
  {
    id: 'habit_100',
    name: 'Centurião dos Hábitos',
    description: 'Complete 100 hábitos no total',
    emoji: '💯',
    category: 'habits',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'habits_completed', value: 100 }
  },
  {
    id: 'habit_legend',
    name: 'Lenda dos Hábitos',
    description: 'Complete 200 hábitos no total',
    emoji: '👑',
    category: 'habits',
    rarity: 'legendary',
    points: 300,
    requirement: { type: 'habits_completed', value: 200 }
  },
  {
    id: 'habit_500',
    name: 'Implacável',
    description: 'Complete 500 hábitos no total',
    emoji: '🦁',
    category: 'habits',
    rarity: 'legendary',
    points: 500,
    requirement: { type: 'habits_completed', value: 500 }
  },
  {
    id: 'habit_architect',
    name: 'Arquiteta de Hábitos',
    description: 'Crie 10 hábitos diferentes',
    emoji: '🏗️',
    category: 'habits',
    rarity: 'rare',
    points: 40,
    requirement: { type: 'habits_created', value: 10 }
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
    id: 'perfect_day_5',
    name: 'Dias Dourados',
    description: 'Tenha 5 dias perfeitos',
    emoji: '🌟',
    category: 'habits',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'perfect_day', value: 5 }
  },
  {
    id: 'perfect_day_20',
    name: 'Perfeição Habitual',
    description: 'Tenha 20 dias perfeitos',
    emoji: '✨',
    category: 'habits',
    rarity: 'legendary',
    points: 250,
    requirement: { type: 'perfect_day', value: 20 }
  },
  {
    id: 'perfect_week',
    name: 'Semana Perfeita',
    description: 'Complete todos os hábitos por 7 dias seguidos',
    emoji: '🌈',
    category: 'habits',
    rarity: 'epic',
    points: 120,
    requirement: { type: 'weekly_goal', value: 7 }
  },

  // ═══════════════════════════════════════
  // === STREAKS ===
  // ═══════════════════════════════════════
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
    id: 'streak_5',
    name: 'Em Ritmo',
    description: 'Mantenha um streak de 5 dias',
    emoji: '💫',
    category: 'streaks',
    rarity: 'common',
    points: 25,
    requirement: { type: 'streak_days', value: 5 }
  },
  {
    id: 'streak_7',
    name: 'Consistente',
    description: 'Mantenha um streak de 7 dias',
    emoji: '💪',
    category: 'streaks',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'streak_days', value: 7 }
  },
  {
    id: 'streak_14',
    name: 'Determinada',
    description: 'Mantenha um streak de 14 dias',
    emoji: '🎯',
    category: 'streaks',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'streak_days', value: 14 }
  },
  {
    id: 'streak_21',
    name: 'Novo Hábito Formado',
    description: 'Mantenha um streak de 21 dias — dizem que é o tempo para criar um hábito!',
    emoji: '🧠',
    category: 'streaks',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'streak_days', value: 21 }
  },
  {
    id: 'streak_30',
    name: 'Imparável',
    description: 'Mantenha um streak de 30 dias',
    emoji: '🚀',
    category: 'streaks',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'streak_days', value: 30 }
  },
  {
    id: 'streak_60',
    name: 'Disciplina de Ferro',
    description: 'Mantenha um streak de 60 dias',
    emoji: '⚔️',
    category: 'streaks',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'streak_days', value: 60 }
  },
  {
    id: 'streak_90',
    name: 'Trimestre Perfeito',
    description: 'Mantenha um streak de 90 dias',
    emoji: '🏋️',
    category: 'streaks',
    rarity: 'legendary',
    points: 300,
    requirement: { type: 'streak_days', value: 90 }
  },
  {
    id: 'streak_100',
    name: 'Centenária',
    description: 'Mantenha um streak de 100 dias',
    emoji: '💯',
    category: 'streaks',
    rarity: 'legendary',
    points: 400,
    requirement: { type: 'streak_days', value: 100 }
  },
  {
    id: 'streak_180',
    name: 'Meio Ano de Fogo',
    description: 'Mantenha um streak de 180 dias',
    emoji: '☀️',
    category: 'streaks',
    rarity: 'legendary',
    points: 600,
    requirement: { type: 'streak_days', value: 180 }
  },
  {
    id: 'streak_365',
    name: 'Lendária',
    description: 'Mantenha um streak de 365 dias',
    emoji: '🏆',
    category: 'streaks',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'streak_days', value: 365 }
  },

  // ═══════════════════════════════════════
  // === FINANÇAS (finance) ===
  // ═══════════════════════════════════════
  {
    id: 'first_transaction',
    name: 'Primeira Anotação',
    description: 'Registre sua primeira transação',
    emoji: '💰',
    category: 'finance',
    rarity: 'common',
    points: 10,
    requirement: { type: 'transactions_logged', value: 1 }
  },
  {
    id: 'finance_10',
    name: 'Organizando as Contas',
    description: 'Registre 10 transações',
    emoji: '📝',
    category: 'finance',
    rarity: 'common',
    points: 25,
    requirement: { type: 'transactions_logged', value: 10 }
  },
  {
    id: 'finance_tracker',
    name: 'Rastreadora Financeira',
    description: 'Registre 30 transações',
    emoji: '📊',
    category: 'finance',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'transactions_logged', value: 30 }
  },
  {
    id: 'finance_50',
    name: 'Controle Total',
    description: 'Registre 50 transações',
    emoji: '📋',
    category: 'finance',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'transactions_logged', value: 50 }
  },
  {
    id: 'finance_master',
    name: 'Mestre das Finanças',
    description: 'Registre 100 transações',
    emoji: '🏦',
    category: 'finance',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'transactions_logged', value: 100 }
  },
  {
    id: 'finance_200',
    name: 'Contadora Nato',
    description: 'Registre 200 transações',
    emoji: '🧮',
    category: 'finance',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'transactions_logged', value: 200 }
  },
  {
    id: 'finance_500',
    name: 'Guru Financeira',
    description: 'Registre 500 transações',
    emoji: '💎',
    category: 'finance',
    rarity: 'legendary',
    points: 400,
    requirement: { type: 'transactions_logged', value: 500 }
  },
  {
    id: 'savings_starter',
    name: 'Poupadora Iniciante',
    description: 'Alcance 25% de uma meta de economia',
    emoji: '🐷',
    category: 'finance',
    rarity: 'common',
    points: 20,
    requirement: { type: 'savings_goal_reached', value: 25 }
  },
  {
    id: 'savings_half',
    name: 'Meio Caminho',
    description: 'Alcance 50% de uma meta de economia',
    emoji: '🎯',
    category: 'finance',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'savings_goal_reached', value: 50 }
  },
  {
    id: 'savings_pro',
    name: 'Poupadora Pro',
    description: 'Alcance 100% de uma meta de economia',
    emoji: '💎',
    category: 'finance',
    rarity: 'epic',
    points: 120,
    requirement: { type: 'savings_goal_reached', value: 100 }
  },
  {
    id: 'budget_keeper_7',
    name: 'Guardiã do Orçamento',
    description: 'Fique abaixo do orçamento por 7 dias',
    emoji: '🛡️',
    category: 'finance',
    rarity: 'common',
    points: 25,
    requirement: { type: 'budget_under', value: 7 }
  },
  {
    id: 'budget_keeper_30',
    name: 'Escudo de Ferro',
    description: 'Fique abaixo do orçamento por 30 dias',
    emoji: '🏰',
    category: 'finance',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'budget_under', value: 30 }
  },
  {
    id: 'first_goal',
    name: 'Sonhadora',
    description: 'Crie sua primeira meta financeira',
    emoji: '🌙',
    category: 'finance',
    rarity: 'common',
    points: 15,
    requirement: { type: 'goals_created', value: 1 }
  },
  {
    id: 'goal_achiever',
    name: 'Realizadora',
    description: 'Complete uma meta financeira',
    emoji: '🎉',
    category: 'finance',
    rarity: 'epic',
    points: 120,
    requirement: { type: 'goals_completed', value: 1 }
  },
  {
    id: 'goal_3',
    name: 'Conquistadora de Metas',
    description: 'Complete 3 metas financeiras',
    emoji: '🏆',
    category: 'finance',
    rarity: 'legendary',
    points: 250,
    requirement: { type: 'goals_completed', value: 3 }
  },
  {
    id: 'first_investment',
    name: 'Investidora',
    description: 'Registre seu primeiro investimento',
    emoji: '📈',
    category: 'finance',
    rarity: 'common',
    points: 20,
    requirement: { type: 'investments_made', value: 1 }
  },
  {
    id: 'investor_pro',
    name: 'Investidora Pro',
    description: 'Registre 10 investimentos',
    emoji: '💹',
    category: 'finance',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'investments_made', value: 10 }
  },
  {
    id: 'card_organizer',
    name: 'Organizadora de Cartões',
    description: 'Cadastre seu primeiro cartão',
    emoji: '💳',
    category: 'finance',
    rarity: 'common',
    points: 15,
    requirement: { type: 'cards_created', value: 1 }
  },
  {
    id: 'category_creator',
    name: 'Categorizadora',
    description: 'Crie 5 categorias financeiras personalizadas',
    emoji: '🏷️',
    category: 'finance',
    rarity: 'common',
    points: 20,
    requirement: { type: 'categories_created', value: 5 }
  },

  // ═══════════════════════════════════════
  // === AUTOCUIDADO (selfcare) ===
  // ═══════════════════════════════════════
  {
    id: 'first_checkin',
    name: 'Autoconhecimento',
    description: 'Faça seu primeiro check-in emocional',
    emoji: '🪞',
    category: 'selfcare',
    rarity: 'common',
    points: 10,
    requirement: { type: 'selfcare_checkins', value: 1 }
  },
  {
    id: 'selfcare_5',
    name: 'Cuidando de Mim',
    description: 'Faça 5 check-ins emocionais',
    emoji: '🌷',
    category: 'selfcare',
    rarity: 'common',
    points: 20,
    requirement: { type: 'selfcare_checkins', value: 5 }
  },
  {
    id: 'selfcare_week',
    name: 'Semana de Cuidado',
    description: 'Faça check-in por 7 dias seguidos',
    emoji: '🌈',
    category: 'selfcare',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'mood_streak', value: 7 }
  },
  {
    id: 'selfcare_14',
    name: 'Ritual Consolidado',
    description: 'Faça check-in por 14 dias seguidos',
    emoji: '🧘',
    category: 'selfcare',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'mood_streak', value: 14 }
  },
  {
    id: 'selfcare_month',
    name: 'Mês de Autocuidado',
    description: 'Faça check-in por 30 dias seguidos',
    emoji: '🦋',
    category: 'selfcare',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'mood_streak', value: 30 }
  },
  {
    id: 'selfcare_60',
    name: 'Alma Equilibrada',
    description: 'Faça check-in por 60 dias seguidos',
    emoji: '☯️',
    category: 'selfcare',
    rarity: 'legendary',
    points: 300,
    requirement: { type: 'mood_streak', value: 60 }
  },
  {
    id: 'selfcare_20',
    name: 'Atenta ao Emocional',
    description: 'Faça 20 check-ins emocionais',
    emoji: '💜',
    category: 'selfcare',
    rarity: 'rare',
    points: 40,
    requirement: { type: 'selfcare_checkins', value: 20 }
  },
  {
    id: 'selfcare_50',
    name: 'Especialista em Autocuidado',
    description: 'Faça 50 check-ins emocionais',
    emoji: '🌺',
    category: 'selfcare',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'selfcare_checkins', value: 50 }
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
    id: 'gratitude_dedicated',
    name: 'Grata de Coração',
    description: 'Escreva 20 entradas de gratidão',
    emoji: '💛',
    category: 'selfcare',
    rarity: 'rare',
    points: 40,
    requirement: { type: 'gratitude_entries', value: 20 }
  },
  {
    id: 'gratitude_master',
    name: 'Mestre da Gratidão',
    description: 'Escreva 50 entradas de gratidão',
    emoji: '✨',
    category: 'selfcare',
    rarity: 'epic',
    points: 80,
    requirement: { type: 'gratitude_entries', value: 50 }
  },
  {
    id: 'gratitude_sage',
    name: 'Sábia Grata',
    description: 'Escreva 100 entradas de gratidão',
    emoji: '🌻',
    category: 'selfcare',
    rarity: 'legendary',
    points: 200,
    requirement: { type: 'gratitude_entries', value: 100 }
  },

  // ═══════════════════════════════════════
  // === COMUNIDADE (community) ===
  // ═══════════════════════════════════════
  {
    id: 'first_post',
    name: 'Primeira Publicação',
    description: 'Crie seu primeiro post na comunidade',
    emoji: '📢',
    category: 'community',
    rarity: 'common',
    points: 10,
    requirement: { type: 'posts_created', value: 1 }
  },
  {
    id: 'active_poster',
    name: 'Comunicadora',
    description: 'Crie 10 posts na comunidade',
    emoji: '💬',
    category: 'community',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'posts_created', value: 10 }
  },
  {
    id: 'prolific_poster',
    name: 'Influenciadora',
    description: 'Crie 50 posts na comunidade',
    emoji: '📣',
    category: 'community',
    rarity: 'epic',
    points: 120,
    requirement: { type: 'posts_created', value: 50 }
  },
  {
    id: 'first_like',
    name: 'Primeira Curtida',
    description: 'Dê sua primeira curtida',
    emoji: '❤️',
    category: 'community',
    rarity: 'common',
    points: 5,
    requirement: { type: 'likes_given', value: 1 }
  },
  {
    id: 'generous_liker',
    name: 'Generosa',
    description: 'Dê 50 curtidas',
    emoji: '💕',
    category: 'community',
    rarity: 'rare',
    points: 30,
    requirement: { type: 'likes_given', value: 50 }
  },
  {
    id: 'super_liker',
    name: 'Espalhadora de Amor',
    description: 'Dê 200 curtidas',
    emoji: '💝',
    category: 'community',
    rarity: 'epic',
    points: 80,
    requirement: { type: 'likes_given', value: 200 }
  },
  {
    id: 'first_comment',
    name: 'Primeira Opinião',
    description: 'Faça seu primeiro comentário',
    emoji: '💭',
    category: 'community',
    rarity: 'common',
    points: 10,
    requirement: { type: 'comments_made', value: 1 }
  },
  {
    id: 'active_commenter',
    name: 'Engajada',
    description: 'Faça 20 comentários',
    emoji: '🗣️',
    category: 'community',
    rarity: 'rare',
    points: 40,
    requirement: { type: 'comments_made', value: 20 }
  },
  {
    id: 'comment_queen',
    name: 'Rainha dos Comentários',
    description: 'Faça 100 comentários',
    emoji: '👑',
    category: 'community',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'comments_made', value: 100 }
  },
  {
    id: 'first_follower',
    name: 'Primeira Seguidora',
    description: 'Ganhe sua primeira seguidora',
    emoji: '🤗',
    category: 'community',
    rarity: 'common',
    points: 15,
    requirement: { type: 'followers_gained', value: 1 }
  },
  {
    id: 'popular',
    name: 'Popular',
    description: 'Tenha 10 seguidoras',
    emoji: '🌟',
    category: 'community',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'followers_gained', value: 10 }
  },
  {
    id: 'influencer',
    name: 'Referência',
    description: 'Tenha 50 seguidoras',
    emoji: '👸',
    category: 'community',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'followers_gained', value: 50 }
  },
  {
    id: 'community_join',
    name: 'Bem-vinda à Comunidade',
    description: 'Entre no ranking pela primeira vez',
    emoji: '👋',
    category: 'community',
    rarity: 'common',
    points: 10,
    requirement: { type: 'community_points', value: 1 }
  },
  {
    id: 'community_100',
    name: 'Participante Ativa',
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
    points: 60,
    requirement: { type: 'community_points', value: 500 }
  },
  {
    id: 'community_1000',
    name: 'Líder Comunitária',
    description: 'Acumule 1000 pontos na comunidade',
    emoji: '🏆',
    category: 'community',
    rarity: 'epic',
    points: 120,
    requirement: { type: 'community_points', value: 1000 }
  },
  {
    id: 'community_5000',
    name: 'Lenda da Comunidade',
    description: 'Acumule 5000 pontos na comunidade',
    emoji: '🌟',
    category: 'community',
    rarity: 'legendary',
    points: 300,
    requirement: { type: 'community_points', value: 5000 }
  },
  {
    id: 'first_challenge',
    name: 'Desafiada',
    description: 'Participe do seu primeiro desafio',
    emoji: '🎮',
    category: 'community',
    rarity: 'common',
    points: 15,
    requirement: { type: 'challenges_joined', value: 1 }
  },
  {
    id: 'challenge_lover',
    name: 'Amante de Desafios',
    description: 'Participe de 5 desafios',
    emoji: '🎪',
    category: 'community',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'challenges_joined', value: 5 }
  },
  {
    id: 'challenge_warrior',
    name: 'Guerreira dos Desafios',
    description: 'Participe de 15 desafios',
    emoji: '⚔️',
    category: 'community',
    rarity: 'epic',
    points: 120,
    requirement: { type: 'challenges_joined', value: 15 }
  },

  // ═══════════════════════════════════════
  // === ROTINA (routine) ===
  // ═══════════════════════════════════════
  {
    id: 'first_routine',
    name: 'Rotina Iniciada',
    description: 'Complete sua primeira tarefa de rotina',
    emoji: '📋',
    category: 'routine',
    rarity: 'common',
    points: 10,
    requirement: { type: 'routine_completed', value: 1 }
  },
  {
    id: 'routine_10',
    name: 'Rotina Estabelecida',
    description: 'Complete 10 tarefas de rotina',
    emoji: '📅',
    category: 'routine',
    rarity: 'common',
    points: 25,
    requirement: { type: 'routine_completed', value: 10 }
  },
  {
    id: 'routine_50',
    name: 'Rotina de Ferro',
    description: 'Complete 50 tarefas de rotina',
    emoji: '⏰',
    category: 'routine',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'routine_completed', value: 50 }
  },
  {
    id: 'routine_100',
    name: 'Máquina de Rotina',
    description: 'Complete 100 tarefas de rotina',
    emoji: '🤖',
    category: 'routine',
    rarity: 'epic',
    points: 120,
    requirement: { type: 'routine_completed', value: 100 }
  },
  {
    id: 'routine_master',
    name: 'Mestre da Rotina',
    description: 'Complete 300 tarefas de rotina',
    emoji: '🏅',
    category: 'routine',
    rarity: 'legendary',
    points: 300,
    requirement: { type: 'routine_completed', value: 300 }
  },
  {
    id: 'first_event',
    name: 'Agendada',
    description: 'Crie seu primeiro evento na agenda',
    emoji: '🗓️',
    category: 'routine',
    rarity: 'common',
    points: 10,
    requirement: { type: 'events_created', value: 1 }
  },
  {
    id: 'event_planner',
    name: 'Planejadora',
    description: 'Crie 10 eventos na agenda',
    emoji: '📆',
    category: 'routine',
    rarity: 'rare',
    points: 40,
    requirement: { type: 'events_created', value: 10 }
  },
  {
    id: 'super_planner',
    name: 'Super Planejadora',
    description: 'Crie 30 eventos na agenda',
    emoji: '🗂️',
    category: 'routine',
    rarity: 'epic',
    points: 80,
    requirement: { type: 'events_created', value: 30 }
  },

  // ═══════════════════════════════════════
  // === ESPECIAIS (special) ===
  // ═══════════════════════════════════════
  {
    id: 'wish_granted',
    name: 'Desejo Realizado',
    description: 'Complete um item da wishlist',
    emoji: '🌠',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'wishes_completed', value: 1 }
  },
  {
    id: 'wish_3',
    name: 'Realizadora de Desejos',
    description: 'Complete 3 itens da wishlist',
    emoji: '💫',
    category: 'special',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'wishes_completed', value: 3 }
  },
  {
    id: 'wish_master',
    name: 'Realizadora de Sonhos',
    description: 'Complete 5 itens da wishlist',
    emoji: '🧞',
    category: 'special',
    rarity: 'legendary',
    points: 200,
    requirement: { type: 'wishes_completed', value: 5 }
  },
  {
    id: 'wish_10',
    name: 'Dona dos Seus Sonhos',
    description: 'Complete 10 itens da wishlist',
    emoji: '👑',
    category: 'special',
    rarity: 'legendary',
    points: 400,
    requirement: { type: 'wishes_completed', value: 10 }
  },
  {
    id: 'early_adopter',
    name: 'Pioneira',
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
    name: 'Mestre Financeira',
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
  {
    id: 'fitness_master',
    name: 'Mestre Fitness',
    description: 'Complete 30 hábitos de exercício',
    emoji: '🏋️',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'category_master', value: 30, category: 'fitness' }
  },
  {
    id: 'learning_master',
    name: 'Mestre do Aprendizado',
    description: 'Complete 30 hábitos de aprendizado',
    emoji: '📖',
    category: 'special',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'category_master', value: 30, category: 'learning' }
  },
  {
    id: 'all_rounder',
    name: 'Multifacetada',
    description: 'Tenha conquistas em todas as 7 categorias',
    emoji: '🌍',
    category: 'special',
    rarity: 'legendary',
    points: 300,
    requirement: { type: 'first_action', value: 1 }
  },
  {
    id: 'points_500',
    name: 'Meio Mil',
    description: 'Acumule 500 pontos de conquistas',
    emoji: '🎖️',
    category: 'special',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'community_points', value: 500 }
  },
  {
    id: 'points_2000',
    name: 'Duas Mil',
    description: 'Acumule 2000 pontos de conquistas',
    emoji: '🏅',
    category: 'special',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'community_points', value: 2000 }
  },
  {
    id: 'points_5000',
    name: 'Elite',
    description: 'Acumule 5000 pontos de conquistas',
    emoji: '💠',
    category: 'special',
    rarity: 'legendary',
    points: 250,
    requirement: { type: 'community_points', value: 5000 }
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
  routine: 'Rotina',
  special: 'Especiais',
};

export const CATEGORY_EMOJIS: Record<AchievementCategory, string> = {
  habits: '✅',
  streaks: '🔥',
  finance: '💰',
  selfcare: '🌸',
  community: '👥',
  routine: '📋',
  special: '⭐',
};
