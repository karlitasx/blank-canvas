import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2 } from "lucide-react";

const COLORS = ["blue", "green", "red", "purple", "orange", "pink"];

const CalendarPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [color, setColor] = useState("blue");

  const fetchData = async () => {
    if (!user) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString().split("T")[0];
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data } = await supabase
      .from("events")
      .select("*")
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .gte("event_date", start)
      .lte("event_date", end)
      .order("event_date");
    setEvents(data || []);
  };

  useEffect(() => { fetchData(); }, [user, currentDate]);

  const createEvent = async () => {
    if (!user || !title || !eventDate) return;
    const { error } = await supabase.from("events").insert({
      user_id: user.id, title, event_date: eventDate, event_time: eventTime || null, color,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Evento criado!");
    setTitle(""); setOpen(false);
    fetchData();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    fetchData();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.event_date === dateStr);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">Organize seus eventos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Evento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Reunião" />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Horário (opcional)</Label>
                <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={createEvent} className="w-full">Criar Evento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg capitalize">{monthName}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div key={d} className="text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {blanks.map((b) => <div key={`blank-${b}`} />)}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === todayStr;
              return (
                <div key={day} className={`p-1 min-h-[60px] rounded border text-xs ${isToday ? "border-primary bg-primary/5" : "border-transparent"}`}>
                  <div className={`font-medium ${isToday ? "text-primary" : ""}`}>{day}</div>
                  {dayEvents.slice(0, 2).map((e) => (
                    <div key={e.id} className="mt-0.5 truncate rounded px-1 text-[10px]" style={{ backgroundColor: `${e.color}20`, color: e.color }}>
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.filter((e) => e.event_date >= todayStr).slice(0, 10).map((e) => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} />
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.event_date} {e.event_time || ""}</p>
                </div>
              </div>
              <button onClick={() => deleteEvent(e.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-muted-foreground">Nenhum evento este mês</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
