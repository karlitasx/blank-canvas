import { Home, Target, DollarSign, User, Trophy, Heart, Award, LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  labelKey: string;
  href: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

// Navigation items shared across Sidebar and BottomNav
export const navigationItems: NavItem[] = [
  { icon: Home, label: "Home", labelKey: "nav.dashboard", href: "/" },
  { icon: Target, label: "Hábitos", labelKey: "nav.habits", href: "/habits" },
  { icon: DollarSign, label: "Finanças", labelKey: "nav.finances", href: "/finances" },
  { icon: Heart, label: "Autocuidado", labelKey: "nav.selfcare", href: "/selfcare" },
  { icon: Award, label: "Conquistas", labelKey: "nav.achievements", href: "/achievements" },
  { icon: Trophy, label: "Comunidade", labelKey: "nav.community", href: "/community", desktopOnly: true },
  { icon: User, label: "Perfil", labelKey: "nav.profile", href: "/profile", desktopOnly: true },
];

// Get items for mobile bottom nav (limited space)
export const getMobileNavItems = () =>
  navigationItems.filter((item) => !item.desktopOnly).slice(0, 5);

// Get items for desktop sidebar
export const getDesktopNavItems = () =>
  navigationItems.filter((item) => !item.mobileOnly);
