'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface RescheduleModalProps {
  isOpen: boolean;
  eventTitle: string;
  currentDate: Date;
  currentLocation: string;
  onConfirm: (newDate: Date, newLocation?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function RescheduleModal({
  isOpen,
  eventTitle,
  currentDate,
  currentLocation,
  onConfirm,
  onCancel,
  loading = false
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState(currentLocation);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDate || !newTime) {
      setError('Veuillez sélectionner une date et une heure');
      return;
    }

    // Vérifier que la nouvelle date est dans le futur
    const selectedDateTime = new Date(`${newDate}T${newTime}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      setError('La nouvelle date doit être dans le futur');
      return;
    }

    setError('');
    onConfirm(selectedDateTime, newLocation.trim() || undefined);
  };

  const handleCancel = () => {
    setNewDate('');
    setNewTime('');
    setNewLocation(currentLocation);
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Reprogrammer l&apos;événement
            </h2>
            <p className="text-gray-600 text-sm font-medium">
              {eventTitle}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Actuellement: {new Date(currentDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle date *
              </label>
              <input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="newTime" className="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle heure *
              </label>
              <input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="newLocation" className="block text-sm font-medium text-gray-700 mb-2">
                Lieu (optionnel - laisser vide pour conserver)
              </label>
              <input
                id="newLocation"
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={currentLocation}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? '⏳ Reprogrammation...' : '📅 Reprogrammer'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}