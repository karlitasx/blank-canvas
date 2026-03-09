import { Home, DollarSign, User, Trophy, Heart, Award, Medal, CalendarDays, Calendar, Dumbbell, Target, LucideIcon } from "lucide-react";

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
  { icon: CalendarDays, label: "Rotina", labelKey: "nav.routine", href: "/routine" },
  { icon: Calendar, label: "Calendário", labelKey: "nav.calendar", href: "/calendar" },
  { icon: DollarSign, label: "Finanças", labelKey: "nav.finances", href: "/finance" },
  { icon: Heart, label: "Autocuidado", labelKey: "nav.selfcare", href: "/selfcare" },
  { icon: Dumbbell, label: "GymRats", labelKey: "nav.gymrats", href: "/gymrats" },
  { icon: Target, label: "Desafios", labelKey: "nav.challenges", href: "/challenges" },
  { icon: Award, label: "Conquistas", labelKey: "nav.achievements", href: "/achievements" },
  { icon: Medal, label: "Ranking", labelKey: "nav.ranking", href: "/ranking" },
  { icon: Trophy, label: "Social", labelKey: "nav.community", href: "/social" },
  { icon: User, label: "Perfil", labelKey: "nav.profile", href: "/profile" },
];

// Get items for mobile bottom nav (limited space)
export const getMobileNavItems = () =>
  navigationItems.filter((item) => !item.desktopOnly).slice(0, 5);

// Get items for desktop sidebar
export const getDesktopNavItems = () =>
  navigationItems.filter((item) => !item.mobileOnly);
