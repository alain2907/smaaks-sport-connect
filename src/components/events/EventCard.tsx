import { Event } from '@/types/event';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  onView?: (eventId: string) => void;
}

const SPORT_EMOJIS: Record<string, string> = {
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  running: '🏃‍♂️',
  badminton: '🏸',
  volleyball: '🏐',
  cycling: '🚴‍♂️',
  swimming: '🏊‍♂️'
};

const SKILL_LEVEL_NAMES: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  all: 'Tous niveaux'
};

export function EventCard({ event, onJoin, onView }: EventCardProps) {
  const { user } = useAuth();
  const sportEmoji = SPORT_EMOJIS[event.sport] || '🏃‍♂️';
  const isFull = event.participantIds.length >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - event.participantIds.length;
  const isParticipant = user && event.participantIds.includes(user.uid);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card variant="gradient" className="mb-4 hover-lift cursor-pointer" onClick={() => onView?.(event.id)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Left section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{sportEmoji}</span>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info" size="sm">
                    {SKILL_LEVEL_NAMES[event.skillLevel]}
                  </Badge>
                  {isParticipant && (
                    <Badge variant="success" size="sm">
                      ✓ Inscrit
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">📅</span>
                <span className="font-medium">
                  {formatDate(event.date)} à {formatTime(event.date)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">📍</span>
                <span className="font-medium">{event.location}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-lg">👥</span>
                <span className="font-medium">
                  {event.participantIds.length}/{event.maxParticipants} participants
                  {!isFull && (
                    <span className="text-emerald-600 ml-2">
                      ({spotsLeft} place{spotsLeft > 1 ? 's' : ''} restante{spotsLeft > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              </div>

              {event.equipment && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">🎽</span>
                  <span className="font-medium">{event.equipment}</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="text-gray-600 mt-3 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Right section */}
          <div className="ml-6 flex flex-col items-end gap-3">
            <Badge
              variant={isFull ? 'error' : event.participantIds.length > 0 ? 'warning' : 'success'}
              size="sm"
            >
              {isFull ? '🔴 Complet' : event.participantIds.length > 0 ? '🟡 Places limitées' : '🟢 Disponible'}
            </Badge>

            {onJoin && (
              <Button
                size="sm"
                variant={isParticipant ? 'danger' : 'primary'}
                disabled={isFull && !isParticipant}
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(event.id);
                }}
              >
                {isParticipant ? '🚫 Quitter' : isFull ? '🔒 Complet' : '🚀 Rejoindre'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}