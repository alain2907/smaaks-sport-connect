'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/types/event';
import { EventsService } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const SPORTS = [
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
  { id: 'beginner', name: 'Débutant', description: 'Je débute dans ce sport' },
  { id: 'intermediate', name: 'Intermédiaire', description: 'J\'ai quelques bases' },
  { id: 'advanced', name: 'Avancé', description: 'J\'ai un bon niveau' },
  { id: 'all', name: 'Tous niveaux', description: 'Ouvert à tous' }
];

export default function EditEvent() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    description: '',
    location: '',
    date: '',
    maxParticipants: 4,
    skillLevel: 'all' as string,
    equipment: ''
  });

  const eventId = params.id as string;

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

      if (!eventData) {
        setError('Événement non trouvé');
        return;
      }

      if (eventData.creatorId !== user?.uid) {
        setError('Vous n&apos;êtes pas autorisé à modifier cet événement');
        return;
      }

      setEvent(eventData);

      // Format date for datetime-local input
      const formattedDate = new Date(eventData.date).toISOString().slice(0, 16);

      setFormData({
        title: eventData.title,
        sport: eventData.sport,
        description: eventData.description || '',
        location: eventData.location,
        date: formattedDate,
        maxParticipants: eventData.maxParticipants,
        skillLevel: eventData.skillLevel,
        equipment: eventData.equipment || ''
      });
    } catch (err) {
      setError('Erreur lors du chargement de l&apos;événement');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;

    // Validation
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }
    if (!formData.sport) {
      setError('Veuillez sélectionner un sport');
      return;
    }
    if (!formData.location.trim()) {
      setError('Le lieu est obligatoire');
      return;
    }
    if (!formData.date) {
      setError('La date est obligatoire');
      return;
    }

    const selectedDate = new Date(formData.date);
    if (selectedDate <= new Date()) {
      setError('La date doit être dans le futur');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await EventsService.updateEvent(eventId, {
        ...formData,
        date: selectedDate,
        skillLevel: formData.skillLevel as 'beginner' | 'intermediate' | 'advanced' | 'all'
      });

      router.push(`/events/${eventId}`);
    } catch (err) {
      setError('Erreur lors de la modification de l&apos;événement');
      console.error('Error updating event:', err);
    } finally {
      setIsSubmitting(false);
    }
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

  if (error && !event) {
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
                Erreur
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card variant="glass">
            <CardContent className="text-center py-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl">
              <span className="text-6xl mb-6 block">❌</span>
              <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Accès refusé
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Button
              variant="ghost"
              onClick={() => router.push(`/events/${eventId}`)}
              className="text-white hover:bg-white/20 mr-4"
            >
              ← Retour
            </Button>
            <h1 className="text-2xl font-bold text-white">
              ✏️ Modifier l&apos;événement
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Card variant="gradient" className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <span className="text-lg">⚠️</span>
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Titre de l&apos;événement *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ex: Football 5v5 - Terrain synthétique"
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
              />
            </CardContent>
          </Card>

          {/* Sport */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Sport *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SPORTS.map((sport) => (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => updateField('sport', sport.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      formData.sport === sport.id
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-lg mr-2">{sport.emoji}</span>
                    <span className="font-medium">{sport.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Décrivez votre événement..."
                rows={3}
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
              />
            </CardContent>
          </Card>

          {/* Lieu */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Lieu *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Ex: Stade Municipal, Paris 15e"
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
              />
            </CardContent>
          </Card>

          {/* Date et Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="gradient">
              <CardContent className="p-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date et heure *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                />
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardContent className="p-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre max de participants
                </label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={(e) => updateField('maxParticipants', parseInt(e.target.value))}
                  className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                />
              </CardContent>
            </Card>
          </div>

          {/* Niveau */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Niveau requis
              </label>
              <div className="space-y-2">
                {SKILL_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => updateField('skillLevel', level.id)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      formData.skillLevel === level.id
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium">{level.name}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Équipement */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Équipement nécessaire
              </label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) => updateField('equipment', e.target.value)}
                placeholder="Ex: Crampons recommandés, ballon fourni"
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
              />
            </CardContent>
          </Card>

          {/* Boutons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/events/${eventId}`)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.title || !formData.sport || !formData.location || !formData.date}
              className="flex-1"
            >
              {isSubmitting ? '⏳ Modification...' : '✅ Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}