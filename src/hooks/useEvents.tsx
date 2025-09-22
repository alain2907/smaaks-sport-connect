'use client';

import { useState, useEffect } from 'react';
import { Event, CreateEventData } from '@/types/event';
import { EventsService } from '@/lib/firestore';
import { useAuth } from './useAuth';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('useEvents: Attempting to load events...');
        const fetchedEvents = await EventsService.getEvents({ limit: 20 });
        console.log('useEvents: Events loaded successfully:', fetchedEvents);
        setEvents(fetchedEvents);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
        console.error('useEvents: Error loading events:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadEvents();
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = EventsService.subscribeToEvents(
      (updatedEvents) => {
        setEvents(updatedEvents);
        setLoading(false);
      },
      { limit: 20 }
    );

    return unsubscribe;
  }, []);

  const createEvent = async (eventData: CreateEventData): Promise<string | null> => {
    if (!user) {
      setError('You must be logged in to create an event');
      return null;
    }

    try {
      const eventId = await EventsService.createEvent(eventData, user.uid);
      return eventId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      return null;
    }
  };

  const joinEvent = async (eventId: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to join an event');
      return false;
    }

    try {
      await EventsService.joinEvent(eventId, user.uid);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join event');
      return false;
    }
  };

  const leaveEvent = async (eventId: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to leave an event');
      return false;
    }

    try {
      await EventsService.leaveEvent(eventId, user.uid);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave event');
      return false;
    }
  };

  const clearError = () => setError(null);

  return {
    events,
    loading,
    error,
    createEvent,
    joinEvent,
    leaveEvent,
    clearError
  };
}