import { Flame } from "lucide-react";

const StreakCard = () => {
  const currentStreak = 12;
  const bestStreak = 21;

  // Generate last 30 days (mock data)
  const last30Days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    completed: Math.random() > 0.3,
  }));

  return (
    <div className="glass-card p-6 animate-slide-up animation-delay-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg logo-gradient">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-lg">Streak</h3>
      </div>

      {/* Current Streak */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Flame className="w-16 h-16 text-accent animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold mt-2">{currentStreak}</span>
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold">{currentStreak} dias</p>
          <p className="text-sm text-muted-foreground">
            Recorde: {bestStreak} dias 🏆
          </p>
        </div>
      </div>

      {/* Mini Calendar */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Últimos 30 dias
        </p>
        <div className="grid grid-cols-10 gap-1">
          {last30Days.map((day) => (
            <div
              key={day.day}
              className={`aspect-square rounded-sm transition-all duration-300 ${
                day.completed
                  ? "bg-gradient-to-br from-primary to-accent"
                  : "bg-glass"
              }`}
              title={`Dia ${day.day}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
