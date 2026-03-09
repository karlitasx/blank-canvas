import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HeroSection from "@/components/dashboard/HeroSection";
import DailyProgress from "@/components/dashboard/DailyProgress";
import VirtualPlant from "@/components/dashboard/VirtualPlant";
import QuickStats from "@/components/dashboard/QuickStats";
import QuickNavigation from "@/components/dashboard/QuickNavigation";
import WeeklySummary from "@/components/dashboard/WeeklySummary";
import RecentAchievements from "@/components/dashboard/RecentAchievements";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import WelcomeModal from "@/components/onboarding/WelcomeModal";

const Dashboard = () => {
  const [runTour, setRunTour] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboardingTour");
    if (!hasSeenTour) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    setRunTour(true);
  };

  const handleExplore = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("hasSeenOnboardingTour", "true");
  };

  const handleFinishTour = () => {
    setRunTour(false);
    localStorage.setItem("hasSeenOnboardingTour", "true");
  };

  return (
    <DashboardLayout activeNav="/">
      <WelcomeModal 
        open={showWelcomeModal} 
        onStartTour={handleStartTour} 
        onExplore={handleExplore} 
      />
      <OnboardingTour run={runTour} onFinish={handleFinishTour} />

      {/* Hero Section */}
      <div data-tour="hero">
        <HeroSection />
      </div>

      {/* Quick Stats Grid */}
      <div className="mb-8" data-tour="quick-stats">
        <QuickStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Daily Progress - Takes 2 columns */}
        <div className="lg:col-span-2" data-tour="daily-progress">
          <DailyProgress />
        </div>
        
        {/* Virtual Plant */}
        <div data-tour="virtual-plant">
          <VirtualPlant />
        </div>
      </div>

      {/* Achievements & Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Achievements */}
        <div data-tour="achievements">
          <RecentAchievements />
        </div>
        
        {/* Quick Navigation */}
        <div data-tour="quick-nav">
          <QuickNavigation />
        </div>
      </div>

      {/* Weekly Summary */}
      <WeeklySummary />
    </DashboardLayout>
  );
};

export default Dashboard;
