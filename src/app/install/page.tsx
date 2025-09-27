'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// TypeScript interface for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [userAgent, setUserAgent] = useState<string>('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Détecter le navigateur
    const ua = navigator.userAgent.toLowerCase();
    setUserAgent(ua);

    // Vérifier si l'app est déjà installée (uniquement si vraiment en standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
    }

    // Capturer l'événement beforeinstallprompt pour Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter iOS
    const isIOS = /iphone|ipad|ipod/.test(ua) && !('MSStream' in window);
    if (isIOS && !isStandalone && !isIOSStandalone) {
      setShowIOSInstructions(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
  const isEdge = userAgent.includes('edg');
  const isFirefox = userAgent.includes('firefox');
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
  const isSamsung = userAgent.includes('samsungbrowser');
  const isOpera = userAgent.includes('opera') || userAgent.includes('opr');

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-gray-800">
              ✅ Application Installée !
            </h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              SMAAKS Sport Connect est déjà installé sur votre appareil.
            </p>
            <Link href="/dashboard">
              <Button variant="primary" className="w-full max-w-xs">
                Aller au Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            📱 Installer SMAAKS Sport Connect
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Installez l&apos;application sur votre appareil pour un accès rapide
          </p>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Bouton d'installation direct (Chrome/Edge sur Android uniquement) */}
          {deferredPrompt && !isFirefox && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <Button
                onClick={handleInstallClick}
                variant="primary"
                className="w-full"
              >
                📥 Installer l&apos;Application
              </Button>
              <p className="text-xs text-green-700 mt-2 text-center">
                Cliquez pour installer directement
              </p>
            </div>
          )}

          {/* Instructions Chrome */}
          {(isChrome || (!deferredPrompt && !showIOSInstructions && !isFirefox && !isEdge && !isSamsung && !isOpera)) && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg" alt="Chrome" className="w-6 h-6 mr-2" />
                Google Chrome
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Sur Android :</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Appuyez sur le menu <strong>⋮</strong> (3 points) en haut à droite</li>
                  <li>Sélectionnez <strong>&quot;Installer l&apos;application&quot;</strong></li>
                  <li>Confirmez en appuyant sur <strong>&quot;Installer&quot;</strong></li>
                </ol>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Sur Desktop :</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Cliquez sur l&apos;icône <strong>⊕</strong> dans la barre d&apos;adresse</li>
                  <li>Ou menu <strong>⋮</strong> → <strong>&quot;Installer SMAAKS Sport Connect&quot;</strong></li>
                  <li>Confirmez l&apos;installation</li>
                </ol>
              </div>
            </div>
          )}

          {/* Instructions Safari iOS */}
          {showIOSInstructions && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/safari.svg" alt="Safari" className="w-6 h-6 mr-2" />
                Safari (iOS/iPadOS)
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Appuyez sur le bouton <strong>Partager</strong>
                    <span className="inline-block mx-1">
                      <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 4.026a9.001 9.001 0 007.432 0" />
                      </svg>
                    </span>
                    en bas de l&apos;écran
                  </li>
                  <li>Faites défiler et appuyez sur <strong>&quot;Sur l&apos;écran d&apos;accueil&quot;</strong>
                    <span className="inline-block mx-1">➕</span>
                  </li>
                  <li>Appuyez sur <strong>&quot;Ajouter&quot;</strong> en haut à droite</li>
                  <li>L&apos;app apparaîtra sur votre écran d&apos;accueil</li>
                </ol>
                <p className="text-xs text-orange-700 mt-3">
                  ⚠️ Utilisez Safari pour installer l&apos;app sur iOS
                </p>
              </div>
            </div>
          )}

          {/* Instructions Edge */}
          {isEdge && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftedge.svg" alt="Edge" className="w-6 h-6 mr-2" />
                Microsoft Edge
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Cliquez sur le menu <strong>⋯</strong> (3 points)</li>
                  <li>Sélectionnez <strong>&quot;Applications&quot;</strong></li>
                  <li>Cliquez sur <strong>&quot;Installer ce site en tant qu&apos;application&quot;</strong></li>
                  <li>Confirmez l&apos;installation</li>
                </ol>
              </div>
            </div>
          )}

          {/* Instructions Firefox */}
          {isFirefox && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/firefox.svg" alt="Firefox" className="w-6 h-6 mr-2" />
                Mozilla Firefox
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-yellow-800">
                    ⚠️ Firefox ne propose pas d&apos;installation automatique
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Vous pouvez ajouter un raccourci manuellement
                  </p>
                </div>

                <h3 className="font-semibold mb-2">Sur Android :</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Appuyez sur le menu <strong>⋮</strong> (3 points)</li>
                  <li>Recherchez <strong>&quot;Ajouter à l&apos;écran d&apos;accueil&quot;</strong></li>
                  <li>Confirmez l&apos;ajout du raccourci</li>
                </ol>

                <h3 className="font-semibold mb-2 mt-4">Sur Desktop :</h3>
                <p className="text-sm text-orange-700">
                  Firefox desktop ne supporte pas l&apos;installation PWA.
                  Utilisez Chrome, Edge ou Safari pour une meilleure expérience.
                </p>
              </div>
            </div>
          )}

          {/* Instructions Samsung Internet */}
          {isSamsung && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">
                Samsung Internet
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Appuyez sur le menu <strong>☰</strong> en bas</li>
                  <li>Sélectionnez <strong>&quot;Ajouter la page à&quot;</strong></li>
                  <li>Choisissez <strong>&quot;Écran d&apos;accueil&quot;</strong></li>
                  <li>Confirmez l&apos;ajout</li>
                </ol>
              </div>
            </div>
          )}

          {/* Instructions Opera */}
          {isOpera && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg flex items-center">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/opera.svg" alt="Opera" className="w-6 h-6 mr-2" />
                Opera
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Cliquez sur le menu Opera <strong>O</strong></li>
                  <li>Sélectionnez <strong>&quot;Installer l&apos;application&quot;</strong></li>
                  <li>Confirmez l&apos;installation</li>
                </ol>
              </div>
            </div>
          )}

          {/* Avantages de l'installation */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3">🌟 Avantages de l&apos;installation</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Accès rapide depuis l&apos;écran d&apos;accueil</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Expérience plein écran sans barre d&apos;adresse</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Notifications (bientôt disponible)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Fonctionne hors ligne pour certaines pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Performances optimisées</span>
              </li>
            </ul>
          </div>

          {/* Fallback - Instructions génériques si rien ne s'affiche */}
          {!isChrome && !isFirefox && !isEdge && !isSamsung && !isOpera && !showIOSInstructions && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">
                🌐 Instructions générales
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm mb-3">
                  Pour installer l&apos;application sur votre appareil :
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Cherchez l&apos;option <strong>&quot;Installer l&apos;application&quot;</strong> dans le menu du navigateur</li>
                  <li>Ou ajoutez un raccourci vers l&apos;écran d&apos;accueil</li>
                  <li>Pour une meilleure expérience, utilisez Chrome, Edge ou Safari</li>
                </ol>
              </div>
            </div>
          )}

          {/* Bouton retour */}
          <div className="mt-6 text-center">
            <Link href="/dashboard">
              <Button variant="outline">
                Continuer sans installer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}