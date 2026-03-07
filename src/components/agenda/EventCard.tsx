import { Event, EVENT_CATEGORIES, EVENT_COLORS } from "@/types/events";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const EventCard = ({ event, onToggleComplete, onDelete }: EventCardProps) => {
  const category = EVENT_CATEGORIES.find((c) => c.value === event.category);
  const colorClass = EVENT_COLORS.find((c) => c.value === event.color)?.class || "bg-blue-500";

  const formatTime = (time: string | null | undefined) => {
    if (!time) return null;
    return time.substring(0, 5); // HH:mm
  };

  return (
    <Card
      className={`p-3 border-l-4 transition-all ${
        event.is_completed ? "opacity-60" : ""
      }`}
      style={{ borderLeftColor: `var(--${event.color}-500, hsl(var(--primary)))` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${colorClass}`} />
            <span className="text-xs text-muted-foreground">
              {category?.emoji} {category?.label}
            </span>
          </div>

          <h4
            className={`font-medium text-foreground truncate ${
              event.is_completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {event.title}
          </h4>

          {event.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          )}

          {(event.event_time || event.end_time) && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatTime(event.event_time)}
                {event.end_time && ` - ${formatTime(event.end_time)}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${event.is_completed ? "text-green-500" : ""}`}
            onClick={() => onToggleComplete(event.id)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(event.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
