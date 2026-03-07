import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";
import type { SelfCareCheckIn } from "@/hooks/useSelfCare";

const emotionToValue: Record<string, number> = {
  energized: 9,
  motivated: 8,
  proud: 7,
  neutral: 5,
  tired: 3,
  anxious: 2,
};

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface Props {
  weeklyCheckIns: SelfCareCheckIn[];
}

const WeeklyEvolution = ({ weeklyCheckIns }: Props) => {
  const chartData = useMemo(() => {
    return dayLabels.map((day, i) => {
      const targetDay = i + 1; // 1=Mon ... 7=Sun
      const checkIn = weeklyCheckIns.find(c => {
        const d = new Date(c.checkin_date + "T12:00:00");
        const dow = d.getDay();
        return (dow === 0 ? 7 : dow) === targetDay;
      });
      return {
        day,
        humor: checkIn ? (emotionToValue[checkIn.emotional_state] || 5) : 0,
        energia: checkIn ? checkIn.energy_level : 0,
      };
    });
  }, [weeklyCheckIns]);

  const hasData = weeklyCheckIns.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-6">
        <TrendingUp className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Faça check-ins durante a semana para ver sua evolução
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h3 className="font-medium text-sm">Evolução Semanal</h3>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Line type="monotone" dataKey="humor" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} name="Humor" />
            <Line type="monotone" dataKey="energia" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))", r: 3 }} name="Energia" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Humor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="text-xs text-muted-foreground">Energia</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyEvolution;
