import { Target, Check } from "lucide-react";

const habits = [
  { id: 1, name: "Beber 2L de água", done: false },
  { id: 2, name: "Meditação 10min", done: false },
  { id: 3, name: "Exercício", done: false },
];

const HabitsCard = () => {
  const completed = 4;
  const total = 7;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="glass-card p-6 animate-slide-up animation-delay-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg logo-gradient">
          <Target className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-lg">Hábitos Hoje</h3>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-glass-border"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(270, 70%, 60%)" />
                <stop offset="100%" stopColor="hsl(330, 80%, 65%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{percentage}%</span>
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold">
            {completed}<span className="text-muted-foreground text-lg">/{total}</span>
          </p>
          <p className="text-sm text-muted-foreground">completos</p>
        </div>
      </div>

      {/* Mini habit list */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Próximos</p>
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground group-hover:border-primary transition-colors flex items-center justify-center">
              {habit.done && <Check className="w-3 h-3 text-primary" />}
            </div>
            <span className="text-sm">{habit.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitsCard;
