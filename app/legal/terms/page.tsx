import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Conditions Générales d&apos;Utilisation
          </h1>

          <div className="space-y-6 text-gray-700">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Présentation de la plateforme</h2>
              <p className="mb-4">
                SMAAKS Groups est une plateforme numérique qui permet aux utilisateurs de créer, rejoindre et
                participer à des groupes thématiques pour partager des intérêts communs et développer des communautés.
              </p>
              <p>
                La plateforme est éditée par CORBERA 10 SAS, société par actions simplifiée au capital de 1000 euros,
                immatriculée au RCS de Marseille sous le numéro 529 138 919, ayant son siège social au
                71 rue Jean de Bernardy, 13001 Marseille, France.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Acceptation des conditions</h2>
              <p className="mb-4">
                L&apos;utilisation de SMAAKS Groups implique l&apos;acceptation pleine et entière des présentes conditions
                générales d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser nos services.
              </p>
              <p>
                Ces conditions peuvent être modifiées à tout moment. Les utilisateurs seront informés de toute modification
                significative par email ou notification sur la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Inscription et compte utilisateur</h2>
              <p className="mb-4">
                Pour utiliser SMAAKS Groups, vous devez créer un compte en fournissant des informations exactes et à jour.
                Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées
                sous votre compte.
              </p>
              <p className="mb-4">
                L&apos;inscription est réservée aux personnes âgées d&apos;au moins 16 ans. Les mineurs de 16 à 18 ans doivent
                obtenir l&apos;autorisation de leurs parents ou tuteurs légaux.
              </p>
              <p>
                Nous nous réservons le droit de suspendre ou supprimer tout compte qui ne respecterait pas ces conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Utilisation de la plateforme</h2>
              <p className="mb-4">Vous vous engagez à :</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Utiliser la plateforme de manière respectueuse et conformément à la loi</li>
                <li>Ne pas publier de contenu offensant, diffamatoire, illégal ou inapproprié</li>
                <li>Respecter les autres utilisateurs et maintenir un environnement bienveillant</li>
                <li>Ne pas utiliser la plateforme à des fins commerciales non autorisées</li>
                <li>Protéger la confidentialité des informations partagées dans les groupes privés</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Contenu utilisateur</h2>
              <p className="mb-4">
                Vous conservez la propriété intellectuelle de tout contenu que vous publiez sur SMAAKS Groups.
                Cependant, vous nous accordez une licence non exclusive pour afficher, distribuer et promouvoir
                ce contenu sur la plateforme.
              </p>
              <p>
                Nous nous réservons le droit de modérer, modifier ou supprimer tout contenu qui ne respecterait
                pas nos standards communautaires ou ces conditions générales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Vie privée et données personnelles</h2>
              <p className="mb-4">
                Le traitement de vos données personnelles est régi par notre Politique de confidentialité,
                conforme au Règlement Général sur la Protection des Données (RGPD).
              </p>
              <p>
                Vos données sont hébergées sur des serveurs situés dans l&apos;Union Européenne et ne sont jamais
                transférées vers des pays tiers sans votre consentement explicite.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Responsabilité</h2>
              <p className="mb-4">
                SMAAKS Groups s&apos;efforce de maintenir un service de qualité, mais ne peut garantir un fonctionnement
                ininterrompu de la plateforme. Notre responsabilité est limitée aux dommages directs dans la limite
                du montant payé pour nos services.
              </p>
              <p>
                Les utilisateurs sont responsables de leurs interactions et des conséquences de leur participation
                aux groupes. Nous recommandons la prudence lors de rencontres physiques organisées via la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Résiliation</h2>
              <p className="mb-4">
                Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil.
                Nous pouvons également suspendre ou supprimer votre compte en cas de violation de ces conditions.
              </p>
              <p>
                En cas de résiliation, vos données personnelles seront supprimées conformément à notre politique
                de confidentialité, sauf obligation légale de conservation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Droit applicable</h2>
              <p className="mb-4">
                Ces conditions générales sont soumises au droit français. Tout litige relatif à leur interprétation
                ou à leur exécution sera soumis aux tribunaux compétents de Marseille.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p>
                Pour toute question concernant ces conditions générales, vous pouvez nous contacter à l&apos;adresse :
                <a href="mailto:contact@smaaks.fr" className="text-indigo-600 hover:text-indigo-800 ml-1">
                  contact@smaaks.fr
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}