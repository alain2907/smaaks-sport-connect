'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
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
  { id: 'intermediate', name: 'Intermédiaire', description: 'J&apos;ai quelques bases' },
  { id: 'advanced', name: 'Avancé', description: 'J&apos;ai un bon niveau' },
  { id: 'all', name: 'Tous niveaux', description: 'Ouvert à tous' }
];

export default function Create() {
  const router = useRouter();
  const { user } = useAuth();
  const { createEvent } = useEvents();

  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    description: '',
    location: '',
    date: '',
    maxParticipants: 4,
    skillLevel: 'all' as const,
    equipment: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const eventData = {
      ...formData,
      date: new Date(formData.date),
      creatorId: user.uid
    };

    const eventId = await createEvent(eventData);

    if (eventId) {
      router.push('/dashboard');
    }

    setIsSubmitting(false);
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20 flex items-center justify-center">
        <Card variant="gradient">
          <CardContent className="text-center py-8">
            <span className="text-4xl mb-4 block">🔒</span>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Connexion requise
            </h2>
            <p className="text-gray-500 mb-4">
              Connectez-vous pour créer un événement
            </p>
            <Button onClick={() => router.push('/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <h1 className="text-2xl font-bold text-white">
              ➕ Créer une disponibilité
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <Card variant="gradient">
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Titre de l'événement *
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
              onClick={() => router.back()}
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
              {isSubmitting ? '⏳ Création...' : '🚀 Créer l\'événement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}