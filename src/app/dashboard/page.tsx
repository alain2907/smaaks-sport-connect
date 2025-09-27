'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QuickGuide } from '@/components/onboarding/QuickGuide';
import { useEvents } from '@/hooks/useEvents';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Footer } from '@/components/layout/Footer';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { events, loading: eventsLoading, error: eventsError, joinEvent, leaveEvent } = useEvents();
  const [showGuide, setShowGuide] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    location?: string;
    favoriteSports?: string[];
    skillLevels?: Record<string, string>;
    sports?: Array<{ sportId: string; level: string }>;
  } | null>(null);

  // Séparer les événements futurs et passés en utilisant l'heure de Paris
  const getParisTime = () => {
    const now = new Date();
    // Convertir en heure de Paris
    return new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
  };

  const nowParis = getParisTime();

  // Calculer les dates de référence en heure de Paris
  const todayStartParis = new Date(nowParis);
  todayStartParis.setHours(0, 0, 0, 0);

  const tomorrowStartParis = new Date(todayStartParis);
  tomorrowStartParis.setDate(tomorrowStartParis.getDate() + 1);

  const tomorrowEndParis = new Date(tomorrowStartParis);
  tomorrowEndParis.setDate(tomorrowEndParis.getDate() + 1);

  // Événements d'aujourd'hui (futurs uniquement)
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const eventParis = new Date(eventDate.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    return eventParis > nowParis && eventParis < tomorrowStartParis;
  });

  // Événements de demain et plus tard
  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const eventParis = new Date(eventDate.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    return eventParis >= tomorrowStartParis;
  });

  // Événements passés
  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const eventParis = new Date(eventDate.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
    return eventParis <= nowParis;
  });

  // Load user profile for suggestions
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || !db) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    if (user && db) {
      loadUserProfile();
    }
  }, [user, db]);

  // Algorithm to generate personalized suggestions
  const suggestedEvents = useMemo(() => {
    if (!user || !events.length || !userProfile) {
      return [];
    }

    const userPreferences = {
      location: userProfile.location || '',
      favoriteSports: userProfile.favoriteSports || [],
      skillLevels: userProfile.skillLevels || {},
      sports: userProfile.sports || []
    };

    const now = new Date();
    const eligibleEvents = events.filter(event => {
      const isCreator = event.creatorId === user.uid;
      const isParticipant = event.participantIds.includes(user.uid);
      const isPast = new Date(event.date) <= now;
      const isFull = event.participantIds.length >= event.maxParticipants;

      return !isCreator && !isParticipant && !isPast && !isFull;
    });


    const eventsWithScores = eligibleEvents.map(event => {
        let score = 0;
        const scoreDetails: Record<string, number> = {
          sport: 0,
          location: 0,
          skillLevel: 0,
          recency: 0,
          availability: 0,
          dateProximity: 0
        };

        // Sport preference matching (high weight)
        if (userPreferences.favoriteSports.includes(event.sport)) {
          score += 50;
          scoreDetails.sport += 50;
        }

        // Alternative: check if user has this sport in their profile
        const userSport = userPreferences.sports.find((s: { sportId: string; level: string }) => s.sportId === event.sport);
        if (userSport) {
          score += 40;
          scoreDetails.sport += 40;
        }

        // Location proximity (medium weight)
        if (userPreferences.location && event.location.toLowerCase().includes(userPreferences.location.toLowerCase())) {
          score += 30;
          scoreDetails.location += 30;
        }

        // Skill level matching (medium weight)
        if (event.skillLevel === 'all') {
          score += 25;
          scoreDetails.skillLevel += 25;
        } else if (userSport && userSport.level === event.skillLevel) {
          score += 35; // Higher score for exact skill match
          scoreDetails.skillLevel += 35;
        } else if (userPreferences.skillLevels[event.sport] === event.skillLevel) {
          score += 35;
          scoreDetails.skillLevel += 35;
        }

        // Recency bonus (events created recently)
        const daysSinceCreated = Math.floor(
          (new Date().getTime() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreated <= 1) {
          score += 20;
          scoreDetails.recency += 20;
        } else if (daysSinceCreated <= 3) {
          score += 10;
          scoreDetails.recency += 10;
        }

        // Availability (events with spaces available get higher score)
        const spotsAvailable = event.maxParticipants - event.participantIds.length;
        if (spotsAvailable > 0) {
          const availabilityPoints = Math.min(spotsAvailable * 5, 15);
          score += availabilityPoints;
          scoreDetails.availability += availabilityPoints;
        }

        // Date proximity (events happening soon get slight boost)
        const daysUntilEvent = Math.floor(
          (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilEvent <= 2) {
          score += 10;
          scoreDetails.dateProximity += 10;
        } else if (daysUntilEvent <= 7) {
          score += 5;
          scoreDetails.dateProximity += 5;
        }

        return { ...event, score };
      });

    const scoredEvents = eventsWithScores
      .sort((a, b) => b.score - a.score)
      .filter(event => event.score > 0) // Only show events with some score
      .slice(0, 3); // Top 3 suggestions

    return scoredEvents;
  }, [user, events, userProfile]);

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
            🎯 Suggestions pour toi
          </h2>
          {suggestedEvents.length > 0 ? (
            <div className="space-y-4">
              {suggestedEvents.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge variant="success" size="sm">
                      ✨ {event.score}% match
                    </Badge>
                  </div>
                  <EventCard
                    event={event}
                    onJoin={handleJoinEvent}
                    onView={handleViewEvent}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card variant="gradient">
              <CardContent className="text-center py-8">
                <span className="text-5xl mb-4 block animate-bounce">🎯</span>
                <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Aucune suggestion disponible
                </h3>
                <p className="text-gray-600 mb-6">
                  {!userProfile ?
                    'Chargement de votre profil...' :
                    !userProfile.location ?
                    'Ajoutez votre ville dans votre profil pour recevoir des suggestions' :
                    !userProfile.favoriteSports?.length && !userProfile.sports?.length ?
                    'Ajoutez vos sports favoris dans votre profil pour recevoir des suggestions' :
                    events.length === 0 ?
                    'Aucun événement disponible pour le moment' :
                    'Créez plus d\'événements pour améliorer nos recommandations'
                  }
                </p>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => {
                    if (!userProfile || !userProfile.location || !userProfile.favoriteSports?.length) {
                      router.push('/profile');
                    } else {
                      handleCreateEvent();
                    }
                  }}
                >
                  {!userProfile || !userProfile.location || !userProfile.favoriteSports?.length ?
                    '✏️ Compléter mon profil' :
                    '🚀 Créer un événement'
                  }
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fil des disponibilités */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              🏃‍♂️ Disponibilités d&apos;aujourd&apos;hui
            </h2>
            <Badge variant="info" size="sm">
              🔥 {todayEvents.length} dispos aujourd&apos;hui
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
          ) : todayEvents.length === 0 && futureEvents.length === 0 ? (
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
            <>
              {/* Section d'aujourd'hui */}
              <div className="space-y-4 mb-8">
                {todayEvents.length > 0 ? (
                  todayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onJoin={handleJoinEvent}
                      onView={handleViewEvent}
                    />
                  ))
                ) : (
                  <Card variant="glass">
                    <CardContent className="text-center py-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                      <span className="text-4xl mb-4 block">⏰</span>
                      <p className="text-gray-600">
                        Aucune disponibilité pour le reste de la journée
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Section demain et plus tard */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    🌅 Demain et plus tard
                  </h2>
                  <Badge variant="success" size="sm">
                    {futureEvents.length} à venir
                  </Badge>
                </div>
                {futureEvents.length > 0 ? (
                  <div className="space-y-4">
                    {futureEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onJoin={handleJoinEvent}
                        onView={handleViewEvent}
                      />
                    ))}
                  </div>
                ) : (
                  <Card variant="glass">
                    <CardContent className="text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                      <span className="text-4xl mb-4 block">🌱</span>
                      <p className="text-gray-600 mb-4">
                        Aucun événement prévu pour les prochains jours
                      </p>
                      <Button variant="success" onClick={handleCreateEvent} size="sm">
                        ✨ Créer un événement
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Section des événements passés */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                    📅 Événements passés
                  </h2>
                  <Badge variant="default" size="sm">
                    {pastEvents.length} terminé{pastEvents.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                {pastEvents.length > 0 ? (
                  <div className="space-y-4 opacity-60">
                    {pastEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onJoin={handleJoinEvent}
                        onView={handleViewEvent}
                      />
                    ))}
                  </div>
                ) : (
                  <Card variant="glass">
                    <CardContent className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                      <span className="text-4xl mb-4 block">📖</span>
                      <p className="text-gray-600">
                        Aucun événement passé pour le moment
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
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
      <Footer />
    </div>
  );
}