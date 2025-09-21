import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Politique de Confidentialité
          </h1>

          <div className="space-y-6 text-gray-700">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
              <p className="mb-4">
                Cette politique de confidentialité décrit comment CORBERA 10 SAS collecte, utilise et protège
                vos données personnelles lorsque vous utilisez SMAAKS Groups.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Responsable du traitement</h2>
              <p className="mb-4">
                Le responsable du traitement de vos données personnelles est :
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>CORBERA 10 SAS</strong></p>
                <p>71 rue Jean de Bernardy</p>
                <p>13001 Marseille, France</p>
                <p>SIREN : 529 138 919</p>
                <p>Email : <a href="mailto:contact@smaaks.fr" className="text-indigo-600">contact@smaaks.fr</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
              <p className="mb-4">Nous collectons les types de données suivants :</p>

              <h3 className="text-lg font-semibold mb-2">2.1 Données d&apos;inscription</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Date de création du compte</li>
                <li>Méthode d&apos;authentification (email/mot de passe ou Google)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">2.2 Données de profil</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Photo de profil (URL)</li>
                <li>Biographie personnelle</li>
                <li>Localisation (ville, région, pays) - facultatif</li>
                <li>Centres d&apos;intérêt</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">2.3 Données d&apos;utilisation</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Groupes rejoints et créés</li>
                <li>Messages et interactions</li>
                <li>Historique de connexion</li>
                <li>Préférences de l&apos;application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Base légale du traitement</h2>
              <p className="mb-4">Le traitement de vos données repose sur :</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Exécution du contrat</strong> : pour fournir nos services</li>
                <li><strong>Intérêt légitime</strong> : pour améliorer nos services et assurer la sécurité</li>
                <li><strong>Consentement</strong> : pour l&apos;envoi de communications marketing (optionnel)</li>
                <li><strong>Obligation légale</strong> : pour respecter les obligations réglementaires</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Finalités du traitement</h2>
              <p className="mb-4">Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Vous permettre de rejoindre et créer des groupes</li>
                <li>Faciliter les interactions entre membres</li>
                <li>Personnaliser votre expérience</li>
                <li>Assurer la sécurité et prévenir les abus</li>
                <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
                <li>Vous envoyer des notifications importantes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Partage des données</h2>
              <p className="mb-4">
                Nous ne vendons jamais vos données personnelles à des tiers. Vos données peuvent être partagées
                uniquement dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Avec d&apos;autres utilisateurs</strong> : les informations de profil que vous choisissez de rendre publiques</li>
                <li><strong>Prestataires techniques</strong> : Firebase (Google), Vercel pour l&apos;hébergement</li>
                <li><strong>Obligation légale</strong> : sur demande des autorités compétentes</li>
                <li><strong>Protection des droits</strong> : en cas de violation des conditions d&apos;utilisation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Localisation des données</h2>
              <p className="mb-4">
                Toutes vos données personnelles sont stockées et traitées exclusivement au sein de l&apos;Union Européenne :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Base de données</strong> : Firebase Firestore (région Europe)</li>
                <li><strong>Authentification</strong> : Firebase Auth (région Europe)</li>
                <li><strong>Application</strong> : Vercel (région Europe - CDG1 Paris)</li>
              </ul>
              <p>
                Aucune donnée personnelle n&apos;est transférée vers des pays tiers en dehors de l&apos;UE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Durée de conservation</h2>
              <p className="mb-4">Nous conservons vos données :</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Compte actif</strong> : pendant toute la durée d&apos;utilisation de nos services</li>
                <li><strong>Compte supprimé</strong> : 30 jours maximum pour permettre une récupération</li>
                <li><strong>Données de sécurité</strong> : 1 an maximum pour prévenir les abus</li>
                <li><strong>Obligations légales</strong> : selon les exigences réglementaires applicables</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Vos droits</h2>
              <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Accès</strong> : obtenir une copie de vos données</li>
                <li><strong>Rectification</strong> : corriger des données inexactes</li>
                <li><strong>Effacement</strong> : demander la suppression de vos données</li>
                <li><strong>Limitation</strong> : restreindre certains traitements</li>
                <li><strong>Portabilité</strong> : récupérer vos données dans un format structuré</li>
                <li><strong>Opposition</strong> : vous opposer à certains traitements</li>
                <li><strong>Retrait du consentement</strong> : pour les traitements basés sur le consentement</li>
              </ul>
              <p className="mb-4">
                Pour exercer ces droits, contactez-nous à :
                <a href="mailto:contact@smaaks.fr" className="text-indigo-600 hover:text-indigo-800 ml-1">
                  contact@smaaks.fr
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Sécurité des données</h2>
              <p className="mb-4">
                Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger
                vos données contre les accès non autorisés, les pertes ou les fuites :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Chiffrement des données en transit et au repos</li>
                <li>Authentification forte et contrôles d&apos;accès</li>
                <li>Surveillance et logging des accès</li>
                <li>Sauvegardes régulières et plan de continuité</li>
                <li>Formation de notre équipe aux bonnes pratiques</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Cookies et traceurs</h2>
              <p className="mb-4">
                Notre utilisation des cookies est détaillée dans notre Politique des cookies. Nous utilisons
                uniquement des cookies essentiels au fonctionnement de la plateforme et des cookies d&apos;analyse
                avec votre consentement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modifications</h2>
              <p className="mb-4">
                Cette politique peut être mise à jour pour refléter des changements dans nos pratiques ou
                la réglementation. Nous vous informerons de toute modification significative par email ou
                notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact et réclamations</h2>
              <p className="mb-4">
                Pour toute question ou réclamation concernant le traitement de vos données personnelles :
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p><strong>Email :</strong> <a href="mailto:contact@smaaks.fr" className="text-indigo-600">contact@smaaks.fr</a></p>
                <p><strong>Courrier :</strong> CORBERA 10 SAS - 71 rue Jean de Bernardy, 13001 Marseille</p>
              </div>
              <p>
                Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale
                de l&apos;Informatique et des Libertés) si vous estimez que vos droits ne sont pas respectés.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}