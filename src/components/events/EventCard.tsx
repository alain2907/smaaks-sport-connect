import { Event } from '@/types/event';
import { SPORTS, SPORT_LEVELS } from '@/types/sport';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  onView?: (eventId: string) => void;
}

export function EventCard({ event, onJoin, onView }: EventCardProps) {
  const sport = SPORTS.find(s => s.id === event.sport);
  const isFull = event.currentPlayers >= event.maxPlayers;
  const spotsLeft = event.maxPlayers - event.currentPlayers;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // HH:mm
  };

  return (
    <Card className="mb-4" onClick={() => onView?.(event.id)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Left section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{sport?.icon}</span>
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              {event.level && (
                <Badge variant="info" size="sm">
                  {SPORT_LEVELS[event.level]}
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{formatDate(event.date)} à {formatTime(event.startTime)}</span>
                {event.endTime && (
                  <span>- {formatTime(event.endTime)}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>{event.location.address}, {event.location.city}</span>
              </div>

              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>
                  {event.currentPlayers}/{event.maxPlayers} joueurs
                  {!isFull && (
                    <span className="text-green-600 ml-1">
                      ({spotsLeft} place{spotsLeft > 1 ? 's' : ''} disponible{spotsLeft > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              </div>

              {event.price && (
                <div className="flex items-center gap-1">
                  <span>💰</span>
                  <span>{event.price}€</span>
                </div>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Right section */}
          <div className="ml-4 flex flex-col items-end gap-2">
            <Badge
              variant={isFull ? 'error' : event.currentPlayers > 0 ? 'warning' : 'success'}
              size="sm"
            >
              {isFull ? 'Complet' : event.currentPlayers > 0 ? 'Places limitées' : 'Disponible'}
            </Badge>

            {!isFull && onJoin && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(event.id);
                }}
              >
                Rejoindre
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}