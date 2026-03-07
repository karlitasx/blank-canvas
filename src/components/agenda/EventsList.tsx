import { Event } from "@/types/events";
import EventCard from "./EventCard";
import { CalendarX } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventsListProps {
  events: Event[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  selectedDate?: Date;
}

const EventsList = ({ events, onToggleComplete, onDelete, selectedDate }: EventsListProps) => {
  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.event_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">
          {selectedDate ? "Nenhum evento neste dia" : "Nenhum evento ainda"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedDate
            ? "Clique em 'Novo Evento' para adicionar"
            : "Comece a organizar sua agenda!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateStr) => (
        <div key={dateStr}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
            {formatDateHeader(dateStr)}
          </h3>
          <div className="space-y-3">
            {groupedEvents[dateStr]
              .sort((a, b) => {
                if (!a.event_time && !b.event_time) return 0;
                if (!a.event_time) return 1;
                if (!b.event_time) return -1;
                return a.event_time.localeCompare(b.event_time);
              })
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsList;
