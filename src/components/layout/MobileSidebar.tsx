import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Home,
  User,
  Play,
  LogOut,
  HelpCircle,
  BookOpen,
  Calendar,
  X,
  Users,
  Newspaper,
  Wallet,
  Target,
  Heart,
  Award,
  Trophy,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    titleKey: "Comece aqui!",
    items: [
      { icon: Play, label: "Primeiros Passos", href: "/" },
      { icon: User, label: "Apresente-se", href: "/community" },
      { icon: BookOpen, label: "Regras da Comunidade", href: "/community" },
    ],
  },
  {
    titleKey: "Navegue pela comunidade",
    items: [
      { icon: Home, label: "Feed", href: "/community" },
      { icon: Users, label: "Grupos e Temas", href: "/community" },
      { icon: Calendar, label: "Eventos", href: "/agenda" },
      { icon: Newspaper, label: "Novidades", href: "/community" },
    ],
  },
  {
    titleKey: "Navegue pelo app",
    items: [
      { icon: Target, label: "Hábitos", href: "/habits" },
      { icon: Heart, label: "Autocuidado", href: "/selfcare" },
      { icon: Award, label: "Conquistas", href: "/achievements" },
      { icon: Trophy, label: "Ranking", href: "/community" },
    ],
  },
  {
    titleKey: "Controle suas finanças",
    items: [
      { icon: Wallet, label: "Minhas Finanças", href: "/finances" },
    ],
  },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileSidebar = ({ open, onOpenChange }: MobileSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
    toast({
      title: "Até logo! 👋",
      description: "Você saiu da sua conta",
    });
    navigate("/auth", { replace: true });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-background [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="text-lg font-bold text-foreground">Vertice Group</span>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-2">
          {sections.map((section, idx) => (
            <div key={idx} className="px-3 mb-2">
              <p className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary">
                {section.titleKey}
              </p>
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
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
        </div>

        {/* Footer - User profile + actions */}
        <div className="border-t border-border">
          {/* User Info */}
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

          <Separator />

          {/* Help & Logout */}
          <div className="flex items-center px-4 py-3 gap-6">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Ajuda</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
