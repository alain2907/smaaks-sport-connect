'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsersService } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface UsernameSetupProps {
  isOpen: boolean;
  onComplete: (username: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export function UsernameSetup({
  isOpen,
  onComplete,
  onCancel,
  title = "Choisissez votre nom d&apos;utilisateur",
  description = "Votre nom d&apos;utilisateur sera visible par les autres utilisateurs et ne peut pas être modifié."
}: UsernameSetupProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Générer un username par défaut basé sur l'email
  useEffect(() => {
    if (user?.email && !username) {
      const defaultUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setUsername(defaultUsername);
    }
  }, [user?.email, username]);

  // Vérifier la disponibilité du username avec un délai
  useEffect(() => {
    if (!username || username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      try {
        const taken = await UsersService.isUsernameTaken(username);
        setIsAvailable(!taken);
      } catch (err) {
        console.error('Error checking username:', err);
        setIsAvailable(null);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    if (!username || username.length < 3) {
      setError('Le nom d&apos;utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Le nom d&apos;utilisateur ne peut contenir que des lettres minuscules, chiffres et underscores');
      return;
    }

    if (isAvailable === false) {
      setError('Ce nom d&apos;utilisateur est déjà pris');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mettre à jour le profil utilisateur avec le username
      await UsersService.createOrUpdateUser(user.uid, {
        username,
        email: user.email || '',
        displayName: user.displayName || undefined,
      });

      onComplete(username);
    } catch (err) {
      console.error('Error setting username:', err);
      setError('Erreur lors de la sauvegarde du nom d&apos;utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    // Nettoyer automatiquement l'input
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {title}
            </h2>
            <p className="text-gray-600 text-sm">
              {description}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d&apos;utilisateur *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">@</span>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full pl-8 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    error ? 'border-red-300' :
                    isAvailable === true ? 'border-green-300' :
                    isAvailable === false ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="votrenom"
                  minLength={3}
                  maxLength={20}
                  required
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isAvailable === true && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                  {isAvailable === false && (
                    <span className="text-red-500 text-sm">✗</span>
                  )}
                </div>
              </div>

              <div className="mt-2 text-sm">
                {isAvailable === true && (
                  <p className="text-green-600">✓ Nom d&apos;utilisateur disponible</p>
                )}
                {isAvailable === false && (
                  <p className="text-red-600">✗ Nom d&apos;utilisateur déjà pris</p>
                )}
                <p className="text-gray-500 mt-1">
                  3-20 caractères, lettres minuscules, chiffres et _ seulement
                </p>
              </div>
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
                disabled={loading || !username || username.length < 3 || isAvailable !== true}
              >
                {loading ? '⏳ Sauvegarde...' : '✓ Confirmer'}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}