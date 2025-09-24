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
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    location: '',
    sports: [],
    availability: [],
  });

  const loadUserProfile = useCallback(async () => {
    if (!user || !db) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile({
          displayName: data.displayName || user.displayName || '',
          bio: data.bio || '',
          location: data.location || '',
          sports: data.sports || [],
          availability: data.availability || [],
          phone: data.phone,
          age: data.age,
        });
      } else {
        setProfile(prev => ({
          ...prev,
          displayName: user.displayName || user.email?.split('@')[0] || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const handleSaveProfile = async () => {
    if (!user || !db) return;

    setLoading(true);
    try {
      if (profile.displayName && profile.displayName !== user.displayName && auth?.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profile.displayName,
        });
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        email: user.email,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSport = (sportId: string, level: SportLevel) => {
    setProfile(prev => {
      const existingSport = prev.sports.find(s => s.sportId === sportId);

      if (existingSport) {
        if (existingSport.level === level) {
          return {
            ...prev,
            sports: prev.sports.filter(s => s.sportId !== sportId),
          };
        }
        return {
          ...prev,
          sports: prev.sports.map(s =>
            s.sportId === sportId ? { ...s, level } : s
          ),
        };
      }

      return {
        ...prev,
        sports: [...prev.sports, { sportId, level }],
      };
    });
  };

  const toggleAvailability = (day: string) => {
    setProfile(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day],
    }));
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
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nom d'affichage"
                    />
                    <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  </div>
                </div>

                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bio (parle de toi en quelques mots)"
                  rows={3}
                />

                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ville ou quartier"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Téléphone (optionnel)"
                  />
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
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
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      loadUserProfile();
                    }}
                    disabled={loading}
                  >
                    Annuler
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
                onClick={() => router.push('/settings/notifications')}
              >
                🔔 Notifications
              </Button>
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
    </div>
  );
}