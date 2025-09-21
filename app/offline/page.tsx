'use client';

import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Vérifier le statut de connexion
    setIsOnline(navigator.onLine);

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Rediriger automatiquement quand la connexion revient
    if (isOnline) {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <div className="min-h-screen smaaks-bg-light flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m2.829 2.829l2.829 2.829M12.707 11.293a1 1 0 010 1.414m0 0l-2.829-2.829m2.829 2.829l2.829 2.829"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold smaaks-text-primary mb-4">
          {isOnline ? 'Connexion rétablie !' : 'Vous êtes hors ligne'}
        </h1>

        <p className="text-gray-600 mb-8">
          {isOnline
            ? 'Redirection en cours...'
            : 'Vérifiez votre connexion Internet pour continuer à utiliser SMAAKS Groups.'}
        </p>

        {!isOnline && (
          <>
            <div className="bg-purple-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-purple-900 mb-3">
                En attendant, vous pouvez :
              </h2>
              <ul className="text-left text-purple-700 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Vérifier vos paramètres réseau</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Vous rapprocher d&apos;un point d&apos;accès Wi-Fi</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Désactiver le mode avion si activé</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="smaaks-btn-primary w-full"
            >
              Réessayer
            </button>
          </>
        )}

        {isOnline && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}