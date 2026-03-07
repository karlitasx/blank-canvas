import { useState } from "react";
import { CalendarDays, Plus, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSupabaseEvents } from "@/hooks/useSupabaseEvents";
import AddEventModal from "@/components/agenda/AddEventModal";
import { EVENT_CATEGORIES, EVENT_COLORS } from "@/types/events";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const UpcomingEventsSection = () => {
  const { events, loading, addEvent, toggleComplete, getUpcomingEvents } = useSupabaseEvents();
  const [showAddModal, setShowAddModal] = useState(false);

  const upcomingEvents = getUpcomingEvents(7).slice(0, 5);

  const formatEventDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "EEE, d MMM", { locale: ptBR });
  };

  const getCategoryEmoji = (category: string) => {
    return EVENT_CATEGORIES.find((c) => c.value === category)?.emoji || "📌";
  };

  const getColorClass = (color: string) => {
    return EVENT_COLORS.find((c) => c.value === color)?.class || "bg-primary";
  };

  if (loading) {
    return (
      <Card className="p-4 bg-card border-border animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 bg-card border-border animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Próximos Eventos</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Link to="/agenda">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                Ver tudo
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Events List */}
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-6">
            <CalendarDays className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">
              Nenhum evento nos próximos 7 dias
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Evento
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => toggleComplete(event.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-all group",
                  event.is_completed && "opacity-50"
                )}
              >
                {/* Color indicator */}
                <div className={cn("w-1 h-10 rounded-full", getColorClass(event.color))} />

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getCategoryEmoji(event.category)}</span>
                    <span
                      className={cn(
                        "font-medium text-sm truncate",
                        event.is_completed && "line-through text-muted-foreground"
                      )}
                    >
                      {event.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium">{formatEventDate(event.event_date)}</span>
                    {event.event_time && (
                      <>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{event.event_time.slice(0, 5)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Checkbox indicator */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    event.is_completed
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30 group-hover:border-primary"
                  )}
                >
                  {event.is_completed && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}

            {events.length > 5 && (
              <Link to="/agenda" className="block">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                  +{events.length - 5} mais eventos
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      <AddEventModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={addEvent}
      />
    </>
  );
};

export default UpcomingEventsSection;
