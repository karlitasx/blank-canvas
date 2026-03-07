import React, { createContext, useContext, ReactNode } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementUnlockModal from "@/components/achievements/AchievementUnlockModal";
import LevelUpModal from "@/components/achievements/LevelUpModal";

type AchievementsContextType = ReturnType<typeof useAchievements>;

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export const useAchievementsContext = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error("useAchievementsContext must be used within AchievementsProvider");
  }
  return context;
};

interface AchievementsProviderProps {
  children: ReactNode;
}

export const AchievementsProvider = ({ children }: AchievementsProviderProps) => {
  const achievements = useAchievements();

  return (
    <AchievementsContext.Provider value={achievements}>
      {children}
      <AchievementUnlockModal
        achievement={achievements.newlyUnlocked}
        onClose={achievements.dismissUnlocked}
      />
      <LevelUpModal
        isOpen={!!achievements.levelUpInfo}
        onClose={achievements.dismissLevelUp}
        newLevel={achievements.levelUpInfo?.level || 'Novata'}
        totalPoints={achievements.levelUpInfo?.points || 0}
      />
    </AchievementsContext.Provider>
  );
};
