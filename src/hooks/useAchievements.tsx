import { useState, useEffect, useCallback } from "react";
import { 
  Achievement, 
  UserAchievementState, 
  ALL_ACHIEVEMENTS, 
  LEVEL_THRESHOLDS,
  UserLevel 
} from "@/types/achievements";

const STORAGE_KEY = "vidaflow_achievements";
const STATS_KEY = "vidaflow_user_stats";

export interface UserStats {
  habitsCompleted: number;
  habitsCreated: number;
  longestStreak: number;
  currentStreak: number;
  perfectDays: number;
  perfectWeeks: number;
  transactionsLogged: number;
  savingsGoalPercent: number;
  budgetUnderDays: number;
  selfcareCheckins: number;
  moodStreak: number;
  gratitudeEntries: number;
  communityPoints: number;
  wishesCompleted: number;
  routineCompleted: number;
  eventsCreated: number;
  challengesJoined: number;
  postsCreated: number;
  likesGiven: number;
  commentsMade: number;
  followersGained: number;
  goalsCreated: number;
  goalsCompleted: number;
  cardsCreated: number;
  categoriesCreated: number;
  investmentsMade: number;
  categoryCompletions: Record<string, number>;
}

const defaultStats: UserStats = {
  habitsCompleted: 0,
  habitsCreated: 0,
  longestStreak: 0,
  currentStreak: 0,
  perfectDays: 0,
  perfectWeeks: 0,
  transactionsLogged: 0,
  savingsGoalPercent: 0,
  budgetUnderDays: 0,
  selfcareCheckins: 0,
  moodStreak: 0,
  gratitudeEntries: 0,
  communityPoints: 0,
  wishesCompleted: 0,
  routineCompleted: 0,
  eventsCreated: 0,
  challengesJoined: 0,
  postsCreated: 0,
  likesGiven: 0,
  commentsMade: 0,
  followersGained: 0,
  goalsCreated: 0,
  goalsCompleted: 0,
  cardsCreated: 0,
  categoriesCreated: 0,
  investmentsMade: 0,
  categoryCompletions: {},
};

const defaultState: UserAchievementState = {
  unlockedAchievements: [],
  totalPoints: 0,
  level: 'Novata',
  levelProgress: 0,
  lastChecked: new Date().toISOString(),
};

const calculateLevel = (points: number): { level: UserLevel; progress: number } => {
  const levels = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
  
  // Sort by threshold descending to find the correct level
  const sortedLevels = [...levels].sort((a, b) => b[1] - a[1]);
  
  for (const [level, threshold] of sortedLevels) {
    if (points >= threshold) {
      // Find next level
      const currentIndex = levels.findIndex(([l]) => l === level);
      const nextLevel = levels[currentIndex + 1];
      
      if (nextLevel) {
        const progress = ((points - threshold) / (nextLevel[1] - threshold)) * 100;
        return { level, progress: Math.min(progress, 100) };
      }
      return { level, progress: 100 };
    }
  }
  
  return { level: 'Novata', progress: 0 };
};

