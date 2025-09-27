'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import Link from 'next/link';

// TypeScript interface for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Vérifier si déjà fermé récemment
    const dismissed = localStorage.getItem('install-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    if (dismissedTime > oneDayAgo) {
      return; // Ne pas afficher si fermé dans les dernières 24h
    }

    // Détecter le navigateur et dispositif
    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !('MSStream' in window);
    const isSafari = /safari/.test(ua) && !/chrome|crios|firefox|fxios/.test(ua);
    const isFirefox = /firefox/.test(ua);

    // Afficher pour iOS Safari
    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setShowBanner(true);
    }

    // Afficher aussi pour Firefox (toutes plateformes)
    if (isFirefox) {
      setShowBanner(true);
    }

    // Détecter Chrome/Edge Android avec prompt d'installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('install-banner-dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-semibold text-sm">Installer SMAAKS Sport Connect</p>
              <p className="text-xs opacity-90">
                {isIOS
                  ? 'Appuyez sur Partager puis "Sur l\'écran d\'accueil"'
                  : 'Accès rapide depuis votre écran d\'accueil'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {deferredPrompt ? (
              <Button
                onClick={handleInstallClick}
                variant="primary"
                className="bg-white text-purple-600 hover:bg-gray-100 px-3 py-1 text-sm"
              >
                Installer
              </Button>
            ) : (
              <Link href="/install">
                <Button
                  variant="primary"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-3 py-1 text-sm"
                >
                  Instructions
                </Button>
              </Link>
            )}
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 p-1"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}