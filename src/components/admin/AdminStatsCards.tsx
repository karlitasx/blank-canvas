import { Users, MessageSquare, Trophy, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AdminStatsCardsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    activeChallenges: number;
  };
}

const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  const cards = [
    {
      label: "Total de Usuários",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Usuários Ativos (7d)",
      value: stats.activeUsers,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total de Posts",
      value: stats.totalPosts,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Desafios Ativos",
      value: stats.activeChallenges,
      icon: Trophy,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsCards;
