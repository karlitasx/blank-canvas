import DashboardLayout from "@/components/layout/DashboardLayout";
import HeroSection from "@/components/dashboard/HeroSection";
import DailyProgress from "@/components/dashboard/DailyProgress";
import VirtualPlant from "@/components/dashboard/VirtualPlant";
import QuickStats from "@/components/dashboard/QuickStats";
import QuickNavigation from "@/components/dashboard/QuickNavigation";
import WeeklySummary from "@/components/dashboard/WeeklySummary";
import RecentAchievements from "@/components/dashboard/RecentAchievements";

const Dashboard = () => {
  return (
    <DashboardLayout activeNav="/">
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Stats Grid */}
      <div className="mb-8">
        <QuickStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Daily Progress - Takes 2 columns */}
        <div className="lg:col-span-2">
          <DailyProgress />
        </div>
        
        {/* Virtual Plant */}
        <div>
          <VirtualPlant />
        </div>
      </div>

      {/* Achievements & Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Achievements */}
        <RecentAchievements />
        
        {/* Quick Navigation */}
        <QuickNavigation />
      </div>

      {/* Weekly Summary */}
      <WeeklySummary />
    </DashboardLayout>
  );
};

export default Dashboard;
