import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AchievementsProvider } from "@/contexts/AchievementsContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Routine from "./pages/Routine";
import Finance from "./pages/Finance";
import Social from "./pages/Social";
import SelfCare from "./pages/SelfCare";
import Challenges from "./pages/Challenges";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Ranking from "./pages/Ranking";
import PublicProfile from "./pages/PublicProfile";

const queryClient = new QueryClient();

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <PreferencesProvider>
              <AchievementsProvider>
            <Routes>
              <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/habits" element={<Navigate to="/routine" replace />} />
                <Route path="/routine" element={<Routine />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/social" element={<Social />} />
                <Route path="/selfcare" element={<SelfCare />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<PublicProfile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/ranking" element={<Ranking />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AchievementsProvider>
        </PreferencesProvider>
            </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
