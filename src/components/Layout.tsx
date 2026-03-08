// src/components/Layout.tsx
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation(); // para destacar a página ativa

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Função para adicionar classe ativa ao link do menu
  const isActive = (path: string) =>
    location.pathname === path ? "text-primary font-bold" : "text-gray-500";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Conteúdo da página */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Menu fixo no rodapé */}
      <nav className="bg-white border-t p-4 flex justify-around">
        <Link to="/" className={isActive("/")}>
          Dashboard
        </Link>
        <Link to="/habits" className={isActive("/habits")}>
          Hábitos
        </Link>
        <Link to="/finance" className={isActive("/finance")}>
          Financeiro
        </Link>
        <Link to="/social" className={isActive("/social")}>
          Social
        </Link>
        <Link to="/profile" className={isActive("/profile")}>
          Perfil
        </Link>
      </nav>
    </div>
  );
};
