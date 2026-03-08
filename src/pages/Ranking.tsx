import DashboardLayout from "@/components/layout/DashboardLayout";
import GlobalRanking from "@/components/community/GlobalRanking";

const Ranking = () => {
  return (
    <DashboardLayout activeNav="/ranking">
      <div className="space-y-6">
        <GlobalRanking />
      </div>
    </DashboardLayout>
  );
};

export default Ranking;
