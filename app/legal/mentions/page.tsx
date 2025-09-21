import Footer from '@/components/Footer';

export default function MentionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Mentions Légales
          </h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Informations légales</h2>

              <h3 className="text-lg font-semibold mb-3">1.1 Éditeur du site</h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p><strong>Raison sociale :</strong> CORBERA 10 SAS</p>
                <p><strong>Forme juridique :</strong> Société par Actions Simplifiée</p>
                <p><strong>Capital social :</strong> 1 000 euros</p>
                <p><strong>Siège social :</strong> 71 rue Jean de Bernardy, 13001 Marseille, France</p>
                <p><strong>SIREN :</strong> 529 138 919</p>
                <p><strong>RCS :</strong> Marseille</p>
                <p><strong>Email :</strong> <a href="mailto:contact@smaaks.fr" className="text-indigo-600">contact@smaaks.fr</a></p>
              </div>

              <h3 className="text-lg font-semibold mb-3">1.2 Directeur de la publication</h3>
              <p className="mb-4">
                Le directeur de la publication est le représentant légal de CORBERA 10 SAS.
              </p>

              <h3 className="text-lg font-semibold mb-3">1.3 Hébergement</h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p><strong>Site web :</strong> <a href="https://vercel.com" className="text-indigo-600" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
              </div>

              <h3 className="text-lg font-semibold mb-3">1.4 Services de données</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Base de données :</strong> Google Firebase (région Europe)</p>
                <p><strong>Authentification :</strong> Firebase Authentication</p>
                <p><strong>Stockage :</strong> Firebase Firestore</p>
                <p><strong>Localisation :</strong> Serveurs situés dans l&apos;Union Européenne</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Objet du site</h2>
              <p className="mb-4">
                SMAAKS Groups est une plateforme numérique permettant aux utilisateurs de :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Créer et rejoindre des groupes thématiques</li>
                <li>Partager des intérêts communs avec d&apos;autres utilisateurs</li>
                <li>Organiser et participer à des événements</li>
                <li>Développer des communautés locales et en ligne</li>
                <li>Échanger et collaborer autour de passions partagées</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Propriété intellectuelle</h2>

              <h3 className="text-lg font-semibold mb-3">3.1 Contenu de la plateforme</h3>
              <p className="mb-4">
                L&apos;ensemble des éléments de la plateforme SMAAKS Groups (design, textes, images, logos,
                structure, fonctionnalités) sont protégés par le droit d&apos;auteur et appartiennent à CORBERA 10 SAS
                ou à ses partenaires.
              </p>

              <h3 className="text-lg font-semibold mb-3">3.2 Marques</h3>
              <p className="mb-4">
                &quot;SMAAKS&quot; et &quot;SMAAKS Groups&quot; sont des marques de CORBERA 10 SAS. Toute reproduction
                ou utilisation non autorisée est interdite.
              </p>

              <h3 className="text-lg font-semibold mb-3">3.3 Contenu utilisateur</h3>
              <p className="mb-4">
                Les utilisateurs conservent leurs droits de propriété intellectuelle sur les contenus qu&apos;ils
                publient. En publiant du contenu, ils accordent à SMAAKS Groups une licence d&apos;utilisation
                nécessaire au fonctionnement de la plateforme.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Responsabilité</h2>

              <h3 className="text-lg font-semibold mb-3">4.1 Responsabilité de l&apos;éditeur</h3>
              <p className="mb-4">
                CORBERA 10 SAS s&apos;efforce de maintenir la plateforme accessible et fonctionnelle, mais ne peut
                garantir un service ininterrompu. La responsabilité de l&apos;éditeur est limitée aux dommages
                directs causés par un dysfonctionnement imputable à la plateforme.
              </p>

              <h3 className="text-lg font-semibold mb-3">4.2 Responsabilité des utilisateurs</h3>
              <p className="mb-4">
                Les utilisateurs sont responsables :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Du contenu qu&apos;ils publient sur la plateforme</li>
                <li>De leurs interactions avec les autres utilisateurs</li>
                <li>Du respect des lois et règlements en vigueur</li>
                <li>De la sécurité de leurs identifiants de connexion</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">4.3 Contenu des utilisateurs</h3>
              <p className="mb-4">
                SMAAKS Groups agit en tant qu&apos;hébergeur du contenu publié par les utilisateurs. Conformément
                à la loi, nous ne sommes pas responsables du contenu publié, mais nous nous engageons à
                retirer rapidement tout contenu illicite signalé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Protection des données personnelles</h2>
              <p className="mb-4">
                Le traitement des données personnelles est régi par notre Politique de confidentialité,
                conforme au Règlement Général sur la Protection des Données (RGPD).
              </p>
              <p className="mb-4">
                Pour exercer vos droits ou pour toute question relative à vos données personnelles,
                contactez-nous à l&apos;adresse :
                <a href="mailto:contact@smaaks.fr" className="text-indigo-600 hover:text-indigo-800 ml-1">
                  contact@smaaks.fr
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Signalement de contenu</h2>
              <p className="mb-4">
                Si vous identifiez du contenu illicite ou inapproprié sur la plateforme, vous pouvez le signaler :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Via les outils de signalement intégrés à la plateforme</li>
                <li>Par email à : <a href="mailto:contact@smaaks.fr" className="text-indigo-600">contact@smaaks.fr</a></li>
                <li>En précisant l&apos;URL et la nature du problème</li>
              </ul>
              <p className="mb-4">
                Nous nous engageons à traiter tous les signalements dans les plus brefs délais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Droit applicable et juridiction</h2>
              <p className="mb-4">
                Les présentes mentions légales et l&apos;utilisation de la plateforme SMAAKS Groups sont soumises
                au droit français.
              </p>
              <p className="mb-4">
                En cas de litige, les tribunaux compétents sont ceux de Marseille, France.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies et traceurs</h2>
              <p className="mb-4">
                L&apos;utilisation de cookies sur la plateforme est détaillée dans notre Politique des cookies.
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre compte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Accessibilité</h2>
              <p className="mb-4">
                Nous nous efforçons de rendre SMAAKS Groups accessible au plus grand nombre, en respectant
                les standards d&apos;accessibilité web. Si vous rencontrez des difficultés d&apos;accès,
                n&apos;hésitez pas à nous contacter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="mb-4">
                Pour toute question concernant ces mentions légales ou la plateforme SMAAKS Groups :
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Email :</strong> <a href="mailto:contact@smaaks.fr" className="text-indigo-600">contact@smaaks.fr</a></p>
                <p><strong>Courrier :</strong> CORBERA 10 SAS</p>
                <p>71 rue Jean de Bernardy</p>
                <p>13001 Marseille, France</p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}