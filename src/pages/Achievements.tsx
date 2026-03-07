import DashboardLayout from "@/components/layout/DashboardLayout";
import AchievementsGallery from "@/components/achievements/AchievementsGallery";

const Achievements = () => {
  return (
    <DashboardLayout activeNav="/achievements">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <AchievementsGallery />
      </div>
    </DashboardLayout>
  );
};

export default Achievements;
