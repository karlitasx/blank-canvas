export type NotificationType = 'achievement' | 'streak' | 'ranking' | 'challenge' | 'level' | 'motivational' | 'follow';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  emoji: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  achievement: '🏆',
  streak: '🔥',
  ranking: '📊',
  challenge: '⚔️',
  level: '⬆️',
  motivational: '💡',
  follow: '👤',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  achievement: 'from-yellow-500 to-orange-500',
  streak: 'from-red-500 to-orange-500',
  ranking: 'from-blue-500 to-cyan-500',
  challenge: 'from-purple-500 to-pink-500',
  level: 'from-green-500 to-emerald-500',
  motivational: 'from-indigo-500 to-blue-500',
  follow: 'from-pink-500 to-rose-500',
};
