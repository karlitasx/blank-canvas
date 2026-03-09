import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBusinessFinance, BusinessType } from "@/hooks/useBusinessFinance";
import BusinessSetup from "@/components/business/BusinessSetup";
import BusinessDashboard from "@/components/business/BusinessDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const BusinessFinance = () => {
  const biz = useBusinessFinance();

  if (biz.isLoading) {
    return (
      <DashboardLayout activeNav="/finance">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!biz.settings) {
    return (
      <DashboardLayout activeNav="/finance">
        <BusinessSetup onSave={biz.saveSettings} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNav="/finance">
      <BusinessDashboard biz={biz} />
    </DashboardLayout>
  );
};

export default BusinessFinance;
