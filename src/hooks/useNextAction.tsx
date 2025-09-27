'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EventsService } from '@/lib/firestore';
import { Event } from '@/types/event';

export interface NextAction {
  type: 'next_event' | 'search' | 'create';
  url: string;
  label: string;
  event?: Event;
}

export function useNextAction(): { nextAction: NextAction | null; loading: boolean } {
  const { user } = useAuth();
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNextAction({
        type: 'create',
        url: '/create',
        label: 'Créer un événement'
      });
      setLoading(false);
      return;
    }

    const determineNextAction = async () => {
      try {
        setLoading(true);

        // Récupérer les événements de l'utilisateur
        const userEvents = await EventsService.getUserEvents(user.uid);

        // 1. Vérifier s'il y a une prochaine partie (créée ou participation)
        const allUpcomingEvents = [...userEvents.participating, ...userEvents.created];
        const nextEvent = allUpcomingEvents
          .filter(event => new Date(event.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        if (nextEvent) {
          setNextAction({
            type: 'next_event',
            url: `/events/${nextEvent.id}`,
            label: 'Prochaine partie',
            event: nextEvent
          });
          return;
        }

        // 2. S'il n'y a pas de prochaine partie, mais qu'il y a des demandes en attente
        if (userEvents.pending.length > 0) {
          setNextAction({
            type: 'search',
            url: '/mes-parties',
            label: 'Mes demandes'
          });
          return;
        }

        // 3. Vérifier s'il y a des événements disponibles à rejoindre
        const availableEvents = await EventsService.getEvents({ limit: 10 });
        const joinableEvents = availableEvents.filter(event => {
          const eventDate = new Date(event.date);
          const now = new Date();
          return eventDate > now &&
                 event.creatorId !== user.uid &&
                 !event.participantIds?.includes(user.uid) &&
                 (!event.participantRequests || !event.participantRequests.some(req => req.userId === user.uid));
        });

        if (joinableEvents.length > 0) {
          setNextAction({
            type: 'search',
            url: '/search',
            label: 'Chercher des parties'
          });
          return;
        }

        // 4. Sinon, proposer de créer un événement
        setNextAction({
          type: 'create',
          url: '/create',
          label: 'Créer un événement'
        });

      } catch (error) {
        console.error('Error determining next action:', error);
        // En cas d'erreur, fallback sur créer un événement
        setNextAction({
          type: 'create',
          url: '/create',
          label: 'Créer un événement'
        });
      } finally {
        setLoading(false);
      }
    };

    determineNextAction();
  }, [user]);

  return { nextAction, loading };
}