import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Event, EVENT_COLORS } from "@/types/events";
import { isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaCalendarProps {
  events: Event[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const AgendaCalendar = ({ events, selectedDate, onSelectDate }: AgendaCalendarProps) => {
  // Get dates that have events
  const eventDates = events.reduce((acc, event) => {
    const dateStr = event.event_date;
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event.color);
    return acc;
  }, {} as Record<string, string[]>);

  const modifiers = {
    hasEvent: (date: Date) => {
      const dateStr = date.toISOString().split("T")[0];
      return !!eventDates[dateStr];
    },
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: "bold" as const,
    },
  };

  return (
    <Card className="p-4 bg-card border-border">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        locale={ptBR}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="pointer-events-auto"
        components={{
          DayContent: ({ date }) => {
            const dateStr = date.toISOString().split("T")[0];
            const colors = eventDates[dateStr] || [];
            const uniqueColors = [...new Set(colors)].slice(0, 3);

            return (
              <div className="relative flex flex-col items-center">
                <span>{date.getDate()}</span>
                {uniqueColors.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {uniqueColors.map((color, i) => {
                      const colorClass = EVENT_COLORS.find((c) => c.value === color)?.class || "bg-primary";
                      return (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        }}
      />
    </Card>
  );
};

export default AgendaCalendar;
