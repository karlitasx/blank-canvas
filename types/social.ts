export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  points: number;
  contribution: number; // For financial goals
  isAdmin?: boolean;
  isCurrentUser?: boolean;
}

export interface GroupChallenge {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'habits' | 'streak';
  targetValue: number;
  currentValue: number;
  deadline: Date;
  participants: string[]; // Member IDs
  completed: boolean;
}

export interface GroupActivity {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  type: 'habit_completed' | 'savings' | 'challenge_joined' | 'level_up' | 'achievement';
  description: string;
  timestamp: Date;
  value?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  emoji: string;
  financialGoal?: number;
  financialCurrent?: number;
  members: GroupMember[];
  challenges: GroupChallenge[];
  activities: GroupActivity[];
  createdAt: Date;
  inviteCode: string;
}

export interface RankingUser {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: string;
  badges: string[];
  isCurrentUser?: boolean;
}
