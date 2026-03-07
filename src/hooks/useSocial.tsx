import { useState, useEffect, useCallback } from "react";
import { Group, GroupMember, GroupActivity, GroupChallenge, RankingUser } from "@/types/social";
import { LEVEL_THRESHOLDS, LEVEL_EMOJIS, UserLevel } from "@/types/achievements";

const GROUPS_KEY = "vidaflow_groups";
const RANKING_KEY = "vidaflow_ranking";

// Empty initial state - no mock data
const mockRanking: RankingUser[] = [];
const mockGroups: Group[] = [];

const getUserLevel = (points: number): UserLevel => {
  const levels = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
  const sortedLevels = [...levels].sort((a, b) => b[1] - a[1]);
  
  for (const [level, threshold] of sortedLevels) {
    if (points >= threshold) {
      return level;
    }
  }
  return 'Novata';
};

export const useSocial = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedGroups = localStorage.getItem(GROUPS_KEY);
      const savedRanking = localStorage.getItem(RANKING_KEY);
      const savedAchievements = localStorage.getItem("vidaflow_achievements");
      
      if (savedGroups) {
        const parsed = JSON.parse(savedGroups);
        // Convert dates
        const withDates = parsed.map((g: Group) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          challenges: g.challenges.map((c: GroupChallenge) => ({
            ...c,
            deadline: new Date(c.deadline),
          })),
          activities: g.activities.map((a: GroupActivity) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          })),
        }));
        setGroups(withDates);
      } else {
        setGroups(mockGroups);
      }
      
      // Get user points from achievements
      let points = 0;
      if (savedAchievements) {
        const achievements = JSON.parse(savedAchievements);
        points = achievements.totalPoints || 0;
      }
      setUserPoints(points);
      
      // Update ranking with user points
      const baseRanking = savedRanking ? JSON.parse(savedRanking) : mockRanking;
      const userLevel = getUserLevel(points);
      const userEntry: RankingUser = {
        id: "current",
        name: "Você",
        avatar: "😊",
        points,
        level: userLevel,
        badges: ["consistent", "plant"],
        isCurrentUser: true,
      };
      
      // Add or update user in ranking
      const otherUsers = baseRanking.filter((u: RankingUser) => !u.isCurrentUser);
      const fullRanking = [...otherUsers, userEntry].sort((a, b) => b.points - a.points);
      setRanking(fullRanking);
      
    } catch (error) {
      console.error("Error loading social data:", error);
      setGroups(mockGroups);
      setRanking(mockRanking);
    }
    setIsLoaded(true);
  }, []);

  // Save groups to localStorage
  useEffect(() => {
    if (isLoaded && groups.length > 0) {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    }
  }, [groups, isLoaded]);

  // Create a new group
  const createGroup = useCallback((data: { name: string; description: string; emoji: string; financialGoal?: number }) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      ...data,
      financialCurrent: 0,
      members: [
        { id: "current", name: "Você", avatar: "😊", points: userPoints, contribution: 0, isAdmin: true, isCurrentUser: true },
      ],
      challenges: [],
      activities: [],
      createdAt: new Date(),
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };
    
    setGroups(prev => [newGroup, ...prev]);
    return newGroup;
  }, [userPoints]);

  // Add member to group (simulated)
  const addMember = useCallback((groupId: string, member: Omit<GroupMember, "id">) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      
      const newMember: GroupMember = {
        ...member,
        id: Date.now().toString(),
      };
      
      return {
        ...g,
        members: [...g.members, newMember],
        activities: [
          {
            id: Date.now().toString(),
            memberId: newMember.id,
            memberName: newMember.name,
            memberAvatar: newMember.avatar,
            type: 'challenge_joined' as const,
            description: 'entrou no grupo',
            timestamp: new Date(),
          },
          ...g.activities,
        ],
      };
    }));
  }, []);

  // Add activity to group
  const addActivity = useCallback((groupId: string, activity: Omit<GroupActivity, "id" | "timestamp">) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      
      return {
        ...g,
        activities: [
          {
            ...activity,
            id: Date.now().toString(),
            timestamp: new Date(),
          },
          ...g.activities,
        ].slice(0, 50), // Keep last 50 activities
      };
    }));
  }, []);

  // Create challenge in group
  const createChallenge = useCallback((groupId: string, challenge: Omit<GroupChallenge, "id" | "currentValue" | "completed" | "participants">) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      
      const newChallenge: GroupChallenge = {
        ...challenge,
        id: Date.now().toString(),
        currentValue: 0,
        completed: false,
        participants: g.members.map(m => m.id),
      };
      
      return {
        ...g,
        challenges: [newChallenge, ...g.challenges],
      };
    }));
  }, []);

  // Update challenge progress
  const updateChallengeProgress = useCallback((groupId: string, challengeId: string, value: number) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      
      return {
        ...g,
        challenges: g.challenges.map(c => {
          if (c.id !== challengeId) return c;
          const newValue = c.currentValue + value;
          return {
            ...c,
            currentValue: newValue,
            completed: newValue >= c.targetValue,
          };
        }),
      };
    }));
  }, []);

  // Get user position in ranking
  const getUserPosition = useCallback(() => {
    const index = ranking.findIndex(u => u.isCurrentUser);
    return index >= 0 ? index + 1 : ranking.length + 1;
  }, [ranking]);

  // Filter ranking by period (simulated - just varies the points slightly)
  const getFilteredRanking = useCallback((period: 'weekly' | 'monthly' | 'yearly') => {
    const multiplier = period === 'weekly' ? 0.2 : period === 'monthly' ? 0.5 : 1;
    return ranking.map(user => ({
      ...user,
      points: Math.round(user.points * multiplier),
    })).sort((a, b) => b.points - a.points);
  }, [ranking]);

  return {
    groups,
    ranking,
    userPoints,
    isLoaded,
    createGroup,
    addMember,
    addActivity,
    createChallenge,
    updateChallengeProgress,
    getUserPosition,
    getFilteredRanking,
  };
};
