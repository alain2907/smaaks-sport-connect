'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Event } from '@/types/event';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // TODO: Charger les vrais événements depuis Firebase
    setEvents([]);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleJoinEvent = (eventId: string) => {
    // TODO: Implémenter la logique pour rejoindre un événement
    console.log('Rejoindre événement:', eventId);
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleCreateEvent = () => {
    router.push('/create');
  };

  const getUserDisplayName = () => {
    return user.displayName || user.email?.split('@')[0] || 'Joueur';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Sport Connect
              </h1>
              <p className="text-sm text-gray-500">
                Salut {getUserDisplayName()} 👋
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateEvent}
            >
              ➕ Proposer une dispo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Suggestions personnalisées */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Suggestions pour toi
          </h2>
          <Card>
            <CardContent className="text-center py-8">
              <span className="text-4xl mb-4 block">🎯</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pas encore de suggestions
              </h3>
              <p className="text-gray-500 mb-4">
                Complète ton profil pour recevoir des suggestions personnalisées
              </p>
              <Button variant="outline" size="sm">
                Compléter mon profil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Fil des disponibilités */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Disponibilités récentes
            </h2>
            <Badge variant="info" size="sm">
              {events.length} dispos actives
            </Badge>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <span className="text-4xl mb-4 block">🏃‍♂️</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune disponibilité pour le moment
                </h3>
                <p className="text-gray-500 mb-4">
                  Sois le premier à proposer une session !
                </p>
                <Button onClick={handleCreateEvent}>
                  Créer une disponibilité
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onJoin={handleJoinEvent}
                  onView={handleViewEvent}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats rapides */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-indigo-600">0</div>
              <div className="text-sm text-gray-500">Matchs joués</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">Sports pratiqués</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600">-</div>
              <div className="text-sm text-gray-500">Note moyenne</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}