'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Event } from '@/types/event';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QuickGuide } from '@/components/onboarding/QuickGuide';
import { useEvents } from '@/hooks/useEvents';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { events, loading: eventsLoading, error: eventsError, joinEvent, leaveEvent } = useEvents();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
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

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return;

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.participantIds.includes(user.uid)) {
      await leaveEvent(eventId);
    } else {
      await joinEvent(eventId);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-2xl font-bold text-white">
                🏆 Sport Connect
              </h1>
              <p className="text-purple-100">
                Salut {getUserDisplayName()} 👋
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateEvent}
              className="shadow-xl"
            >
              ✨ Proposer une dispo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Guide rapide pour nouveaux utilisateurs */}
        {showGuide ? (
          <div className="mb-6">
            <QuickGuide
              onComplete={() => setShowGuide(false)}
            />
          </div>
        ) : (
          <div className="mb-4">
            <QuickGuide isCompact={true} />
          </div>
        )}

        {/* Suggestions personnalisées */}
        <div className="mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ✨ Suggestions pour toi
          </h2>
          <Card variant="gradient">
            <CardContent className="text-center py-8">
              <span className="text-5xl mb-4 block animate-bounce">🎯</span>
              <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Pas encore de suggestions
              </h3>
              <p className="text-gray-600 mb-6">
                Complète ton profil pour recevoir des suggestions personnalisées
              </p>
              <Button variant="gradient" size="sm">
                ✏️ Compléter mon profil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Fil des disponibilités */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              🏃‍♂️ Disponibilités récentes
            </h2>
            <Badge variant="info" size="sm">
              🔥 {events.length} dispos actives
            </Badge>
          </div>

          {eventsError ? (
            <Card variant="glass">
              <CardContent className="text-center py-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl">
                <span className="text-6xl mb-6 block">⚠️</span>
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  Erreur de connexion
                </h3>
                <p className="text-gray-600 mb-6">
                  {eventsError}
                </p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  🔄 Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : eventsLoading ? (
            <Card variant="glass">
              <CardContent className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mx-auto"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-ping rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 opacity-50"></div>
                </div>
                <p className="text-purple-600 mt-4 font-medium">Chargement des événements...</p>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card variant="glass">
              <CardContent className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                <span className="text-6xl mb-6 block animate-pulse">🏃‍♂️</span>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                  Aucune disponibilité pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Sois le premier à proposer une session !
                </p>
                <Button variant="primary" onClick={handleCreateEvent}>
                  🚀 Créer une disponibilité
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
          <Card variant="gradient" className="hover-lift">
            <CardContent className="text-center p-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm font-medium text-gray-600">⚽ Matchs joués</div>
            </CardContent>
          </Card>
          <Card variant="gradient" className="hover-lift">
            <CardContent className="text-center p-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm font-medium text-gray-600">🏃 Sports pratiqués</div>
            </CardContent>
          </Card>
          <Card variant="gradient" className="hover-lift">
            <CardContent className="text-center p-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">-</div>
              <div className="text-sm font-medium text-gray-600">⭐ Note moyenne</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}