import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, List, CalendarDays } from "lucide-react";
import { useSupabaseEvents } from "@/hooks/useSupabaseEvents";
import AgendaCalendar from "@/components/agenda/AgendaCalendar";
import EventsList from "@/components/agenda/EventsList";
import AddEventModal from "@/components/agenda/AddEventModal";
import { format, startOfToday, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const Agenda = () => {
  const { events, loading, addEvent, toggleComplete, deleteEvent, getEventsForDate, getUpcomingEvents } = useSupabaseEvents();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const filteredEvents = selectedDate
    ? getEventsForDate(selectedDate)
    : activeTab === "upcoming"
    ? getUpcomingEvents(30)
    : events;

  const handleClearDateFilter = () => {
    setSelectedDate(undefined);
  };

  if (loading) {
    return (
      <DashboardLayout activeNav="/agenda">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeNav="/agenda">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl p-8 text-center mb-6">
        <h1 className="text-3xl font-extrabold text-primary-foreground mb-2">
          Agenda de Eventos
        </h1>
        <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-md mx-auto">
          Fique por dentro de todos os eventos da comunidade. Participe de workshops, lives, podcasts, aulas ao vivo, clube do livro e muito mais!
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-muted-foreground text-sm">
            Organize seus compromissos e eventos
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Sidebar */}
        <div className="space-y-4">
          <AgendaCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDateFilter}
              className="w-full"
            >
              Limpar filtro de data
            </Button>
          )}

          {/* Quick Stats */}
          <Card className="p-4 bg-card border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Resumo
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hoje</span>
                <span className="font-medium text-foreground">
                  {getEventsForDate(new Date()).length} eventos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Esta semana</span>
                <span className="font-medium text-foreground">
                  {getUpcomingEvents(7).length} eventos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium text-foreground">
                  {events.length} eventos
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Events List */}
        <div className="lg:col-span-2">
          {selectedDate ? (
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4 capitalize">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h2>
              <EventsList
                events={filteredEvents}
                onToggleComplete={toggleComplete}
                onDelete={deleteEvent}
                selectedDate={selectedDate}
              />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Próximos
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  <List className="h-4 w-4" />
                  Todos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                <EventsList
                  events={filteredEvents}
                  onToggleComplete={toggleComplete}
                  onDelete={deleteEvent}
                />
              </TabsContent>

              <TabsContent value="all">
                <EventsList
                  events={events}
                  onToggleComplete={toggleComplete}
                  onDelete={deleteEvent}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={addEvent}
        selectedDate={selectedDate}
      />
    </DashboardLayout>
  );
};

export default Agenda;
