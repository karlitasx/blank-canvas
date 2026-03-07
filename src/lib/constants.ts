// Storage keys centralized for consistency
export const STORAGE_KEYS = {
  // Habits
  HABITS: "vidaflow_habits",
  HABITS_HISTORY: "vidaflow_habits_history",
  LAST_CHECKED: "vidaflow_last_checked",
  
  // Finances
  TRANSACTIONS: "vidaflow_transactions",
  WISHES: "vidaflow_wishes",
  
  // User
  AVATAR: "vidaflow_avatar",
  DISPLAY_NAME: "vidaflow_display_name",
  PREFERENCES: "vidaflow_preferences",
  
  // Stats
  STREAK: "vidaflow_streak",
  LONGEST_STREAK: "vidaflow_longest_streak",
  
  // Self-care
  MOOD_ENTRIES: "vidaflow_mood_entries",
  GRATITUDE_ENTRIES: "vidaflow_gratitude_entries",
} as const;

// Category definitions
export const HABIT_CATEGORIES = {
  health: { name: "Saúde", emoji: "💪", color: "green" },
  productivity: { name: "Produtividade", emoji: "⚡", color: "blue" },
  spiritual: { name: "Espiritual", emoji: "🧘", color: "purple" },
  financial: { name: "Financeiro", emoji: "💰", color: "yellow" },
  selfcare: { name: "Autocuidado", emoji: "🌸", color: "pink" },
} as const;

export const FINANCE_CATEGORIES = {
  income: [
    { id: "salary", name: "Salário", icon: "briefcase" },
    { id: "freelance", name: "Freelance", icon: "laptop" },
    { id: "investment", name: "Investimentos", icon: "trending-up" },
    { id: "other_income", name: "Outros", icon: "plus" },
  ],
  expense: [
    { id: "food", name: "Alimentação", icon: "utensils", color: "#f97316" },
    { id: "transport", name: "Transporte", icon: "car", color: "#3b82f6" },
    { id: "housing", name: "Moradia", icon: "home", color: "#8b5cf6" },
    { id: "leisure", name: "Lazer", icon: "gamepad", color: "#ec4899" },
    { id: "health", name: "Saúde", icon: "heart", color: "#ef4444" },
    { id: "education", name: "Educação", icon: "graduation-cap", color: "#14b8a6" },
    { id: "shopping", name: "Compras", icon: "shopping-bag", color: "#f59e0b" },
    { id: "savings", name: "Investimento / Objetivo", icon: "piggy-bank", color: "#10b981" },
  ],
} as const;

// XP and Level system constants
export const LEVEL_CONFIG = {
  xpPerLevel: 1000,
  bonusMultiplier: 1.5,
  maxLevel: 50,
} as const;

export const POINTS_CONFIG = {
  habitComplete: 10,
  streakBonus: 5,
  transactionLog: 5,
  wishComplete: 50,
  moodEntry: 10,
  gratitudeEntry: 15,
} as const;
