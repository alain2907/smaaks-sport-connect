import Footer from '@/components/Footer';

export default function ChildSafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Sécurité des Enfants
          </h1>

          <div className="space-y-6 text-gray-700">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
              <p className="mb-4">
                La sécurité des enfants et des mineurs est une priorité absolue pour SMAAKS Groups.
                Cette page détaille nos mesures de protection et nos recommandations pour assurer
                un environnement sûr pour tous nos utilisateurs.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Âge minimum et vérification</h2>
              <h3 className="text-lg font-semibold mb-3">1.1 Restriction d&apos;âge</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Âge minimum requis :</strong> 16 ans révolus</li>
                <li><strong>Mineurs de 16 à 18 ans :</strong> autorisation parentale obligatoire</li>
                <li><strong>Moins de 16 ans :</strong> accès interdit à la plateforme</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">1.2 Contrôles parentaux</h3>
              <p className="mb-4">
                Pour les utilisateurs âgés de 16 à 18 ans, nous recommandons fortement l&apos;implication
                des parents ou tuteurs légaux dans l&apos;utilisation de la plateforme :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Discussion préalable sur l&apos;utilisation responsable des réseaux sociaux</li>
                <li>Surveillance des interactions et des groupes rejoints</li>
                <li>Configuration des paramètres de confidentialité</li>
                <li>Signalement immédiat de tout comportement suspect</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Mesures de protection</h2>

              <h3 className="text-lg font-semibold mb-3">2.1 Modération automatisée</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Filtrage de contenu :</strong> détection automatique de contenus inappropriés</li>
                <li><strong>Surveillance des conversations :</strong> algorithmes de détection de comportements suspects</li>
                <li><strong>Blocage préventif :</strong> restriction automatique en cas de signalement multiple</li>
                <li><strong>Vérification des liens :</strong> contrôle des URLs partagées dans les groupes</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">2.2 Modération humaine</h3>
              <p className="mb-4">Notre équipe de modération intervient 24h/24 pour :</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Examiner les signalements d&apos;utilisateurs</li>
                <li>Vérifier l&apos;âge des utilisateurs lors de signalements</li>
                <li>Supprimer immédiatement tout contenu dangereux</li>
                <li>Bannir définitivement les comptes malveillants</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">2.3 Paramètres de confidentialité renforcés</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  <strong>💡 Pour les mineurs :</strong> Nous appliquons automatiquement les paramètres
                  de confidentialité les plus stricts pour tous les utilisateurs de moins de 18 ans.
                </p>
              </div>
              <ul className="list-disc pl-6 mb-4">
                <li>Profil privé par défaut</li>
                <li>Limitation des contacts à des utilisateurs approuvés</li>
                <li>Restriction sur le partage d&apos;informations personnelles</li>
                <li>Désactivation de la géolocalisation précise</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Prévention des risques</h2>

              <h3 className="text-lg font-semibold mb-3">3.1 Sensibilisation aux dangers</h3>
              <p className="mb-4">
                Nous informons régulièrement nos utilisateurs sur les risques potentiels :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Harcèlement en ligne :</strong> reconnaissance et signalement</li>
                <li><strong>Usurpation d&apos;identité :</strong> comment vérifier l&apos;authenticité des profils</li>
                <li><strong>Rencontres physiques :</strong> précautions à prendre</li>
                <li><strong>Partage d&apos;informations :</strong> protection de la vie privée</li>
                <li><strong>Contenus inappropriés :</strong> signalement et blocage</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">3.2 Recommandations pour les rencontres</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">
                  <strong>⚠️ Important :</strong> Nous déconseillons fortement les rencontres privées
                  pour les utilisateurs mineurs sans la présence d&apos;un adulte responsable.
                </p>
              </div>
              <ul className="list-disc pl-6 mb-4">
                <li>Privilégier les événements de groupe dans des lieux publics</li>
                <li>Informer ses parents ou tuteurs de toute rencontre prévue</li>
                <li>Ne jamais communiquer d&apos;adresse personnelle</li>
                <li>Signaler immédiatement toute demande suspecte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Signalement et intervention</h2>

              <h3 className="text-lg font-semibold mb-3">4.1 Comment signaler</h3>
              <p className="mb-4">Plusieurs moyens de signalement sont disponibles :</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Bouton de signalement :</strong> sur chaque profil et message</li>
                <li><strong>Email d&apos;urgence :</strong>
                  <a href="mailto:urgence@smaaks.fr" className="text-red-600 font-semibold ml-1">
                    urgence@smaaks.fr
                  </a> (réponse sous 1h)
                </li>
                <li><strong>Ligne dédiée parents :</strong>
                  <a href="mailto:parents@smaaks.fr" className="text-indigo-600 ml-1">
                    parents@smaaks.fr
                  </a>
                </li>
                <li><strong>Numéro national :</strong> 3018 (Net Écoute - gratuit, anonyme, confidentiel)</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">4.2 Traitement des signalements</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li><strong>Signalements urgents :</strong> traitement immédiat (moins d&apos;1 heure)</li>
                  <li><strong>Signalements standards :</strong> traitement sous 24h</li>
                  <li><strong>Enquêtes complexes :</strong> collaboration avec les autorités si nécessaire</li>
                  <li><strong>Suivi automatique :</strong> notification du signalant des mesures prises</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Sanctions et exclusions</h2>
              <p className="mb-4">
                En cas de comportement dangereux envers des mineurs, nous appliquons des sanctions immédiates :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Suspension immédiate :</strong> du compte suspect en attendant enquête</li>
                <li><strong>Bannissement définitif :</strong> pour tout comportement malveillant confirmé</li>
                <li><strong>Signalement aux autorités :</strong> transmission obligatoire des preuves</li>
                <li><strong>Blocage technique :</strong> empêche la création de nouveaux comptes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Ressources et aide</h2>

              <h3 className="text-lg font-semibold mb-3">6.1 Numéros d&apos;urgence</h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <ul className="space-y-2">
                  <li><strong>Urgences :</strong> 112 ou 15 (SAMU)</li>
                  <li><strong>Enfance en Danger :</strong> 119 (24h/24, gratuit)</li>
                  <li><strong>Net Écoute :</strong> 3018 (harcèlement et dangers du numérique)</li>
                  <li><strong>Suicide Écoute :</strong> 3114 (24h/24, gratuit)</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold mb-3">6.2 Associations partenaires</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>e-Enfance :</strong> protection des mineurs sur Internet</li>
                <li><strong>Point de Contact :</strong> signalement de contenus illicites</li>
                <li><strong>Safer Internet France :</strong> sensibilisation aux bonnes pratiques</li>
                <li><strong>CNIL :</strong> protection des données personnelles des mineurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Formation et sensibilisation</h2>
              <p className="mb-4">
                SMAAKS Groups s&apos;engage dans la prévention par l&apos;éducation :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Guides de sécurité :</strong> accessibles depuis les paramètres du compte</li>
                <li><strong>Notifications pédagogiques :</strong> rappels réguliers des bonnes pratiques</li>
                <li><strong>Partenariats éducatifs :</strong> collaboration avec les établissements scolaires</li>
                <li><strong>Campagnes de sensibilisation :</strong> sur les réseaux sociaux et dans l&apos;app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Engagement et transparence</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800">
                  <strong>Notre engagement :</strong> Tolérance zéro envers tout comportement mettant
                  en danger la sécurité des mineurs sur notre plateforme.
                </p>
              </div>
              <p className="mb-4">
                Nous publions un rapport annuel de transparence détaillant :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Nombre de signalements traités</li>
                <li>Temps de réaction moyen</li>
                <li>Comptes sanctionnés ou bannis</li>
                <li>Améliorations apportées à nos systèmes de protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact</h2>
              <p className="mb-4">
                Pour toute question concernant la sécurité des enfants sur SMAAKS Groups :
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Email de sécurité :</strong>
                  <a href="mailto:securite@smaaks.fr" className="text-indigo-600 ml-1">
                    securite@smaaks.fr
                  </a>
                </p>
                <p><strong>Ligne parents :</strong>
                  <a href="mailto:parents@smaaks.fr" className="text-indigo-600 ml-1">
                    parents@smaaks.fr
                  </a>
                </p>
                <p><strong>Urgences :</strong>
                  <a href="mailto:urgence@smaaks.fr" className="text-red-600 font-semibold ml-1">
                    urgence@smaaks.fr
                  </a>
                </p>
                <p className="mt-2"><strong>Courrier :</strong> CORBERA 10 SAS - Responsable Sécurité</p>
                <p>71 rue Jean de Bernardy, 13001 Marseille, France</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}