'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { SPORTS, SPORT_LEVELS, SportLevel } from '@/types/sport';
import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Footer } from '@/components/layout/Footer';
import { EventsService } from '@/lib/firestore';
import { Event } from '@/types/event';
import Link from 'next/link';
import { RescheduleModal } from '@/components/events/RescheduleModal';

interface UserProfile {
  displayName: string;
  bio: string;
  location: string;
  sports: Array<{
    sportId: string;
    level: SportLevel;
  }>;
  availability: string[];
  phone?: string;
  age?: number;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    location: '',
    sports: [],
    availability: [],
  });

  const [userEvents, setUserEvents] = useState<{
    created: Event[];
    participating: Event[];
    pending: Event[];
    past: Event[];
  }>({
    created: [],
    participating: [],
    pending: [],
    past: []
  });
  const [eventsLoading, setEventsLoading] = useState(false);
  const [cancelingRequest, setCancelingRequest] = useState<string | null>(null);
  const [leavingEvent, setLeavingEvent] = useState<string | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const [reschedulingEvent, setReschedulingEvent] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const loadUserProfile = useCallback(async () => {
    if (!user || !db) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        const loadedProfile = {
          displayName: data.displayName || user.displayName || '',
          bio: data.bio || '',
          location: data.location || '',
          sports: data.sports || [],
          availability: data.availability || [],
          phone: data.phone,
          age: data.age,
        };
        setProfile(loadedProfile);
        setOriginalProfile({ ...loadedProfile });
      } else {
        const defaultProfile = {
          displayName: user.displayName || user.email?.split('@')[0] || '',
          bio: '',
          location: '',
          sports: [],
          availability: [],
        };
        setProfile(defaultProfile);
        setOriginalProfile({ ...defaultProfile });
      }
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      const err = error as { message?: string };
      setMessage({
        type: 'error',
        text: `Erreur lors du chargement du profil : ${err?.message || 'Erreur inconnue'}`
      });
    }
  }, [user]);

  const loadUserEvents = useCallback(async () => {
    if (!user) return;

    setEventsLoading(true);
    try {
      const events = await EventsService.getUserEvents(user.uid);
      setUserEvents(events);
    } catch (error) {
      console.error('Error loading user events:', error);
    } finally {
      setEventsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserEvents();
    }
  }, [user, loadUserProfile, loadUserEvents]);

  const handleSaveProfile = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Utilisateur non connecté' });
      return;
    }

    if (!db) {
      setMessage({ type: 'error', text: 'Base de données non disponible' });
      return;
    }

    // Validation des champs obligatoires
    if (!profile.displayName.trim()) {
      setMessage({ type: 'error', text: 'Le nom d\'affichage est obligatoire' });
      return;
    }

    if (profile.displayName.trim().length < 2) {
      setMessage({ type: 'error', text: 'Le nom d\'affichage doit contenir au moins 2 caractères' });
      return;
    }

    if (!profile.location.trim()) {
      setMessage({ type: 'error', text: 'La ville est obligatoire pour les suggestions' });
      return;
    }

    if (profile.sports.length === 0) {
      setMessage({ type: 'error', text: 'Sélectionnez au moins un sport pour recevoir des suggestions' });
      return;
    }

    // Validation de l'âge si renseigné
    if (profile.age && (profile.age < 13 || profile.age > 100)) {
      setMessage({ type: 'error', text: 'L\'âge doit être entre 13 et 100 ans' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (profile.displayName && profile.displayName !== user.displayName && auth?.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profile.displayName,
        });
      }

      // Préparer les données à sauvegarder (nettoyer les undefined)
      const cleanData = {
        ...profile,
        email: user.email,
        uid: user.uid,
        favoriteSports: profile.sports.map(s => s.sportId), // Pour les suggestions
        skillLevels: profile.sports.reduce((acc, sport) => {
          acc[sport.sportId] = sport.level;
          return acc;
        }, {} as Record<string, string>),
        updatedAt: new Date().toISOString(),
      };

      // Supprimer les valeurs undefined (Firestore ne les accepte pas)
      const dataToSave = Object.fromEntries(
        Object.entries(cleanData).filter(([_, value]) => value !== undefined)
      );

      console.log('Saving profile data (cleaned):', dataToSave);
      setDebugInfo(`Attempting to save profile for user: ${user.uid}`);

      // Sauvegarder le profil avec les sports favoris pour les suggestions
      await setDoc(doc(db, 'users', user.uid), dataToSave);

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès ! Vos suggestions vont s\'améliorer.' });
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setOriginalProfile({ ...profile });

      // Masquer le message de succès après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const err = error as { code?: string; message?: string };

      // Messages d'erreur spécifiques selon le type d'erreur
      let errorMessage = 'Erreur lors de la sauvegarde du profil';

      if (err?.code === 'permission-denied') {
        errorMessage = 'Permission refusée : vérifiez votre connexion Firebase';
      } else if (err?.code === 'network-error' || err?.message?.includes('network')) {
        errorMessage = 'Erreur réseau : vérifiez votre connexion internet';
      } else if (err?.code === 'invalid-argument') {
        errorMessage = 'Données invalides : vérifiez vos informations';
      } else if (err?.code === 'quota-exceeded') {
        errorMessage = 'Quota dépassé : essayez plus tard';
      } else if (err?.code === 'unauthenticated') {
        errorMessage = 'Session expirée : reconnectez-vous';
      } else if (err?.message) {
        errorMessage = `Erreur : ${err.message}`;
      }

      // Ajouter les détails de debug au message d'erreur
      errorMessage += ` (Code: ${err?.code || 'unknown'})`;

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const toggleSport = (sportId: string, level: SportLevel) => {
    setProfile(prev => {
      const existingSport = prev.sports.find(s => s.sportId === sportId);
      let newProfile;

      if (existingSport) {
        if (existingSport.level === level) {
          newProfile = {
            ...prev,
            sports: prev.sports.filter(s => s.sportId !== sportId),
          };
        } else {
          newProfile = {
            ...prev,
            sports: prev.sports.map(s =>
              s.sportId === sportId ? { ...s, level } : s
            ),
          };
        }
      } else {
        newProfile = {
          ...prev,
          sports: [...prev.sports, { sportId, level }],
        };
      }

      // Vérifier si il y a des changements
      if (originalProfile) {
        setHasUnsavedChanges(JSON.stringify(newProfile) !== JSON.stringify(originalProfile));
      }
      return newProfile;
    });
  };

  const toggleAvailability = (day: string) => {
    setProfile(prev => {
      const newProfile = {
        ...prev,
        availability: prev.availability.includes(day)
          ? prev.availability.filter(d => d !== day)
          : [...prev.availability, day],
      };

      // Vérifier si il y a des changements
      if (originalProfile) {
        setHasUnsavedChanges(JSON.stringify(newProfile) !== JSON.stringify(originalProfile));
      }
      return newProfile;
    });
  };

  const handleCancelRequest = async (eventId: string) => {
    if (!user) return;

    setCancelingRequest(eventId);
    try {
      await EventsService.cancelParticipationRequest(eventId, user.uid);
      // Recharger les événements après annulation
      await loadUserEvents();
      setMessage({ type: 'success', text: 'Demande de participation annulée' });
    } catch (error) {
      console.error('Error canceling request:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'annulation de la demande' });
    } finally {
      setCancelingRequest(null);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!user) return;

    if (!confirm('Êtes-vous sûr de vouloir quitter cet événement ?')) {
      return;
    }

    setLeavingEvent(eventId);
    try {
      await EventsService.leaveEvent(eventId, user.uid);
      // Recharger les événements après départ
      await loadUserEvents();
      setMessage({ type: 'success', text: 'Vous avez quitté l\'événement' });
    } catch (error) {
      console.error('Error leaving event:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sortie de l\'événement' });
    } finally {
      setLeavingEvent(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      return;
    }

    setDeletingEvent(eventId);
    try {
      await EventsService.deleteEvent(eventId, user.uid);
      // Recharger les événements après suppression
      await loadUserEvents();
      setMessage({ type: 'success', text: 'Événement supprimé avec succès' });
    } catch (error) {
      console.error('Error deleting event:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression de l\'événement' });
    } finally {
      setDeletingEvent(null);
    }
  };

  const handleRescheduleEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async (newDate: Date, newLocation?: string) => {
    if (!user || !selectedEvent) return;

    setReschedulingEvent(selectedEvent.id);
    try {
      await EventsService.rescheduleEvent(selectedEvent.id, user.uid, newDate, newLocation);
      // Recharger les événements après reprogrammation
      await loadUserEvents();
      setMessage({ type: 'success', text: 'Événement reprogrammé avec succès' });
      setShowRescheduleModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error rescheduling event:', error);
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la reprogrammation de l\'événement' });
    } finally {
      setReschedulingEvent(null);
    }
  };

  const handleCancelReschedule = () => {
    setShowRescheduleModal(false);
    setSelectedEvent(null);
    setReschedulingEvent(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Mon Profil
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Messages de validation */}
        {message && (
          <Card className={`mb-6 border-2 ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50'
              : message.type === 'info'
              ? 'border-blue-200 bg-blue-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <CardContent className="p-4">
              <div className={`flex items-center space-x-2 ${
                message.type === 'success' ? 'text-green-600' :
                message.type === 'info' ? 'text-blue-600' : 'text-red-600'
              }`}>
                <span className="text-lg">
                  {message.type === 'success' ? '✓' :
                   message.type === 'info' ? 'ℹ️' : '⚠️'}
                </span>
                <p className="font-medium">{message.text}</p>
              </div>
              {debugInfo && (
                <details className="mt-2 text-sm text-gray-600">
                  <summary className="cursor-pointer">Détails techniques</summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">{debugInfo}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        )}

        {/* Carte Profil Principal */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => {
                        setProfile(prev => ({ ...prev, displayName: e.target.value }));
                        setMessage(null);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nom d'affichage *"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  </div>
                </div>

                <textarea
                  value={profile.bio}
                  onChange={(e) => {
                    setProfile(prev => ({ ...prev, bio: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bio (parle de toi en quelques mots)"
                  rows={3}
                />

                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => {
                    setProfile(prev => ({ ...prev, location: e.target.value }));
                    setMessage(null);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ville ou quartier * (pour les suggestions)"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, phone: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Téléphone (optionnel)"
                  />
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => {
                      setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }));
                      setHasUnsavedChanges(true);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Âge (optionnel)"
                    min="13"
                    max="100"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    variant={loading ? 'secondary' : 'primary'}
                  >
                    {loading ? '⏳ Enregistrement...' : '✓ Enregistrer'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setMessage(null);
                      loadUserProfile();
                    }}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMessage({
                        type: 'info',
                        text: `Statut: User=${!!user}, DB=${!!db}, Auth=${!!auth?.currentUser}`
                      });
                      setDebugInfo(`Firebase status check at ${new Date().toISOString()}`);
                    }}
                    disabled={loading}
                  >
                    🔍 Debug
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profile.displayName || user?.email?.split('@')[0] || 'Joueur'}
                      </h2>
                      <p className="text-gray-500">{user?.email}</p>
                      {profile.location && (
                        <p className="text-sm text-gray-600">📍 {profile.location}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier
                  </Button>
                </div>

                {profile.bio && (
                  <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">0</div>
                    <div className="text-sm text-gray-500">Matchs joués</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">-</div>
                    <div className="text-sm text-gray-500">Note moyenne</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section Sports */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mes sports {isEditing && '(clique pour ajouter)'}
            </h3>

            {isEditing ? (
              <div className="space-y-4">
                {SPORTS.map((sport) => {
                  const userSport = profile.sports.find(s => s.sportId === sport.id);
                  return (
                    <div key={sport.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">
                          {sport.icon} {sport.name}
                        </span>
                        {userSport && (
                          <Badge variant="success" size="sm">
                            {SPORT_LEVELS[userSport.level]}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(SPORT_LEVELS) as SportLevel[]).map((level) => (
                          <button
                            key={level}
                            onClick={() => toggleSport(sport.id, level)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              userSport?.level === level
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {SPORT_LEVELS[level]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.sports.length > 0 ? (
                  profile.sports.map((userSport) => {
                    const sport = SPORTS.find(s => s.id === userSport.sportId);
                    if (!sport) return null;
                    return (
                      <div key={userSport.sportId} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                        <span>{sport.icon}</span>
                        <span className="text-sm font-medium">{sport.name}</span>
                        <Badge variant="info" size="sm">
                          {SPORT_LEVELS[userSport.level]}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">Aucun sport sélectionné</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Disponibilités */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mes disponibilités
            </h3>

            {isEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleAvailability(day)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      profile.availability.includes(day)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.availability.length > 0 ? (
                  profile.availability.map((day) => (
                    <Badge key={day} variant="info">
                      {day}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">Aucune disponibilité renseignée</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Mes Événements */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mes événements
            </h3>

            {eventsLoading ? (
              <div className="text-center py-8">
                <span className="text-2xl animate-spin">⏳</span>
                <p className="text-gray-500 mt-2">Chargement des événements...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Événements créés */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Événements créés ({userEvents.created.length})
                  </h4>
                  {userEvents.created.length > 0 ? (
                    <div className="space-y-3">
                      {userEvents.created.map((event) => (
                        <div key={event.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <Link
                              href={`/events/${event.id}`}
                              className="flex-1 hover:transform hover:scale-[1.02] transition-transform duration-200"
                            >
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {event.title}
                                </h5>
                                <p className="text-sm text-gray-600 mb-2">
                                  📍 {event.location}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>
                                    🗓️ {new Date(event.date).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span>
                                    👥 {event.participantIds.length}/{event.maxParticipants} participants
                                  </span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center space-x-2">
                              <Badge variant="success" size="sm">
                                Organisateur
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/events/${event.id}/edit`)}
                                className="text-blue-600 hover:bg-blue-50 border-blue-200"
                              >
                                ✏️ Modifier
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deletingEvent === event.id}
                                className="text-red-600 hover:bg-red-50 border-red-200"
                              >
                                {deletingEvent === event.id ? '⏳' : '🗑️'} Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4">Aucun événement créé</p>
                  )}
                </div>

                {/* Événements où je participe */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Mes participations ({userEvents.participating.length})
                  </h4>
                  {userEvents.participating.length > 0 ? (
                    <div className="space-y-3">
                      {userEvents.participating.map((event) => (
                        <div key={event.id} className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <Link
                              href={`/events/${event.id}`}
                              className="flex-1 hover:transform hover:scale-[1.02] transition-transform duration-200"
                            >
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {event.title}
                                </h5>
                                <p className="text-sm text-gray-600 mb-2">
                                  📍 {event.location}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>
                                    🗓️ {new Date(event.date).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span>
                                    👥 {event.participantIds.length}/{event.maxParticipants} participants
                                  </span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center space-x-2">
                              <Badge variant="success" size="sm">
                                Approuvé
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLeaveEvent(event.id)}
                                disabled={leavingEvent === event.id}
                                className="text-orange-600 hover:bg-orange-50 border-orange-200"
                              >
                                {leavingEvent === event.id ? '⏳' : '🚪'} Quitter
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4">Aucune participation approuvée</p>
                  )}
                </div>

                {/* Demandes en attente */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Demandes en attente ({userEvents.pending.length})
                  </h4>
                  {userEvents.pending.length > 0 ? (
                    <div className="space-y-3">
                      {userEvents.pending.map((event) => (
                        <div key={event.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <Link
                              href={`/events/${event.id}`}
                              className="flex-1 hover:transform hover:scale-[1.02] transition-transform duration-200"
                            >
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {event.title}
                                </h5>
                                <p className="text-sm text-gray-600 mb-2">
                                  📍 {event.location}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>
                                    🗓️ {new Date(event.date).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span>
                                    👥 {event.participantIds.length}/{event.maxParticipants} participants
                                  </span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center space-x-2">
                              <Badge variant="warning" size="sm">
                                ⏳ En attente
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(event.id)}
                                disabled={cancelingRequest === event.id}
                                className="text-red-600 hover:bg-red-50 border-red-200"
                              >
                                {cancelingRequest === event.id ? '⏳' : '✗'} Annuler
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4">Aucune demande en attente</p>
                  )}
                </div>

                {/* Événements passés à reprogrammer */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Événements passés ({userEvents.past.length})
                  </h4>
                  {userEvents.past.length > 0 ? (
                    <div className="space-y-3">
                      {userEvents.past.map((event) => (
                        <div key={event.id} className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <Link
                              href={`/events/${event.id}`}
                              className="flex-1 hover:transform hover:scale-[1.02] transition-transform duration-200"
                            >
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {event.title}
                                </h5>
                                <p className="text-sm text-gray-600 mb-2">
                                  📍 {event.location}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>
                                    🗓️ {new Date(event.date).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span>
                                    👥 {event.participantIds.length}/{event.maxParticipants} participants
                                  </span>
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default" size="sm">
                                ⏰ Passé
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRescheduleEvent(event)}
                                disabled={reschedulingEvent === event.id}
                                className="text-blue-600 hover:bg-blue-50 border-blue-200"
                              >
                                {reschedulingEvent === event.id ? '⏳' : '📅'} Reprogrammer
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 py-4">Aucun événement passé</p>
                  )}
                </div>

                {userEvents.created.length === 0 && userEvents.participating.length === 0 && userEvents.pending.length === 0 && userEvents.past.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-6xl mb-4 block">🏃‍♂️</span>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      Prêt pour votre premier événement ?
                    </h4>
                    <p className="text-gray-500 mb-4">
                      Créez un événement ou rejoignez-en un pour commencer !
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="primary"
                        onClick={() => router.push('/create')}
                      >
                        ➕ Créer un événement
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/search')}
                      >
                        🔍 Rechercher des événements
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Paramètres
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/settings/privacy')}
              >
                🔒 Confidentialité
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                🚪 Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton de sauvegarde flottant */}
      {hasUnsavedChanges && !isEditing && (
        <div className="fixed bottom-24 right-4 z-50">
          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            variant="primary"
            size="lg"
            className="shadow-2xl animate-pulse"
          >
            {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder les modifications'}
          </Button>
        </div>
      )}

      {/* Modal de reprogrammation */}
      {selectedEvent && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          eventTitle={selectedEvent.title}
          currentDate={selectedEvent.date}
          currentLocation={selectedEvent.location}
          onConfirm={handleConfirmReschedule}
          onCancel={handleCancelReschedule}
          loading={!!reschedulingEvent}
        />
      )}

      <Footer />
    </div>
  );
}