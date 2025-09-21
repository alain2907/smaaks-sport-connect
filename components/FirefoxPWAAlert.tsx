'use client';

import { useState, useEffect } from 'react';

export default function FirefoxPWAAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [isFirefoxAndroid, setIsFirefoxAndroid] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isFirefox = /firefox/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isFirefox && isAndroid) {
      setIsFirefoxAndroid(true);

      // Check if user has seen the alert before
      const hasSeenAlert = localStorage.getItem('firefox-pwa-alert-seen');
      if (!hasSeenAlert) {
        // Show alert after 2 seconds
        const timer = setTimeout(() => {
          setShowAlert(true);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    setShowAlert(false);
    localStorage.setItem('firefox-pwa-alert-seen', 'true');
  };

  if (!isFirefoxAndroid || !showAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg z-50 animate-slide-down">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Firefox sur Android
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              Pour une meilleure expérience, installez SMAAKS Groups comme application :
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Menu ⋮ → Installer</li>
              <li><strong>Recommandé :</strong> Utilisez Chrome pour l&apos;installation automatique</li>
            </ul>
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié ! Ouvrez-le dans Chrome pour une installation automatique.');
                handleClose();
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
            >
              Copier le lien
            </button>
            <button
              onClick={handleClose}
              className="flex-1 text-xs font-medium text-amber-600 hover:text-amber-500"
            >
              Compris
            </button>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 flex-shrink-0"
        >
          <span className="sr-only">Fermer</span>
          <svg className="h-5 w-5 text-amber-400 hover:text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}