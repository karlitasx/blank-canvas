import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import {
  Home, User, LogOut, HelpCircle, Calendar,
  Wallet, Target, Heart, Award, Trophy,
  Sparkles, UserPlus, BookOpen, Users, Bell, Rss,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    titleKey: "Comece aqui!",
    items: [
      { icon: Sparkles, label: "Primeiros Passos", href: "/", highlight: true },
      { icon: UserPlus, label: "Apresente-se", href: "/social?tab=introductions" },
      { icon: BookOpen, label: "Regras da Comunidade", href: "/social?tab=rules" },
    ],
  },
  {
    titleKey: "Dashboard",
    items: [
      { icon: Home, label: "Dashboard", href: "/" },
      { icon: Calendar, label: "Calendário", href: "/calendar" },
      { icon: User, label: "Perfil", href: "/profile" },
    ],
  },
  {
    titleKey: "Navegue pela comunidade",
    items: [
      { icon: Rss, label: "Feed", href: "/social" },
      { icon: Users, label: "Grupos e Temas", href: "/social?tab=groups" },
      { icon: Calendar, label: "Eventos", href: "/calendar" },
      { icon: Bell, label: "Novidades", href: "/social?tab=news" },
    ],
  },
  {
    titleKey: "Organize sua vida",
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
    onClose();
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

  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (query) {
      return location.pathname === path && location.search === `?${query}`;
    }
    return location.pathname === path && !location.search;
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
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "flex items-center gap-4 w-full px-3 py-3 rounded-lg text-left transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted",
                    item.highlight && !active && "border border-primary/30 bg-primary/5"
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
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted transition-colors rounded-lg"
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

          <div className="flex items-center px-4 gap-6">
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
      </aside>

      {/* Clicar fora fecha o menu */}
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
};

export default MobileSidebar;