export const useAchievements = () => {
  const [state, setState] = useState<UserAchievementState>(defaultState);
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: UserLevel; points: number } | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      const savedStats = localStorage.getItem(STATS_KEY);
      
      if (savedState) {
        setState(JSON.parse(savedState));
      }
      
      if (savedStats) {
        setStats({ ...defaultStats, ...JSON.parse(savedStats) });
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  }, [stats, isLoaded]);

  // Check if achievement should be unlocked
  const checkRequirement = useCallback((achievement: Achievement, currentStats: UserStats): boolean => {
    const { requirement } = achievement;
    
    switch (requirement.type) {
      case 'habits_completed':
        return currentStats.habitsCompleted >= requirement.value;
      case 'habits_created':
        return currentStats.habitsCreated >= requirement.value;
      case 'streak_days':
        return currentStats.longestStreak >= requirement.value;
      case 'total_streak':
        return currentStats.currentStreak >= requirement.value;
      case 'perfect_day':
        return currentStats.perfectDays >= requirement.value;
      case 'weekly_goal':
        return currentStats.perfectWeeks >= requirement.value;
      case 'transactions_logged':
        return currentStats.transactionsLogged >= requirement.value;
      case 'savings_goal_reached':
        return currentStats.savingsGoalPercent >= requirement.value;
      case 'budget_under':
        return currentStats.budgetUnderDays >= requirement.value;
      case 'selfcare_checkins':
        return currentStats.selfcareCheckins >= requirement.value;
      case 'mood_streak':
        return currentStats.moodStreak >= requirement.value;
      case 'gratitude_entries':
        return currentStats.gratitudeEntries >= requirement.value;
      case 'community_points':
        return currentStats.communityPoints >= requirement.value;
      case 'wishes_completed':
        return currentStats.wishesCompleted >= requirement.value;
      case 'routine_completed':
        return currentStats.routineCompleted >= requirement.value;
      case 'events_created':
        return currentStats.eventsCreated >= requirement.value;
      case 'challenges_joined':
        return currentStats.challengesJoined >= requirement.value;
      case 'posts_created':
        return currentStats.postsCreated >= requirement.value;
      case 'likes_given':
        return currentStats.likesGiven >= requirement.value;
      case 'comments_made':
        return currentStats.commentsMade >= requirement.value;
      case 'followers_gained':
        return currentStats.followersGained >= requirement.value;
      case 'goals_created':
        return currentStats.goalsCreated >= requirement.value;
      case 'goals_completed':
        return currentStats.goalsCompleted >= requirement.value;
      case 'cards_created':
        return currentStats.cardsCreated >= requirement.value;
      case 'categories_created':
        return currentStats.categoriesCreated >= requirement.value;
      case 'investments_made':
        return currentStats.investmentsMade >= requirement.value;
      case 'first_action':
        return true;
      case 'category_master':
        const category = requirement.category || '';
        return (currentStats.categoryCompletions[category] || 0) >= requirement.value;
      default:
        return false;
    }
  }, []);

  // Check all achievements and unlock new ones
  const checkAchievements = useCallback(() => {
    const newUnlocks: Achievement[] = [];
    
    ALL_ACHIEVEMENTS.forEach((achievement) => {
      if (state.unlockedAchievements.includes(achievement.id)) {
        return; // Already unlocked
      }
      
      if (checkRequirement(achievement, stats)) {
        newUnlocks.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
        });
      }
    });
    
    if (newUnlocks.length > 0) {
      const newPoints = state.totalPoints + newUnlocks.reduce((sum, a) => sum + a.points, 0);
      const { level: newLevel, progress } = calculateLevel(newPoints);
      const previousLevel = state.level;
      
      setState(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocks.map(a => a.id)],
        totalPoints: newPoints,
        level: newLevel,
        levelProgress: progress,
        lastChecked: new Date().toISOString(),
      }));
      
      // Check for level up
      if (newLevel !== previousLevel) {
        setLevelUpInfo({ level: newLevel, points: newPoints });
      }
      
      // Show the first newly unlocked achievement
      setNewlyUnlocked(newUnlocks[0]);
    }
  }, [state.unlockedAchievements, state.totalPoints, state.level, stats, checkRequirement]);

  // Update stats and check achievements
  const updateStats = useCallback((updates: Partial<UserStats>) => {
    setStats(prev => {
      const newStats = { ...prev, ...updates };
      return newStats;
    });
  }, []);

  // Increment a stat value
  const incrementStat = useCallback((
    key: keyof Omit<UserStats, 'categoryCompletions'>, 
    amount: number = 1
  ) => {
    setStats(prev => ({
      ...prev,
      [key]: (prev[key] as number) + amount,
    }));
  }, []);

  // Increment category completion
  const incrementCategoryCompletion = useCallback((category: string, amount: number = 1) => {
    setStats(prev => ({
      ...prev,
      categoryCompletions: {
        ...prev.categoryCompletions,
        [category]: (prev.categoryCompletions[category] || 0) + amount,
      },
    }));
  }, []);

  // Dismiss newly unlocked notification
  const dismissUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  // Dismiss level up notification
  const dismissLevelUp = useCallback(() => {
    setLevelUpInfo(null);
  }, []);

  // Get all achievements with unlock status
  const getAllAchievements = useCallback((): (Achievement & { isUnlocked: boolean })[] => {
    return ALL_ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: state.unlockedAchievements.includes(achievement.id),
    }));
  }, [state.unlockedAchievements]);

  // Get achievements by category
  const getAchievementsByCategory = useCallback((category?: string) => {
    const all = getAllAchievements();
    if (!category || category === 'all') return all;
    return all.filter(a => a.category === category);
  }, [getAllAchievements]);

  // Get unlocked count
  const getUnlockedCount = useCallback(() => {
    return state.unlockedAchievements.length;
  }, [state.unlockedAchievements]);

  // Get total achievements count
  const getTotalCount = useCallback(() => {
    return ALL_ACHIEVEMENTS.length;
  }, []);

  // Get progress for a specific achievement
  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    const { requirement } = achievement;
    let current = 0;
    
    switch (requirement.type) {
      case 'habits_completed':
        current = stats.habitsCompleted;
        break;
      case 'habits_created':
        current = stats.habitsCreated;
        break;
      case 'streak_days':
      case 'total_streak':
        current = stats.longestStreak;
        break;
      case 'perfect_day':
        current = stats.perfectDays;
        break;
      case 'weekly_goal':
        current = stats.perfectWeeks;
        break;
      case 'transactions_logged':
        current = stats.transactionsLogged;
        break;
      case 'savings_goal_reached':
        current = stats.savingsGoalPercent;
        break;
      case 'budget_under':
        current = stats.budgetUnderDays;
        break;
      case 'selfcare_checkins':
        current = stats.selfcareCheckins;
        break;
      case 'mood_streak':
        current = stats.moodStreak;
        break;
      case 'gratitude_entries':
        current = stats.gratitudeEntries;
        break;
      case 'community_points':
        current = stats.communityPoints;
        break;
      case 'wishes_completed':
        current = stats.wishesCompleted;
        break;
      case 'category_master':
        current = stats.categoryCompletions[requirement.category || ''] || 0;
        break;
      default:
        current = 0;
    }
    
    return Math.min((current / requirement.value) * 100, 100);
  }, [stats]);

  // Get motivational notifications
  const getMotivationalHints = useCallback((): string[] => {
    const hints: string[] = [];
    
    // Check achievements close to completion
    ALL_ACHIEVEMENTS.forEach(achievement => {
      if (state.unlockedAchievements.includes(achievement.id)) return;
      
      const progress = getAchievementProgress(achievement.id);
      if (progress >= 50 && progress < 100) {
        const remaining = achievement.requirement.value - Math.floor((progress / 100) * achievement.requirement.value);
        
        if (achievement.requirement.type === 'streak_days') {
          hints.push(`Faltam ${remaining} dias para "${achievement.name}" ${achievement.emoji}`);
        } else if (achievement.requirement.type === 'habits_completed') {
          hints.push(`Faltam ${remaining} hábitos para "${achievement.name}" ${achievement.emoji}`);
        }
      }
    });
    
    // Check level progress
    const levels = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
    const currentLevelIndex = levels.findIndex(([level]) => level === state.level);
    const nextLevel = levels[currentLevelIndex + 1];
    
    if (nextLevel) {
      const pointsToNext = nextLevel[1] - state.totalPoints;
      if (pointsToNext <= 100) {
        hints.push(`Você está a ${pointsToNext} pts do nível ${nextLevel[0]}! 🚀`);
      }
    }
    
    return hints.slice(0, 3); // Max 3 hints
  }, [state, getAchievementProgress]);

  // Run achievement check when stats change
  useEffect(() => {
    if (isLoaded) {
      checkAchievements();
    }
  }, [stats, isLoaded, checkAchievements]);

  return {
    state,
    stats,
    isLoaded,
    newlyUnlocked,
    levelUpInfo,
    updateStats,
    incrementStat,
    incrementCategoryCompletion,
    dismissUnlocked,
    dismissLevelUp,
    getAllAchievements,
    getAchievementsByCategory,
    getUnlockedCount,
    getTotalCount,
    getAchievementProgress,
    getMotivationalHints,
    checkAchievements,
  };
};
