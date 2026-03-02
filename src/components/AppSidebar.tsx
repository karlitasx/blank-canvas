import {
  LayoutDashboard,
  Target,
  Wallet,
  Users,
  Heart,
  Trophy,
  Calendar,
  User,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Hábitos", url: "/habits", icon: Target },
  { title: "Finanças", url: "/finance", icon: Wallet },
  { title: "Comunidade", url: "/social", icon: Users },
  { title: "Autocuidado", url: "/selfcare", icon: Heart },
  { title: "Desafios", url: "/challenges", icon: Trophy },
  { title: "Calendário", url: "/calendar", icon: Calendar },
  { title: "Perfil", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          V
        </div>
        <span className="font-semibold text-sidebar-foreground">Vertice</span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <NavLink key={item.url} to={item.url} end={item.url === "/"}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <Separator />

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">
              {profile?.display_name || user?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
