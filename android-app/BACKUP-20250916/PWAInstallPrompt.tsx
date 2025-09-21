'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    install,
    isIOS,
    isAndroid,
    isFirefox,
    isSafari,
    isChrome,
    isEdge,
  } = usePWAInstall();

  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }

    // Show prompt after 3 seconds if installable or on iOS Safari
    const timer = setTimeout(() => {
      if (!isInstalled && !wasDismissed && (isInstallable || (isIOS && isSafari))) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS, isSafari]);

  const handleInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || dismissed || !showPrompt) {
    return null;
  }

  // iOS Safari specific instructions
  if (isIOS && isSafari) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-purple-100 p-6 z-50 animate-slide-up">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img src="/icons/icon-72x72.png" alt="SMAAKS Groups" className="w-12 h-12 rounded-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Installer SMAAKS Groups sur iOS
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ajoutez l&apos;application à votre écran d&apos;accueil pour un accès rapide et une expérience optimale.
            </p>

            <ol className="text-sm text-gray-700 space-y-2 mb-4">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                Appuyez sur le bouton <span className="inline-flex items-center px-2 py-0.5 mx-1 bg-blue-50 text-blue-700 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v5.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 8.586V3a1 1 0 011-1z"/>
                    <path d="M5 11a1 1 0 011 1v5h8v-5a1 1 0 112 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a1 1 0 011-1z"/>
                  </svg>
                  Partager
                </span> en bas
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                Faites défiler et appuyez sur <span className="font-medium text-purple-600">&quot;Sur l&apos;écran d&apos;accueil&quot;</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                Appuyez sur <span className="font-medium text-purple-600">&quot;Ajouter&quot;</span> en haut à droite
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Me le rappeler plus tard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Firefox on Android specific instructions
  if (isFirefox && isAndroid) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-purple-100 p-6 z-50 animate-slide-up">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img src="/icons/icon-72x72.png" alt="SMAAKS Groups" className="w-12 h-12 rounded-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Installer SMAAKS Groups sur Firefox
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ajoutez l&apos;application à votre écran d&apos;accueil pour un accès rapide.
            </p>

            <ol className="text-sm text-gray-700 space-y-2 mb-4">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                Appuyez sur le menu <span className="inline-flex items-center px-2 py-0.5 mx-1 bg-orange-50 text-orange-700 rounded">⋮</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                Sélectionnez <span className="font-medium text-purple-600">&quot;Installer&quot;</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                Confirmez l&apos;installation
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Me le rappeler plus tard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chrome, Edge, Samsung Internet (supports beforeinstallprompt)
  if (isInstallable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-purple-100 p-6 z-50 animate-slide-up">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img src="/icons/icon-72x72.png" alt="SMAAKS Groups" className="w-12 h-12 rounded-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Installer SMAAKS Groups
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Installez l&apos;application pour un accès rapide, des notifications et une utilisation hors ligne.
            </p>

            <div className="bg-purple-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">Avantages :</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Accès rapide depuis l&apos;écran d&apos;accueil
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Fonctionne hors ligne
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Notifications instantanées
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Installer maintenant
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic browser instructions with Chrome recommendation
  if (!isInstalled && !isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-purple-100 p-6 z-50 animate-slide-up">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img src="/icons/icon-72x72.png" alt="SMAAKS Groups" className="w-12 h-12 rounded-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Installer SMAAKS Groups
            </h3>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                💡 Recommandation
              </p>
              <p className="text-sm text-blue-700">
                Pour une installation plus simple, ouvrez cette page dans <strong>Chrome</strong> ou <strong>Edge</strong> - l&apos;installation se fera automatiquement !
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Ou depuis ce navigateur :
            </p>

            <ol className="text-sm text-gray-700 space-y-2 mb-4">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                Ouvrez le menu du navigateur (⋮ ou ⋯)
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                Cherchez <span className="font-medium text-purple-600">&quot;Installer l&apos;application&quot;</span> ou <span className="font-medium text-purple-600">&quot;Ajouter à l&apos;écran d&apos;accueil&quot;</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                Suivez les instructions
              </li>
            </ol>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Copy current URL to clipboard for easy sharing
                  navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié ! Collez-le dans Chrome ou Edge pour une installation automatique.');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Copier le lien
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}