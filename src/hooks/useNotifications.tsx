import { useState, useEffect, useCallback } from "react";
import { Notification, NotificationType } from "@/types/notifications";

const STORAGE_KEY = "vidaflow_notifications";
const MAX_NOTIFICATIONS = 20;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  // Add notification
  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    emoji: string,
    actionUrl?: string
  ) => {
    const newNotification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      emoji,
      timestamp: new Date().toISOString(),
      isRead: false,
      actionUrl,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });

    return newNotification;
  }, []);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Clear notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Get notifications by type
  const getByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Add achievement notification
  const notifyAchievement = useCallback((name: string, emoji: string, points: number) => {
    return addNotification(
      'achievement',
      'Nova Conquista!',
      `Você desbloqueou "${name}" +${points} pts`,
      emoji,
      '/achievements'
    );
  }, [addNotification]);

  // Add streak warning
  const notifyStreakAtRisk = useCallback((habitName: string, streak: number) => {
    return addNotification(
      'streak',
      'Streak em risco!',
      `Complete "${habitName}" para manter seu streak de ${streak} dias!`,
      '🔥',
      '/habits'
    );
  }, [addNotification]);

  // Add ranking update
  const notifyRankingChange = useCallback((position: number, change: number) => {
    const direction = change > 0 ? 'subiu' : 'caiu';
    const emoji = change > 0 ? '📈' : '📉';
    return addNotification(
      'ranking',
      'Ranking Atualizado',
      `Você ${direction} ${Math.abs(change)} posições! Atual: #${position}`,
      emoji,
      '/community'
    );
  }, [addNotification]);

  // Add challenge notification
  const notifyChallenge = useCallback((challengeName: string, progress: number) => {
    return addNotification(
      'challenge',
      'Progresso no Desafio',
      `"${challengeName}" está ${progress}% completo!`,
      '⚔️',
      '/community'
    );
  }, [addNotification]);

  // Add level up notification
  const notifyLevelUp = useCallback((newLevel: string, emoji: string) => {
    return addNotification(
      'level',
      'Level Up!',
      `Parabéns! Você alcançou o nível ${newLevel}!`,
      emoji,
      '/achievements'
    );
  }, [addNotification]);

  // Add motivational notification
  const notifyMotivational = useCallback((message: string) => {
    return addNotification(
      'motivational',
      'Dica do dia',
      message,
      '💡'
    );
  }, [addNotification]);

  // Add new follower notification
  const notifyNewFollower = useCallback((followerName: string, followerUserId: string) => {
    return addNotification(
      'follow',
      'Novo Seguidor!',
      `${followerName} começou a seguir você`,
      '👤',
      `/profile/${followerUserId}`
    );
  }, [addNotification]);

  return {
    notifications,
    isLoaded,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    getUnreadCount,
    getByType,
    notifyAchievement,
    notifyStreakAtRisk,
    notifyRankingChange,
    notifyChallenge,
    notifyLevelUp,
    notifyMotivational,
    notifyNewFollower,
  };
};
