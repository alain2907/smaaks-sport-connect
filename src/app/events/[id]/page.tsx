'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types/event';
import { EventsService } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const SPORTS_EMOJI: { [key: string]: string } = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  running: '🏃‍♂️',
  badminton: '🏸',
  volleyball: '🏐',
  cycling: '🚴‍♂️',
  swimming: '🏊‍♂️'
};

const SKILL_LEVEL_LABELS: { [key: string]: string } = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  all: 'Tous niveaux'
};

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { joinEvent, leaveEvent } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && eventId) {
      loadEvent();
    }
  }, [user, authLoading, eventId, router]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventData = await EventsService.getEventById(eventId);
      setEvent(eventData);
    } catch (err) {
      setError('Événement non trouvé');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!event || !user) return;

    setActionLoading(true);
    try {
      const isParticipant = event.participantIds.includes(user.uid);

      if (isParticipant) {
        await leaveEvent(eventId);
      } else {
        await joinEvent(eventId);
      }

      // Reload event to get updated participant list
      await loadEvent();
    } catch {
      setError('Erreur lors de l&apos;action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
          <div className="absolute top-0 left-0 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 opacity-50"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-20">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20 mr-4"
              >
                ← Retour
              </Button>
              <h1 className="text-2xl font-bold text-white">
                Événement introuvable
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card variant="glass">
            <CardContent className="text-center py-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl">
              <span className="text-6xl mb-6 block">❌</span>
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Événement non trouvé
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Button variant="primary" onClick={() => router.push('/search')}>
                🔍 Voir tous les événements
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isParticipant = event.participantIds.includes(user.uid);
  const isCreator = event.creatorId === user.uid;
  const isFull = event.participantIds.length >= event.maxParticipants;
  const sportEmoji = SPORTS_EMOJI[event.sport] || '🏃‍♂️';
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 mr-4"
            >
              ← Retour
            </Button>
            <div className="flex items-center">
              <span className="text-3xl mr-3">{sportEmoji}</span>
              <h1 className="text-2xl font-bold text-white">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Main Event Info */}
        <Card variant="gradient">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    📅 Quand ?
                  </h2>
                  <p className="text-lg text-gray-800">
                    {formatDate(eventDate)}
                  </p>
                  {isPastEvent && (
                    <Badge variant="warning" className="mt-2">
                      ⏰ Événement passé
                    </Badge>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    📍 Où ?
                  </h2>
                  <p className="text-lg text-gray-800">
                    {event.location}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    🎯 Niveau
                  </h2>
                  <Badge variant="info" size="md">
                    {SKILL_LEVEL_LABELS[event.skillLevel]}
                  </Badge>
                </div>

                {event.equipment && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      🎒 Équipement
                    </h2>
                    <p className="text-gray-800">
                      {event.equipment}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    👥 Participants
                  </h2>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge
                      variant={isFull ? "warning" : "success"}
                      size="md"
                    >
                      {event.participantIds.length}/{event.maxParticipants}
                    </Badge>
                    {isFull && (
                      <Badge variant="warning">
                        Complet
                      </Badge>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {event.participantIds.length > 0 ? 'Participants inscrits:' : 'Aucun participant pour le moment'}
                    </p>
                    <div className="space-y-1">
                      {event.participantIds.map((participantId, index) => (
                        <div key={participantId} className="flex items-center space-x-2">
                          <span className="text-purple-600">
                            {participantId === event.creatorId ? '👑' : '👤'}
                          </span>
                          <span className="text-sm text-gray-800">
                            {participantId === event.creatorId ? 'Organisateur' : `Participant ${index + 1}`}
                            {participantId === user.uid && ' (Vous)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      📝 Description
                    </h2>
                    <p className="text-gray-800 bg-gray-50 rounded-xl p-4">
                      {event.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isPastEvent && (
          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isCreator ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Badge variant="success" size="md" className="text-center">
                      🎯 Vous êtes l&apos;organisateur
                    </Badge>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => router.push(`/events/${eventId}/edit`)}
                      className="border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      ✏️ Modifier l&apos;événement
                    </Button>
                  </div>
                ) : (
                  <>
                    {isParticipant ? (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleJoinLeave}
                        disabled={actionLoading}
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {actionLoading ? '⏳ En cours...' : '❌ Se désinscrire'}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleJoinLeave}
                        disabled={actionLoading || isFull}
                        className="flex-1"
                      >
                        {actionLoading ? '⏳ En cours...' : isFull ? '🚫 Complet' : '✅ Rejoindre'}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => router.push('/search')}
                      className="flex-1"
                    >
                      🔍 Voir d&apos;autres événements
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}