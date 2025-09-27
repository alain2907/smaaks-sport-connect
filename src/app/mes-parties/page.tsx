'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BottomTabs } from '@/components/navigation/BottomTabs';
import { useAuth } from '@/hooks/useAuth';
import { EventsService } from '@/lib/firestore';
import { Event } from '@/types/event';

export default function MesPartiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<{
    participating: Event[];
    created: Event[];
    pending: Event[];
  }>({ participating: [], created: [], pending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || authLoading) return;

    const loadUserEvents = async () => {
      try {
        setLoading(true);
        const userEvents = await EventsService.getUserEvents(user.uid);
        setEvents({
          participating: userEvents.participating,
          created: userEvents.created,
          pending: userEvents.pending
        });
      } catch (err) {
        console.error('Error loading user events:', err);
        setError('Erreur lors du chargement de vos parties');
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <div className="text-xl text-gray-600">Chargement de vos parties...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
        <div className="max-w-4xl mx-auto p-4 pt-8">
          <Card className="text-center">
            <CardContent className="py-8">
              <div className="text-6xl mb-4">😞</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Une erreur est survenue</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                🔄 Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomTabs />
      </div>
    );
  }

  const allEvents = [...events.participating, ...events.created];
  const nextEvent = allEvents
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const hasEvents = events.participating.length > 0 || events.created.length > 0 || events.pending.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Header */}
        <Card variant="gradient" className="mb-6">
          <CardHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">⚽</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Mes Parties
              </h1>
              <p className="text-gray-600">
                Gérez vos événements sportifs et participations
              </p>
            </div>
          </CardHeader>
        </Card>

        {!hasEvents ? (
          // Empty state
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="text-8xl mb-6">🏃‍♂️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Aucune partie programmée
              </h2>
              <p className="text-gray-600 mb-8">
                Vous n&apos;avez pas encore de parties prévues. Créez votre premier événement ou rejoignez une partie existante !
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/create')}
                >
                  🚀 Créer un événement
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/search')}
                >
                  🔍 Chercher des parties
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Prochaine partie */}
            {nextEvent && (
              <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <CardHeader>
                  <h2 className="text-xl font-bold text-green-700 flex items-center">
                    🎯 Prochaine partie
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{nextEvent.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>📅 {new Date(nextEvent.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📍 {nextEvent.location}</span>
                        <Badge variant="info" className="text-xs">{nextEvent.sport}</Badge>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/events/${nextEvent.id}`)}
                      >
                        ▶️ Voir l&apos;événement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parties où je participe */}
            {events.participating.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-800">🏃‍♂️ Je participe ({events.participating.length})</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.participating.map((event) => (
                      <div key={event.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{event.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}</p>
                            <p className="text-sm text-gray-600">📍 {event.location}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="info">{event.sport}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/events/${event.id}`)}
                            >
                              Voir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mes événements créés */}
            {events.created.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-800">🎯 Mes événements ({events.created.length})</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.created.map((event) => (
                      <div key={event.id} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{event.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}</p>
                            <p className="text-sm text-gray-600 mb-2">📍 {event.location}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                👥 {event.participantIds ? event.participantIds.length : 0}/{event.maxParticipants}
                              </span>
                              {event.participantRequests && event.participantRequests.filter(req => req.status === 'pending').length > 0 && (
                                <Badge variant="warning" className="text-xs">
                                  {event.participantRequests.filter(req => req.status === 'pending').length} demandes
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="success">{event.sport}</Badge>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => router.push(`/events/${event.id}`)}
                            >
                              Gérer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Demandes en attente */}
            {events.pending.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-800">⏳ Demandes en attente ({events.pending.length})</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.pending.map((event) => (
                      <div key={event.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{event.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}</p>
                            <p className="text-sm text-gray-600">📍 {event.location}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="warning">En attente</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/events/${event.id}`)}
                            >
                              Voir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Actions */}
        <Card className="text-center">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/create')}
              >
                ➕ Créer un événement
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/search')}
              >
                🔍 Chercher des parties
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomTabs />
    </div>
  );
}