'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UsersService, EventsService } from '@/lib/firestore';
import { PublicUserProfile } from '@/types/user';
import { Event } from '@/types/event';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BottomTabs } from '@/components/navigation/BottomTabs';
import Link from 'next/link';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [userEvents, setUserEvents] = useState<{
    created: Event[];
    participating: Event[];
  }>({ created: [], participating: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await UsersService.getPublicUserProfileByUsername(username);
      setProfile(profileData);
      if (!profileData) {
        setError('Profil introuvable ou privé');
      } else if (profileData.id) {
        // Load user events
        const events = await EventsService.getUserEvents(profileData.id);
        setUserEvents({
          created: events.created.filter(e => e.status === 'active'),
          participating: events.participating
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
        <div className="max-w-4xl mx-auto p-4 pt-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomTabs />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
        <div className="max-w-4xl mx-auto p-4 pt-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {error || 'Profil non accessible'}
              </h2>
              <p className="text-gray-600 mb-6">
                Ce profil n&apos;existe pas ou est défini comme privé par l&apos;utilisateur.
              </p>
              <Button
                onClick={() => window.history.back()}
                variant="primary"
              >
                Retour
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomTabs />
      </div>
    );
  }

  const getSportLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSportLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return level;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Profile Header */}
        <Card variant="gradient" className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`Avatar de ${profile.username}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">
                  {profile.displayName || profile.username}
                </h1>
                <p className="text-gray-600">@{profile.username}</p>
                {profile.location && profile.preferences?.showLocation && (
                  <p className="text-gray-500 flex items-center mt-1">
                    <span className="mr-1">📍</span>
                    {profile.location}
                  </p>
                )}
              </div>
            </div>
            {profile.bio && (
              <div className="mt-4">
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Stats */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">📊 Statistiques</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {profile.stats.matchesPlayed}
                </div>
                <div className="text-sm text-gray-600">Matchs joués</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {profile.stats.sportsPlayed}
                </div>
                <div className="text-sm text-gray-600">Sports pratiqués</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Sports */}
        {profile.favoriteSports && profile.favoriteSports.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800">⚽ Sports favoris</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteSports.map((sport) => (
                  <Badge key={sport} variant="info">
                    {sport}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skill Levels */}
        {profile.skillLevels && Object.keys(profile.skillLevels).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800">🏆 Niveaux</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(profile.skillLevels).map(([sport, level]) => (
                  <div key={sport} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-800 capitalize">{sport}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSportLevelColor(level)}`}>
                      {getSportLevelLabel(level)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">🎯 Activité récente</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Dernière connexion: <span className="font-medium">Aujourd&apos;hui</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Membre depuis: <span className="font-medium">Récemment</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Événements organisés: <span className="font-medium">{userEvents.created.length}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Participations actives: <span className="font-medium">{userEvents.participating.length}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Created Events */}
        {userEvents.created.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800">🎪 Événements organisés</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userEvents.created.slice(0, 3).map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{event.title}</h3>
                        <Badge variant="info">{event.sport}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                        <span className="flex items-center">
                          ⏰ {new Date(event.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center">
                          👥 {event.participantIds?.length || 0}/{event.maxParticipants}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </Link>
                ))}
                {userEvents.created.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/search?organizer=${username}`)}
                  >
                    Voir tous les événements ({userEvents.created.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participating Events */}
        {userEvents.participating.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800">🏃 Participations</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userEvents.participating.slice(0, 3).map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{event.title}</h3>
                        <Badge variant="info">{event.sport}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                        <span className="flex items-center">
                          ⏰ {new Date(event.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center">
                          👥 {event.participantIds?.length || 0}/{event.maxParticipants}
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </Link>
                ))}
                {userEvents.participating.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/search?participant=${username}`)}
                  >
                    Voir toutes les participations ({userEvents.participating.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements/Badges */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">🏅 Badges et récompenses</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {profile.stats.matchesPlayed >= 5 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">🌟</div>
                  <p className="text-xs text-gray-600 font-medium">Actif</p>
                  <p className="text-xs text-gray-500">5+ matchs</p>
                </div>
              )}
              {profile.stats.matchesPlayed >= 10 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <p className="text-xs text-gray-600 font-medium">Régulier</p>
                  <p className="text-xs text-gray-500">10+ matchs</p>
                </div>
              )}
              {profile.stats.matchesPlayed >= 25 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">🔥</div>
                  <p className="text-xs text-gray-600 font-medium">Passionné</p>
                  <p className="text-xs text-gray-500">25+ matchs</p>
                </div>
              )}
              {profile.stats.sportsPlayed >= 3 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-xs text-gray-600 font-medium">Polyvalent</p>
                  <p className="text-xs text-gray-500">3+ sports</p>
                </div>
              )}
              {userEvents.created.length >= 5 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">👑</div>
                  <p className="text-xs text-gray-600 font-medium">Organisateur</p>
                  <p className="text-xs text-gray-500">5+ événements</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
      <BottomTabs />
    </div>
  );
}