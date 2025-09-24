'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useRouter } from 'next/navigation';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const SPORTS = [
  { id: 'all', name: 'Tous les sports', emoji: '🏆' },
  { id: 'football', name: 'Football', emoji: '⚽' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾' },
  { id: 'running', name: 'Course à pied', emoji: '🏃‍♂️' },
  { id: 'badminton', name: 'Badminton', emoji: '🏸' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐' },
  { id: 'cycling', name: 'Vélo', emoji: '🚴‍♂️' },
  { id: 'swimming', name: 'Natation', emoji: '🏊‍♂️' }
];

const SKILL_LEVELS = [
  { id: 'all', name: 'Tous niveaux' },
  { id: 'beginner', name: 'Débutant' },
  { id: 'intermediate', name: 'Intermédiaire' },
  { id: 'advanced', name: 'Avancé' }
];

export default function Search() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { events, loading: eventsLoading, error: eventsError, joinEvent, leaveEvent } = useEvents();

  const [filters, setFilters] = useState({
    search: '',
    sport: 'all',
    skillLevel: 'all',
    location: '',
    dateRange: 'all'
  });

  const [filteredEvents, setFilteredEvents] = useState(events);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = events;

    // Filtre par texte de recherche
    if (filters.search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (event.description?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
        event.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtre par sport
    if (filters.sport !== 'all') {
      filtered = filtered.filter(event => event.sport === filters.sport);
    }

    // Filtre par niveau
    if (filters.skillLevel !== 'all') {
      filtered = filtered.filter(event => event.skillLevel === filters.skillLevel);
    }

    // Filtre par localisation
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filtre par date
    if (filters.dateRange !== 'all') {
      const now = new Date();
      if (filters.dateRange === 'today') {
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === now.toDateString();
        });
      } else if (filters.dateRange === 'week') {
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now && eventDate <= nextWeek;
        });
      }
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

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

  const clearFilters = () => {
    setFilters({
      search: '',
      sport: 'all',
      skillLevel: 'all',
      location: '',
      dateRange: 'all'
    });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-2xl font-bold text-white">
                🔍 Recherche d&apos;événements
              </h1>
              <p className="text-purple-100">
                Trouve ta prochaine session sportive
              </p>
            </div>
            <Badge variant="info" size="md" className="bg-white/20 text-white border-white/30">
              🔥 {filteredEvents.length} résultat{filteredEvents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtres */}
        <Card variant="gradient" className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">🎯 Filtres de recherche</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-purple-600 hover:bg-purple-100"
              >
                🗑️ Effacer les filtres
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Recherche par texte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recherche
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Titre, description, lieu..."
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                />
              </div>

              {/* Filtre par sport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select
                  value={filters.sport}
                  onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                >
                  {SPORTS.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.emoji} {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par niveau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={filters.skillLevel}
                  onChange={(e) => setFilters({ ...filters, skillLevel: e.target.value })}
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par localisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="Ville, quartier..."
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                />
              </div>

              {/* Filtre par date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quand ?
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd&apos;hui</option>
                  <option value="week">Cette semaine</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <div>
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
                <p className="text-purple-600 mt-4 font-medium">Recherche en cours...</p>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card variant="glass">
              <CardContent className="text-center py-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                <span className="text-6xl mb-6 block animate-pulse">🔍</span>
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  Aucun résultat
                </h3>
                <p className="text-gray-600 mb-6">
                  Essaie de modifier tes critères de recherche
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  🗑️ Effacer les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  📍 {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/create')}
                  className="text-purple-600 hover:bg-purple-100"
                >
                  ➕ Créer un événement
                </Button>
              </div>

              {filteredEvents.map((event) => (
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
      </div>
    </div>
  );
}