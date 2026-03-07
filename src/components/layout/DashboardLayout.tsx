import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
}

const DashboardLayout = ({ children, activeNav = "/" }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar activeItem={activeNav} />

      {/* Main Content */}
      <main className="pt-14 pb-20 md:pb-6 md:pl-64 min-h-screen">
        <div className="p-4 md:p-5 lg:p-6 max-w-7xl">
          {children}
        </div>
      </main>

      <BottomNav activeItem={activeNav} />
    </div>
  );
};

export default DashboardLayout;
