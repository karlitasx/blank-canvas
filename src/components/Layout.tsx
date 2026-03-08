// src/components/Layout.tsx
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  const isActive = (path: string) =>
    location.pathname === path ? "font-bold text-primary" : "text-gray-600";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Menu lateral */}
      <nav className="w-60 border-r p-6 flex flex-col gap-4">
        <div className="text-sm font-semibold text-pink-600 uppercase mb-4">Comece aqui!</div>
        <Link to="/auth" className={`flex items-center gap-2 ${isActive("/auth")}`}>
          {/* Ícone de play pode ser um SVG ou emoji */}
          <span>▶️</span> Primeiros Passos
        </Link>
        <Link to="/apresente-se" className={`flex items-center gap-2 ${isActive("/apresente-se")}`}>
          <span>👤</span> Apresente-se
        </Link>
        <Link to="/regras-da-comunidade" className={`flex items-center gap-2 ${isActive("/regras-da-comunidade")}`}>
          <span>📖</span> Regras da Comunidade
        </Link>

        <div className="text-sm font-semibold text-pink-600 uppercase mt-8 mb-4">Navegue pela comunidade</div>
        <Link to="/feed" className={`flex items-center gap-2 ${isActive("/feed")}`}>
          <span>🏠</span> Feed
        </Link>
        <Link to="/grupos-e-temas" className={`flex items-center gap-2 ${isActive("/grupos-e-temas")}`}>
          <span>🗂️</span> Grupos e Temas
        </Link>
        <Link to="/eventos" className={`flex items-center gap-2 ${isActive("/eventos")}`}>
          <span>📅</span> Eventos
        </Link>
        <Link to="/novidades" className={`flex items-center gap-2 ${isActive("/novidades")}`}>
          <span>🆕</span> Novidades
        </Link>

        <div className="text-sm font-semibold text-pink-600 uppercase mt-8 mb-4">Navegue pelo app</div>
        <Link to="/habitos" className={`flex items-center gap-2 ${isActive("/habitos")}`}>
          <span>🔥</span> Hábitos
        </Link>
        <Link to="/autocuidado" className={`flex items-center gap-2 ${isActive("/autocuidado")}`}>
          <span>🧘‍♀️</span> Autocuidado
        </Link>
        <Link to="/conquistas" className={`flex items-center gap-2 ${isActive("/conquistas")}`}>
          <span>🏆</span> Conquistas
        </Link>
        <Link to="/ranking" className={`flex items-center gap-2 ${isActive("/ranking")}`}>
          <span>🎖️</span> Ranking
        </Link>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
