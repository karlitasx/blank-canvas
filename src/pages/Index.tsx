import Dashboard from "@/pages/Dashboard";

const Index = () => {
  // User is already authenticated at this point (protected by ProtectedRoute)
  // Simply render the Dashboard
  return <Dashboard />;
};

export default Index;
