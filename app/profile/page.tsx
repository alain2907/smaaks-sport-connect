'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { updateProfile, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  const { user, userData, updateUserProfile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteDataConfirm, setShowDeleteDataConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
    bio: '',
    city: '',
    region: '',
    country: ''
  });

  useEffect(() => {
    if (user && userData) {
      setFormData({
        displayName: user.displayName || '',
        photoURL: user.photoURL || userData.photoURL || '',
        bio: userData.profileData?.bio || '',
        city: userData.profileData?.location?.city || '',
        region: userData.profileData?.location?.region || '',
        country: userData.profileData?.location?.country || ''
      });
    }
  }, [user, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth profile
      if (user && (formData.displayName !== user.displayName || formData.photoURL !== user.photoURL)) {
        await updateProfile(user, {
          displayName: formData.displayName,
          photoURL: formData.photoURL || null
        });
      }

      // Update Firestore user document
      const updatedData = {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        profileData: {
          ...userData?.profileData,
          bio: formData.bio,
          age: userData?.profileData?.age || 25,
          lookingFor: userData?.profileData?.lookingFor || [],
          interests: userData?.profileData?.interests || [],
          skills: userData?.profileData?.skills || [],
          languages: userData?.profileData?.languages || ['Français'],
          photos: userData?.profileData?.photos || [],
          location: {
            city: formData.city,
            region: formData.region,
            country: formData.country
          },
          preferences: userData?.profileData?.preferences || {
            ageRange: { min: 18, max: 99 },
            distance: 50,
            availability: 'flexible' as const,
            preferredMeetingType: 'both' as const
          }
        }
      };

      await updateUserProfile(updatedData);

      setSuccess('Profil mis à jour avec succès !');

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: unknown) {
      setError('Erreur lors de la mise à jour du profil.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      const batch = writeBatch(db);

      // Supprimer les données utilisateur de toutes les collections
      const collections = ['groups', 'membershipRequests', 'groupPosts'];

      for (const collectionName of collections) {
        const userDataQuery = query(
          collection(db, collectionName),
          where('userId', '==', user.uid)
        );
        const userDataSnapshot = await getDocs(userDataQuery);

        userDataSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      // Supprimer le document utilisateur
      batch.delete(doc(db, 'users', user.uid));

      await batch.commit();

      setSuccess('Toutes vos données ont été supprimées.');
      setShowDeleteDataConfirm(false);
    } catch (err) {
      setError('Erreur lors de la suppression des données.');
      console.error('Data deletion error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      // Supprimer d'abord toutes les données
      await handleDeleteData();

      // Supprimer le compte utilisateur
      await deleteUser(user);

      router.push('/');
    } catch (err) {
      setError('Erreur lors de la suppression du compte. Veuillez vous reconnecter et réessayer.');
      console.error('Account deletion error:', err);
      setDeleteLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen smaaks-bg-light">
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au dashboard
            </button>
            <h1 className="text-3xl font-bold smaaks-text-primary">Mon Profil</h1>
            <p className="text-gray-600 mt-2">
              Personnalisez vos informations pour une meilleure expérience dans les groupes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photo Profile Card */}
            <div className="smaaks-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Photo de profil</h3>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  {formData.photoURL ? (
                    <img
                      src={formData.photoURL}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-32 h-32 rounded-full smaaks-bg-primary flex items-center justify-center text-white text-4xl font-bold ${formData.photoURL ? 'hidden' : ''}`}>
                    {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700 mb-2">
                      URL de la photo
                    </label>
                    <input
                      type="url"
                      id="photoURL"
                      name="photoURL"
                      value={formData.photoURL}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                      placeholder="https://exemple.com/photo.jpg"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Collez le lien d&apos;une photo hébergée en ligne (format JPG, PNG, WebP)
                  </p>
                  <p className="text-xs text-gray-400">
                    Recommandé : utilisez des services comme Imgur, Google Photos, ou votre photo de profil Google/LinkedIn
                  </p>
                </div>
              </div>
            </div>

            {/* Main Profile Form */}
            <div className="lg:col-span-2 smaaks-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-gray-900">Informations de base</h3>

                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d&apos;affichage *
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    required
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Comment vous voulez être appelé dans les groupes"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Inscription via {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</p>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    À propos de moi
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Parlez-nous de vous, vos passions, ce que vous recherchez dans les groupes..."
                  />
                  <p className="mt-1 text-sm text-gray-500">Aidez les autres à mieux vous connaître</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8">Localisation (facultatif)</h3>
                <p className="text-sm text-gray-600 mb-4">Ces informations aident à vous proposer des groupes dans votre région</p>

                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Paris"
                    />
                  </div>

                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                      Région
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Île-de-France"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="France"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full smaaks-btn-primary text-center py-3 text-lg disabled:opacity-50"
                  >
                    {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                  </button>
                </div>
              </form>
            </div>

            {/* Zone de danger */}
            <div className="mt-12 bg-red-50 rounded-lg p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Zone de danger</h3>
              <p className="text-sm text-red-700 mb-6">
                Ces actions sont irréversibles. Assurez-vous de bien comprendre les conséquences avant de continuer.
              </p>

              <div className="space-y-4">
                {/* Supprimer les données */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Supprimer mes données</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Supprime toutes vos données (profil, groupes, messages) mais conserve votre compte.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteDataConfirm(true)}
                    className="ml-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Supprimer les données
                  </button>
                </div>

                {/* Supprimer le compte */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Supprimer mon compte</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Supprime définitivement votre compte et toutes vos données. Cette action est irréversible.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteAccountConfirm(true)}
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Supprimer le compte
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de confirmation - Suppression des données */}
          {showDeleteDataConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirmer la suppression des données
                </h3>
                <p className="text-gray-600 mb-6">
                  Cette action supprimera toutes vos données (profil, groupes créés, messages) de manière définitive.
                  Votre compte restera actif mais vide.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteDataConfirm(false)}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteData}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md disabled:opacity-50"
                  >
                    {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmation - Suppression du compte */}
          {showDeleteAccountConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">
                  ⚠️ Confirmer la suppression du compte
                </h3>
                <p className="text-gray-600 mb-4">
                  <strong>Cette action est irréversible !</strong>
                </p>
                <p className="text-gray-600 mb-6">
                  Votre compte et toutes vos données seront définitivement supprimés.
                  Vous ne pourrez pas récupérer ces informations.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteAccountConfirm(false)}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50"
                  >
                    {deleteLoading ? 'Suppression...' : 'SUPPRIMER DÉFINITIVEMENT'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}