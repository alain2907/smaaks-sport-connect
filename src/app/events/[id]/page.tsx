'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Event } from '@/types/event';
import { EventsService, UsersService } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Footer } from '@/components/layout/Footer';
import { ParticipantRequest } from '@/types/event';
import { UsernameSetup } from '@/components/auth/UsernameSetup';
import Link from 'next/link';
import { RescheduleModal } from '@/components/events/RescheduleModal';
import { MessageSection } from '@/components/events/MessageSection';

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
  const { hasUsername, refreshProfile } = useUserProfile();
  const { joinEvent, leaveEvent } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [managingRequest, setManagingRequest] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{ [userId: string]: { username: string; displayName?: string } }>({});
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [reschedulingEvent, setReschedulingEvent] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const eventId = params.id as string;

  // Function to create profile link component
  const UserProfileLink = ({ userId, displayName, className = "" }: { userId: string; displayName: string; className?: string }) => {
    const profile = userProfiles[userId];
    if (!profile?.username) {
      return <span className={className}>{displayName}</span>;
    }

    return (
      <Link
        href={`/user/${profile.username}`}
        className={`${className} hover:text-purple-600 underline cursor-pointer`}
      >
        {displayName}
      </Link>
    );
  };

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

      // Load user profiles for participants
      if (eventData) {
        await loadUserProfiles(eventData);
      }
    } catch (err) {
      setError('Événement non trouvé');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfiles = async (eventData: Event) => {
    const userIds = new Set<string>();

    // Add creator
    userIds.add(eventData.creatorId);

    // Add all participants
    eventData.participantIds.forEach(id => userIds.add(id));

    // Add all users from requests
    eventData.participantRequests?.forEach(req => userIds.add(req.userId));

    // Load profiles for all unique user IDs
    const profiles: { [userId: string]: { username: string; displayName?: string } } = {};

    for (const userId of Array.from(userIds)) {
      try {
        const profile = await UsersService.getPublicUserProfile(userId);
        if (profile) {
          profiles[userId] = {
            username: profile.username,
            displayName: profile.displayName
          };
        }
      } catch (err) {
        console.error(`Error loading profile for user ${userId}:`, err);
      }
    }

    setUserProfiles(profiles);
  };

  const handleJoinLeave = async () => {
    if (!event || !user) return;

    const isParticipant = event.participantIds.includes(user.uid);

    // Si l'utilisateur veut rejoindre l'événement mais n'a pas de username
    if (!isParticipant && !hasUsername) {
      setShowUsernameSetup(true);
      return;
    }

    setActionLoading(true);
    try {
      if (isParticipant) {
        await leaveEvent(eventId);
      } else {
        await joinEvent(eventId);
      }

      // Reload event to get updated participant list
      await loadEvent();
    } catch {
      setError("Erreur lors de l'action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageRequest = async (userId: string, action: 'approve' | 'reject') => {
    if (!event || !user) return;

    setManagingRequest(userId);
    try {
      if (action === 'approve') {
        await EventsService.approveParticipantRequest(eventId, userId, user.uid);
      } else {
        await EventsService.rejectParticipantRequest(eventId, userId, user.uid);
      }

      // Reload event to get updated participant list
      await loadEvent();
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setManagingRequest(null);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !user) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      return;
    }

    setDeletingEvent(true);
    try {
      await EventsService.deleteEvent(eventId, user.uid);
      router.push('/profile?deleted=true');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Erreur lors de la suppression de l\'événement');
    } finally {
      setDeletingEvent(false);
    }
  };

  const handleRescheduleEvent = () => {
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async (newDate: Date, newLocation?: string) => {
    if (!event || !user) return;

    setReschedulingEvent(true);
    try {
      await EventsService.rescheduleEvent(eventId, user.uid, newDate, newLocation);
      // Recharger l'événement après reprogrammation
      await loadEvent();
      setShowRescheduleModal(false);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Erreur lors de la reprogrammation de l\'événement');
    } finally {
      setReschedulingEvent(false);
    }
  };

  const handleCancelReschedule = () => {
    setShowRescheduleModal(false);
    setReschedulingEvent(false);
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

  // Check user's request status
  const userRequest = event.participantRequests?.find(req => req.userId === user.uid);
  const userRequestStatus = userRequest?.status;

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

                  {/* Participants approuvés */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {event.participantIds.length > 0 ? 'Participants confirmés:' : 'Aucun participant confirmé'}
                    </p>
                    <div className="space-y-1">
                      {event.participantIds.map((participantId, index) => {
                        // Find participant info from requests or show as unknown
                        const participantRequest = event.participantRequests?.find(req => req.userId === participantId && req.status === 'approved');
                        const profile = userProfiles[participantId];
                        const participantName = participantId === event.creatorId
                          ? 'Organisateur'
                          : profile?.displayName || profile?.username || participantRequest?.userName || `Participant ${index + 1}`;

                        return (
                          <div key={participantId} className="flex items-center space-x-2">
                            <span className="text-purple-600">
                              {participantId === event.creatorId ? '👑' : '✅'}
                            </span>
                            <UserProfileLink
                              userId={participantId}
                              displayName={participantName + (participantId === user?.uid ? ' (Vous)' : '')}
                              className="text-sm text-gray-800"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Demandes en attente (visible uniquement par l'organisateur) */}
                  {isCreator && event.participantRequests?.some(req => req.status === 'pending') && (
                    <div className="bg-amber-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-amber-600 mb-3 font-medium">
                        🕒 Demandes en attente ({event.participantRequests.filter(req => req.status === 'pending').length})
                      </p>
                      <div className="space-y-3">
                        {event.participantRequests
                          .filter(req => req.status === 'pending')
                          .map((request: ParticipantRequest) => (
                          <div key={request.userId} className="flex items-center justify-between bg-white rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-amber-600">⏳</span>
                              <div>
                                <UserProfileLink
                                  userId={request.userId}
                                  displayName={userProfiles[request.userId]?.displayName || userProfiles[request.userId]?.username || request.userName}
                                  className="text-sm font-medium text-gray-800"
                                />
                                <p className="text-xs text-gray-400">
                                  @{userProfiles[request.userId]?.username || 'utilisateur'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Demandé le {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleManageRequest(request.userId, 'approve')}
                                disabled={managingRequest === request.userId || isFull}
                                className="text-xs"
                              >
                                {managingRequest === request.userId ? '⏳' : '✅'} Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleManageRequest(request.userId, 'reject')}
                                disabled={managingRequest === request.userId}
                                className="text-xs"
                              >
                                {managingRequest === request.userId ? '⏳' : '❌'} Refuser
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Demandes rejetées (visible uniquement par l'organisateur) */}
                  {isCreator && event.participantRequests?.some(req => req.status === 'rejected') && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <details>
                        <summary className="text-sm text-red-600 cursor-pointer">
                          ❌ Demandes refusées ({event.participantRequests.filter(req => req.status === 'rejected').length})
                        </summary>
                        <div className="space-y-2 mt-2">
                          {event.participantRequests
                            .filter(req => req.status === 'rejected')
                            .map((request: ParticipantRequest) => (
                            <div key={request.userId} className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>❌</span>
                              <UserProfileLink
                                userId={request.userId}
                                displayName={userProfiles[request.userId]?.displayName || userProfiles[request.userId]?.username || request.userName}
                                className="text-gray-600"
                              />
                              <span className="text-xs">
                                (refusé le {request.respondedAt ? new Date(request.respondedAt).toLocaleDateString('fr-FR') : 'N/A'})
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
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
        {(!isPastEvent || isCreator) && (
          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isCreator ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Badge variant={isPastEvent ? "default" : "success"} size="md" className="text-center">
                      {isPastEvent ? '⏰ Événement passé - Organisateur' : "🎯 Vous êtes l'organisateur"}
                    </Badge>
                    {isPastEvent ? (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={handleRescheduleEvent}
                        disabled={reschedulingEvent}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        {reschedulingEvent ? '⏳ Reprogrammation...' : "📅 Reprogrammer l'événement"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => router.push(`/events/${eventId}/edit`)}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        {"✏️ Modifier l'événement"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleDeleteEvent}
                      disabled={deletingEvent}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {deletingEvent ? '⏳ Suppression...' : "🗑️ Supprimer l'événement"}
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
                    ) : userRequestStatus === 'pending' ? (
                      <div className="flex-1 flex flex-col items-center space-y-2">
                        <Badge variant="warning" size="md">
                          ⏳ Demande en attente
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleJoinLeave}
                          disabled={actionLoading}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {actionLoading ? '⏳ En cours...' : '❌ Annuler la demande'}
                        </Button>
                      </div>
                    ) : userRequestStatus === 'rejected' ? (
                      <div className="flex-1 text-center">
                        <Badge variant="error" size="md">
                          ❌ Demande refusée
                        </Badge>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleJoinLeave}
                        disabled={actionLoading || isFull}
                        className="flex-1"
                      >
                        {actionLoading ? '⏳ En cours...' : isFull ? '🚫 Complet' : '📝 Demander à rejoindre'}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => router.push('/search')}
                      className="flex-1"
                    >
                      {"🔍 Voir d'autres événements"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages Section */}
        <MessageSection event={event} />
      </div>
      <Footer />

      {/* Modal de configuration du username */}
      <UsernameSetup
        isOpen={showUsernameSetup}
        onComplete={(username) => {
          console.log('Username configuré:', username);
          setShowUsernameSetup(false);
          refreshProfile().then(() => {
            // Rejoindre l'événement maintenant que l'utilisateur a un username
            handleJoinLeave();
          });
        }}
        onCancel={() => setShowUsernameSetup(false)}
        title="Nom d'utilisateur requis"
        description="Pour rejoindre un événement, vous devez d'abord choisir un nom d'utilisateur. Il sera visible par les autres participants."
      />

      {/* Modal de reprogrammation */}
      {event && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          eventTitle={event.title}
          currentDate={event.date}
          currentLocation={event.location}
          onConfirm={handleConfirmReschedule}
          onCancel={handleCancelReschedule}
          loading={reschedulingEvent}
        />
      )}
    </div>
  );
}