import { useState } from "react";
import { Calendar, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  is_public: boolean;
}

interface AdminEventsSectionProps {
  events: AdminEvent[];
  onRefetch: () => void;
}

const AdminEventsSection = ({ events, onRefetch }: AdminEventsSectionProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate("");
    setEventTime("");
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (event: AdminEvent) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    setEventDate(event.event_date);
    setEventTime(event.event_time || "");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title || !eventDate || !user) return;
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase.from("events").update({
          title,
          description: description || null,
          event_date: eventDate,
          event_time: eventTime || null,
        }).eq("id", editingId);
        if (error) throw error;
        toast.success("Evento atualizado!");
      } else {
        const { error } = await supabase.from("events").insert({
          title,
          description: description || null,
          event_date: eventDate,
          event_time: eventTime || null,
          user_id: user.id,
          is_public: true,
          category: "personal",
          color: "blue",
        });
        if (error) throw error;
        toast.success("Evento público criado!");
      }
      resetForm();
      onRefetch();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar evento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Evento removido!");
      onRefetch();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover evento");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Eventos Públicos
        </CardTitle>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 border border-border rounded-lg space-y-3 bg-muted/30">
            <Input placeholder="Título do evento" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={loading || !title || !eventDate} size="sm">
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Evento Público"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForm}>Cancelar</Button>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento público criado ainda.</p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  {event.description && <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.event_date + "T12:00:00"), "d 'de' MMM, yyyy", { locale: ptBR })}
                    {event.event_time && ` às ${event.event_time.slice(0, 5)}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminEventsSection;
