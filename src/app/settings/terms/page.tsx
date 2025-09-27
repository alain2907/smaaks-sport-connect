'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function TermsOfService() {
  const router = useRouter();

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
              📜 Conditions Générales d&apos;Utilisation
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

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Objet</h2>
            <p className="mb-4">
              Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet de définir les modalités et conditions d&apos;utilisation de la plateforme SMAAKS Sport Connect, éditée par CORBERA 10 SAS.
            </p>
            <p className="mb-6">
              L&apos;utilisation de la plateforme implique l&apos;acceptation pleine et entière des présentes CGU.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Éditeur</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-medium">CORBERA 10 SAS</p>
              <p>Capital social : 1 000 €</p>
              <p>Siège social : 71 rue Jean de Bernardy, 13001 Marseille</p>
              <p>RCS Marseille : 529 138 919</p>
              <p>N° TVA intracommunautaire : FR53529138919</p>
              <p>Email : contact@smaaks.fr</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Définitions</h2>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li><strong>Plateforme :</strong> le site web et l&apos;application SMAAKS Sport Connect</li>
              <li><strong>Utilisateur :</strong> toute personne physique inscrite sur la Plateforme</li>
              <li><strong>Événement :</strong> rencontre sportive créée par un Utilisateur</li>
              <li><strong>Organisateur :</strong> Utilisateur créant un Événement</li>
              <li><strong>Participant :</strong> Utilisateur s&apos;inscrivant à un Événement</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Inscription et Compte Utilisateur</h2>
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Conditions d&apos;inscription</h3>
            <p className="mb-4">
              L&apos;inscription est gratuite et réservée aux personnes physiques âgées d&apos;au moins 13 ans. Les mineurs doivent obtenir l&apos;autorisation de leurs représentants légaux.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 Informations du compte</h3>
            <p className="mb-4">
              L&apos;Utilisateur s&apos;engage à fournir des informations exactes et à les maintenir à jour. Il est responsable de la confidentialité de ses identifiants de connexion.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 Suppression du compte</h3>
            <p className="mb-6">
              L&apos;Utilisateur peut supprimer son compte à tout moment. CORBERA 10 SAS se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Utilisation de la Plateforme</h2>
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.1 Création d&apos;événements</h3>
            <p className="mb-4">
              Les Organisateurs s&apos;engagent à :
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Fournir des informations exactes et complètes sur l&apos;Événement</li>
              <li>Respecter le lieu et les horaires annoncés</li>
              <li>Ne pas créer d&apos;Événements à caractère commercial sans autorisation</li>
              <li>Assurer la sécurité des Participants dans la mesure du possible</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.2 Participation aux événements</h3>
            <p className="mb-4">
              Les Participants s&apos;engagent à :
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Respecter les horaires et le lieu de rendez-vous</li>
              <li>Prévenir en cas d&apos;empêchement</li>
              <li>Adopter un comportement sportif et respectueux</li>
              <li>Vérifier leur aptitude physique à pratiquer le sport concerné</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.3 Comportement des Utilisateurs</h3>
            <p className="mb-6">
              Il est interdit de :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Tenir des propos injurieux, discriminatoires ou diffamatoires</li>
              <li>Harceler ou menacer d&apos;autres Utilisateurs</li>
              <li>Publier du contenu inapproprié ou illégal</li>
              <li>Usurper l&apos;identité d&apos;autrui</li>
              <li>Utiliser la Plateforme à des fins commerciales non autorisées</li>
              <li>Collecter des données personnelles d&apos;autres Utilisateurs</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Responsabilités</h2>
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.1 Responsabilité de CORBERA 10 SAS</h3>
            <p className="mb-4">
              CORBERA 10 SAS met à disposition une plateforme de mise en relation. La société n&apos;organise pas les Événements et n&apos;est pas responsable :
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Des dommages survenus lors des Événements</li>
              <li>Des annulations ou modifications d&apos;Événements</li>
              <li>Du comportement des Utilisateurs</li>
              <li>De la véracité des informations publiées</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.2 Responsabilité des Utilisateurs</h3>
            <p className="mb-6">
              Chaque Utilisateur est responsable de ses actions et s&apos;engage à :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Souscrire une assurance responsabilité civile</li>
              <li>Vérifier son aptitude médicale à pratiquer le sport</li>
              <li>Respecter les règles de sécurité</li>
              <li>Indemniser CORBERA 10 SAS en cas de réclamation liée à son comportement</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Propriété Intellectuelle</h2>
            <p className="mb-4">
              Tous les éléments de la Plateforme (logos, textes, graphismes, etc.) sont protégés par le droit d&apos;auteur et sont la propriété exclusive de CORBERA 10 SAS.
            </p>
            <p className="mb-6">
              En publiant du contenu, l&apos;Utilisateur accorde à CORBERA 10 SAS une licence non exclusive d&apos;utilisation pour l&apos;exploitation de la Plateforme.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Données Personnelles</h2>
            <p className="mb-6">
              Le traitement des données personnelles est décrit dans notre <a href="/settings/privacy" className="text-purple-600 hover:underline">Politique de Confidentialité</a>.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Modification des CGU</h2>
            <p className="mb-6">
              CORBERA 10 SAS se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication. L&apos;utilisation continue de la Plateforme après modification vaut acceptation des nouvelles CGU.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Résiliation</h2>
            <p className="mb-6">
              En cas de manquement grave aux présentes CGU, CORBERA 10 SAS se réserve le droit de suspendre ou résilier l&apos;accès à la Plateforme sans préavis ni indemnité.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">11. Droit Applicable et Juridiction</h2>
            <p className="mb-4">
              Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux de Marseille.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">12. Contact</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>Pour toute question concernant ces CGU :</p>
              <p><strong>Email :</strong> contact@smaaks.fr</p>
              <p><strong>Courrier :</strong> CORBERA 10 SAS - 71 rue Jean de Bernardy, 13001 Marseille</p>
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