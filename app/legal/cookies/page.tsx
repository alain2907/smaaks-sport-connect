import Footer from '@/components/Footer';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Politique des Cookies
          </h1>

          <div className="space-y-6 text-gray-700">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
              <p className="mb-4">
                Cette politique explique comment SMAAKS Groups utilise les cookies et technologies similaires
                pour améliorer votre expérience sur notre plateforme.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
              <p className="mb-4">
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette)
                lors de votre visite sur un site web. Il permet au site de mémoriser vos préférences et actions
                pour améliorer votre expérience de navigation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Types de cookies utilisés</h2>

              <h3 className="text-lg font-semibold mb-3">2.1 Cookies strictement nécessaires</h3>
              <p className="mb-4">
                Ces cookies sont essentiels au fonctionnement de SMAAKS Groups et ne peuvent pas être désactivés :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Authentification</strong> : maintien de votre session de connexion</li>
                <li><strong>Sécurité</strong> : protection contre les attaques CSRF</li>
                <li><strong>Préférences</strong> : mémorisation de vos paramètres (langue, thème)</li>
                <li><strong>Navigation</strong> : fonctionnement correct des fonctionnalités interactives</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">2.2 Cookies de performance et d&apos;analyse</h3>
              <p className="mb-4">
                Ces cookies nous aident à comprendre comment vous utilisez notre plateforme (avec votre consentement) :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google Analytics</strong> : statistiques de fréquentation anonymisées</li>
                <li><strong>Métriques de performance</strong> : temps de chargement, erreurs techniques</li>
                <li><strong>Amélioration UX</strong> : identification des fonctionnalités populaires</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">2.3 Cookies fonctionnels</h3>
              <p className="mb-4">
                Ces cookies améliorent votre expérience mais ne sont pas essentiels :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Personnalisation</strong> : recommandations de groupes adaptées</li>
                <li><strong>Contenu local</strong> : affichage de groupes dans votre région</li>
                <li><strong>Interactions</strong> : mémorisation de vos préférences d&apos;affichage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cookies tiers</h2>
              <p className="mb-4">Nous utilisons des services tiers qui peuvent déposer leurs propres cookies :</p>

              <h3 className="text-lg font-semibold mb-3">3.1 Google Services</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Firebase Authentication</strong> : gestion sécurisée des connexions</li>
                <li><strong>Google Analytics</strong> : mesure d&apos;audience anonymisée</li>
                <li><strong>reCAPTCHA</strong> : protection contre le spam et les bots</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">3.2 Hébergement</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Vercel</strong> : cookies techniques pour la performance et la sécurité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Durée de conservation</h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li><strong>Cookies de session</strong> : supprimés à la fermeture du navigateur</li>
                  <li><strong>Cookies d&apos;authentification</strong> : 30 jours maximum</li>
                  <li><strong>Cookies de préférences</strong> : 1 an maximum</li>
                  <li><strong>Cookies d&apos;analyse</strong> : 2 ans maximum (Google Analytics)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Gestion de vos préférences</h2>
              <p className="mb-4">Vous pouvez contrôler l&apos;utilisation des cookies de plusieurs façons :</p>

              <h3 className="text-lg font-semibold mb-3">5.1 Paramètres de la plateforme</h3>
              <p className="mb-4">
                Un bandeau de consentement vous permet de choisir quels types de cookies accepter lors de
                votre première visite. Vous pouvez modifier vos préférences à tout moment dans les paramètres
                de votre compte.
              </p>

              <h3 className="text-lg font-semibold mb-3">5.2 Paramètres du navigateur</h3>
              <p className="mb-4">Tous les navigateurs permettent de gérer les cookies :</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong>Firefox</strong> : Préférences → Vie privée et sécurité → Cookies</li>
                <li><strong>Safari</strong> : Préférences → Confidentialité → Cookies</li>
                <li><strong>Edge</strong> : Paramètres → Cookies et autorisations de site</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <p className="text-yellow-800">
                  <strong>⚠️ Attention :</strong> Désactiver tous les cookies peut affecter le fonctionnement
                  de SMAAKS Groups. Certaines fonctionnalités peuvent ne plus être disponibles.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Opposition aux cookies d&apos;analyse</h2>
              <p className="mb-4">
                Vous pouvez vous opposer spécifiquement aux cookies d&apos;analyse :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>
                  <strong>Google Analytics</strong> :
                  <a href="https://tools.google.com/dlpage/gaoptout"
                     className="text-indigo-600 hover:text-indigo-800 ml-1"
                     target="_blank"
                     rel="noopener noreferrer">
                    Module de désactivation
                  </a>
                </li>
                <li><strong>Paramètres SMAAKS Groups</strong> : option dans votre profil utilisateur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies sur mobile</h2>
              <p className="mb-4">
                Sur mobile, les cookies peuvent être gérés via les paramètres de votre navigateur mobile.
                Notre application web responsive applique les mêmes règles de cookies que sur desktop.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Évolutions de cette politique</h2>
              <p className="mb-4">
                Cette politique des cookies peut être mise à jour pour refléter des changements dans nos
                pratiques ou la réglementation. Nous vous informerons de toute modification significative
                par une notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact</h2>
              <p>
                Pour toute question sur notre utilisation des cookies, contactez-nous :
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mt-4">
                <p><strong>Email :</strong> <a href="mailto:contact@smaaks.fr" className="text-indigo-600">contact@smaaks.fr</a></p>
                <p><strong>Courrier :</strong> CORBERA 10 SAS - 71 rue Jean de Bernardy, 13001 Marseille</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}