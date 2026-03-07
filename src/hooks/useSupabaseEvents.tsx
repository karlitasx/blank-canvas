import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Event, CreateEventInput, EventCategory, EventColor } from "@/types/events";
import { toast } from "sonner";

export const useSupabaseEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order("event_date", { ascending: true });

      if (error) throw error;
      
      setEvents((data || []) as Event[]);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchEvents]);

  const addEvent = async (input: CreateEventInput) => {
    if (!user) return null;

    try {
      const newEvent = {
        ...input,
        user_id: user.id,
        category: input.category || 'personal',
        color: input.color || 'blue',
        is_recurring: input.is_recurring || false,
        is_completed: false,
      };

      const { data, error } = await supabase
        .from("events")
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) => [...prev, data as Event].sort((a, b) => 
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
      
      toast.success("Evento criado!");
      return data as Event;
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Erro ao criar evento");
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CreateEventInput>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
      
      toast.success("Evento atualizado!");
      return true;
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Erro ao atualizar evento");
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Evento removido!");
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Erro ao remover evento");
      return false;
    }
  };

  const toggleComplete = async (id: string) => {
    const event = events.find((e) => e.id === id);
    if (!event) return false;

    return updateEvent(id, { is_completed: !event.is_completed } as any);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => e.event_date === dateStr);
  };

  const getUpcomingEvents = (days: number = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return events.filter((e) => {
      const eventDate = new Date(e.event_date);
      return eventDate >= today && eventDate <= futureDate && !e.is_completed;
    });
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleComplete,
    getEventsForDate,
    getUpcomingEvents,
    refetch: fetchEvents,
  };
};
