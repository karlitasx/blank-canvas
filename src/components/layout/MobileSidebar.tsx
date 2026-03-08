import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import {
  Home, User, Play, LogOut, Calendar, Target, Heart, Award, Trophy, Wallet,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    titleKey: "Dashboard",
    items: [
      { icon: Home, label: "Dashboard", href: "/" },
      { icon: Calendar, label: "Calendário", href: "/calendar" },
      { icon: User, label: "Perfil", href: "/profile" },
      { icon: Play, label: "Social", href: "/social" },
    ],
  },
  {
    titleKey: "Navegue pelo app",
    items: [
      { icon: Target, label: "Hábitos", href: "/habits" },
      { icon: Heart, label: "Autocuidado", href: "/selfcare" },
      { icon: Award, label: "Conquistas", href: "/challenges" },
      { icon: Trophy, label: "Ranking", href: "/ranking" },
    ],
  },
  {
    titleKey: "Controle suas finanças",
    items: [
      { icon: Wallet, label: "Minhas Finanças", href: "/finance" },
    ],
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose(); // fecha o menu mobile ao clicar
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Até logo! 👋",
      description: "Você saiu da sua conta",
    });
    navigate("/auth", { replace: true });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex">
      <aside className="w-64 bg-background p-4 overflow-y-auto">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            <p className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary">
              {section.titleKey}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "flex items-center gap-4 w-full px-3 py-3 rounded-lg text-left transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[15px]">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}

        <Separator />

        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={() => handleNavigate("/profile")}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.display_name || "Meu Perfil"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Clicar fora fecha o menu */}
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
};

export default MobileSidebar;
