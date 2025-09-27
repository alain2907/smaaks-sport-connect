'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useState } from 'react';

export default function CookiesPolicy() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const handleSavePreferences = () => {
    // Sauvegarder les préférences dans localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    alert('Vos préférences ont été enregistrées');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 mr-4"
            >
              ← Retour
            </Button>
            <h1 className="text-2xl font-bold text-white">
              🍪 Politique des Cookies
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="glass">
          <CardContent className="prose prose-gray max-w-none p-8">
            <p className="text-sm text-gray-600 mb-6">
              Dernière mise à jour : 25/09/2025
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-sm">
                Cette politique explique comment SMAAKS Sport Connect utilise les cookies et technologies similaires pour améliorer votre expérience.
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="mb-6">
              Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. Les cookies permettent au site de reconnaître votre appareil et de mémoriser vos préférences ou actions.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Types de cookies utilisés</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Cookies essentiels (obligatoires)</h3>
            <p className="mb-4">
              Ces cookies sont nécessaires au fonctionnement de la plateforme et ne peuvent pas être désactivés.
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Authentification :</strong> Maintenir votre session connectée</li>
              <li><strong>Sécurité :</strong> Protéger contre les attaques CSRF</li>
              <li><strong>Préférences :</strong> Mémoriser vos choix de langue et paramètres</li>
              <li><strong>Navigation :</strong> Permettre la navigation entre les pages</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Cookies analytiques (optionnels)</h3>
            <p className="mb-4">
              Ces cookies nous aident à comprendre comment vous utilisez la plateforme pour l&apos;améliorer.
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Google Analytics :</strong> Analyse du trafic et comportement des utilisateurs</li>
              <li><strong>Hotjar :</strong> Cartes de chaleur et enregistrements de sessions (anonymisés)</li>
              <li>Durée de conservation : 13 mois maximum</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Cookies marketing (optionnels)</h3>
            <p className="mb-4">
              Ces cookies permettent de vous proposer des contenus personnalisés.
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li><strong>Facebook Pixel :</strong> Mesure des performances publicitaires</li>
              <li><strong>Google Ads :</strong> Remarketing et conversion</li>
              <li>Durée de conservation : 90 jours maximum</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Gestion de vos préférences</h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-4">Personnalisez vos préférences cookies :</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">🔒 Cookies essentiels</p>
                    <p className="text-sm text-gray-600">Nécessaires au fonctionnement du site</p>
                  </div>
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600 cursor-not-allowed opacity-75"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">📊 Cookies analytiques</p>
                    <p className="text-sm text-gray-600">Nous aident à améliorer la plateforme</p>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.analytics ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">🎯 Cookies marketing</p>
                    <p className="text-sm text-gray-600">Pour des contenus personnalisés</p>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.marketing ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleSavePreferences}
                className="w-full mt-6"
              >
                💾 Sauvegarder mes préférences
              </Button>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Cookies tiers</h2>
            <p className="mb-6">
              Certains services tiers peuvent placer leurs propres cookies :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li><strong>Firebase (Google) :</strong> Authentification et base de données</li>
              <li><strong>Vercel :</strong> Hébergement et performances</li>
              <li><strong>YouTube :</strong> Si des vidéos sont intégrées</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Désactiver les cookies</h2>
            <p className="mb-4">
              Vous pouvez désactiver les cookies dans votre navigateur :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li><strong>Chrome :</strong> Paramètres → Confidentialité → Cookies</li>
              <li><strong>Firefox :</strong> Options → Vie privée → Cookies</li>
              <li><strong>Safari :</strong> Préférences → Confidentialité</li>
              <li><strong>Edge :</strong> Paramètres → Cookies et autorisations</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm">
                ⚠️ La désactivation des cookies essentiels peut affecter le fonctionnement de la plateforme.
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Durée de conservation</h2>
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Type de cookie</th>
                  <th className="text-left py-2">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Session</td>
                  <td className="py-2">Supprimés à la fermeture du navigateur</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Authentification</td>
                  <td className="py-2">30 jours</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Préférences</td>
                  <td className="py-2">1 an</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Analytiques</td>
                  <td className="py-2">13 mois</td>
                </tr>
                <tr>
                  <td className="py-2">Marketing</td>
                  <td className="py-2">90 jours</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Vos droits</h2>
            <p className="mb-6">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition concernant vos données collectées via les cookies.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Modifications</h2>
            <p className="mb-6">
              Cette politique peut être mise à jour. Nous vous informerons de tout changement significatif.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Contact</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>Pour toute question concernant les cookies :</p>
              <p><strong>CORBERA 10 SAS</strong></p>
              <p>Email : contact@smaaks.fr</p>
              <p>Adresse : 71 rue Jean de Bernardy, 13001 Marseille</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button
            variant="primary"
            onClick={() => router.back()}
            className="px-8"
          >
            ← Retour
          </Button>
        </div>
      </div>
    </div>
  );
}