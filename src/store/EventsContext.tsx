'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Event, PlanType, FormatType, EventType } from '@/data/mock/events';
import { createClient } from '@/utils/supabase/client';
import { broadcastChange, subscribeToSync } from '@/lib/syncService';

interface EventsContextType {
  events: Event[];
  isLoaded: boolean;
  addEvent: (event: Partial<Event>, extraRow?: Record<string, unknown>) => Promise<string | null>;
  /** Met à jour des colonnes de l'événement (détails, date, lieu…) */
  updateEventFields: (id: string, row: Record<string, unknown>) => Promise<void>;
  updateEventPlan: (id: string, newPlan: PlanType) => Promise<void>;
  updateEventStatus: (id: string, newStatus: "draft" | "published" | "completed") => Promise<void>;
  updateEventInvitation: (id: string, title: string, message: string) => Promise<void>;
  updateEventInvitationContent: (id: string, content: Record<string, unknown>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  const lastFetchTime = useRef(0);
  const isFetchingRef = useRef(false);
  const isDashboardRoute = Boolean(pathname && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')));

  const fetchEvents = useCallback(async (force = false) => {
    // Sur les pages publiques, ne pas lancer de requête automatique si ce n'est pas un appel forcé (ex: après ajout d'événement)
    if (!force && typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (!p.startsWith('/dashboard') && !p.startsWith('/admin')) {
        return;
      }
    }

    if (isFetchingRef.current) return;

    const now = Date.now();
    // Cache de 10s uniquement si non forcé et si des événements sont déjà chargés en mémoire
    if (!force && events.length > 0 && now - lastFetchTime.current < 10000) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchTime.current = now;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvents([]);
        setIsLoaded(true);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
      }

      if (data) {
        // Fetch guests for these events to calculate RSVP indicators
        const eventIds = data.map((e: any) => e.id);
        const { data: guestsData } = eventIds.length > 0 ? await supabase
          .from('guests')
          .select('event_id, statut_rsvp, nombre_accompagnants')
          .in('event_id', eventIds) : { data: [] };

        const formattedEvents: Event[] = data.map((dbEvent: any) => {
          const eventGuests = (guestsData || []).filter((g: any) => g.event_id === dbEvent.id);

          let confirmed = 0;
          let declined = 0;

          eventGuests.forEach((g: any) => {
            if (g.statut_rsvp === 'Confirmé') {
              confirmed += 1 + (g.nombre_accompagnants || 0);
            } else if (g.statut_rsvp === 'Refusé') {
              declined += 1;
            }
          });

          // The total is the planned capacity, or the total responses if it exceeds capacity
          const totalCapacity = dbEvent.guests_count || 0;
          const totalResponses = eventGuests.length + eventGuests.reduce((acc: number, g: any) => acc + (g.nombre_accompagnants || 0), 0);
          const pending = Math.max(0, totalCapacity - confirmed - declined);

          return {
            id: dbEvent.id,
            name: dbEvent.name,
            type: dbEvent.type as EventType,
            date: dbEvent.date || "À définir",
            time: dbEvent.time || "À définir",
            location: dbEvent.location || "À définir",
            guestsCount: dbEvent.guests_count || 0,
            plan: dbEvent.plan as PlanType,
            format: dbEvent.format as FormatType,
            status: dbEvent.status,
            invitationModelId: dbEvent.invitation_model_id,
            invitationTitle: dbEvent.invitation_title,
            invitationMessage: dbEvent.invitation_message,
            invitationContent: dbEvent.invitation_content ?? null,
            eventDetails: dbEvent.event_details ?? null,
            budget: { total: Number(dbEvent.budget_total) || 0, spent: 0 },
            guests: {
              total: Math.max(totalCapacity, totalResponses),
              confirmed,
              pending,
              declined
            },
            tasks: { total: 0, completed: 0 },
            providersCount: 0
          };
        });
        setEvents(formattedEvents);
      }
    } catch (err) {
      console.error("Unexpected error in fetchEvents:", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoaded(true);
    }
  }, [supabase]);

  // Déclencher le chargement dès qu'on est sur une route dashboard
  useEffect(() => {
    if (!isDashboardRoute) return;

    fetchEvents(true);

    const unsubSync = subscribeToSync("events", () => fetchEvents(true));

    const channel = supabase
      .channel("user_events_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents(true))
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => fetchEvents(true))
      .subscribe();

    return () => {
      unsubSync();
      supabase.removeChannel(channel);
    };
  }, [isDashboardRoute, fetchEvents, supabase]);

  // Écouter les changements d'état d'authentification (connexion, rafraîchissement token...)
  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchEvents(true);
      } else {
        setEvents([]);
        setIsLoaded(true);
      }
    });

    return () => {
      authSub?.unsubscribe();
    };
  }, [supabase, fetchEvents]);

  const addEvent = useCallback(async (event: Partial<Event>, extraRow?: Record<string, unknown>): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const row: Record<string, unknown> = {
      client_id: user.id,
      name: event.name,
      type: event.type,
      date: (event.date && event.date !== "À définir" && event.date.trim() !== "") ? event.date : null,
      time: (event.time && event.time !== "À définir" && event.time.trim() !== "") ? event.time : null,
      location: (event.location && event.location !== "À définir" && event.location.trim() !== "") ? event.location : null,
      guests_count: event.guestsCount,
      plan: event.plan,
      format: event.format,
      status: event.status || 'draft',
      invitation_model_id: event.invitationModelId,
      invitation_title: event.invitationTitle,
      invitation_message: event.invitationMessage
    };
    if (event.invitationContent) row.invitation_content = event.invitationContent;
    if (extraRow) Object.assign(row, extraRow);

    let { data, error } = await supabase.from('events').insert([row]).select().single();

    // Colonne event_details absente tant que le script SQL n'a pas été exécuté
    if (error && row.event_details && error.message?.includes('event_details')) {
      delete row.event_details;
      ({ data, error } = await supabase.from('events').insert([row]).select().single());
    }

    // Column not created yet (see supabase_invitation_content.sql): keep the event, drop the custom content
    if (error && row.invitation_content && error.message?.includes('invitation_content')) {
      console.warn("Colonne invitation_content absente — contenu de l'invitation non enregistré.");
      delete row.invitation_content;
      ({ data, error } = await supabase.from('events').insert([row]).select().single());
    }

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    if (data) {
      broadcastChange("events");
      await fetchEvents(true);
      return data.id;
    }
    return null;
  }, [supabase, fetchEvents]);

  const updateEventFields = useCallback(async (id: string, row: Record<string, unknown>) => {
    let { error } = await supabase.from('events').update(row).eq('id', id);
    if (error && 'event_details' in row && error.message?.includes('event_details')) {
      const { event_details: _omit, ...rest } = row;
      ({ error } = await supabase.from('events').update(rest).eq('id', id));
      if (!error) {
        broadcastChange("events");
        await fetchEvents(true);
        throw new Error("Les informations principales sont enregistrées, mais pas le thème, le programme ni les notes : exécutez le script « supabase_evenements_details.sql » dans Supabase.");
      }
    }
    if (error) throw error;
    broadcastChange("events");
    await fetchEvents(true);
  }, [supabase, fetchEvents]);

  const updateEventPlan = useCallback(async (id: string, newPlan: PlanType) => {
    const { error } = await supabase.from('events').update({ plan: newPlan }).eq('id', id);
    if (!error) {
      broadcastChange("events");
      await fetchEvents(true);
    }
  }, [supabase, fetchEvents]);

  const updateEventStatus = useCallback(async (id: string, newStatus: "draft" | "published" | "completed") => {
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', id);
    if (!error) {
      broadcastChange("events");
      await fetchEvents(true);
    }
  }, [supabase, fetchEvents]);

  const updateEventInvitation = useCallback(async (id: string, title: string, message: string) => {
    const { error } = await supabase.from('events').update({
      invitation_title: title,
      invitation_message: message
    }).eq('id', id);
    if (!error) {
      broadcastChange("events");
      await fetchEvents(true);
    }
  }, [supabase, fetchEvents]);

  const updateEventInvitationContent = useCallback(async (id: string, content: Record<string, unknown>) => {
    const { error } = await supabase.from('events').update({ invitation_content: content }).eq('id', id);
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    broadcastChange("events");
    await fetchEvents(true);
  }, [supabase, fetchEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }
    broadcastChange("events");
    await fetchEvents(true);
  }, [supabase, fetchEvents]);

  const refreshEvents = useCallback(async () => {
    await fetchEvents(true);
  }, [fetchEvents]);

  return (
    <EventsContext.Provider value={{ events, isLoaded, addEvent, updateEventFields, updateEventPlan, updateEventStatus, updateEventInvitation, updateEventInvitationContent, deleteEvent, refreshEvents }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
