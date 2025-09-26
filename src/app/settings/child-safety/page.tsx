'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function ChildSafety() {
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
              🛡️ Normes de Sécurité des Enfants
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card variant="glass">
          <CardContent className="prose prose-gray max-w-none p-8">
            <p className="text-sm text-gray-600 mb-6">
              Dernière mise à jour : 12/09/2025
            </p>

            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
              <p className="font-medium text-orange-800">
                🛡️ SMAAKS Sport Connect s&apos;engage fermement à protéger les enfants et les mineurs contre toute forme d&apos;exploitation, d&apos;abus ou de contenu inapproprié. Notre plateforme sportive est strictement réservée aux personnes de 16 ans et plus.
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Politique d&apos;Âge Minimum</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>L&apos;âge minimum requis pour utiliser SMAAKS Sport Connect est de <strong>16 ans</strong></li>
              <li>Nous vérifions l&apos;âge lors de l&apos;inscription</li>
              <li>Les comptes suspectés d&apos;appartenir à des mineurs sont immédiatement suspendus et examinés</li>
              <li>Les utilisateurs qui mentent sur leur âge sont bannis définitivement</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Prévention de l&apos;Exploitation des Enfants</h2>
            <p className="mb-4">
              SMAAKS Sport Connect applique une politique de tolérance zéro concernant :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Les contenus d&apos;abus sexuels sur mineurs (CSAM)</li>
              <li>La sollicitation de mineurs</li>
              <li>Le grooming (manipulation psychologique de mineurs)</li>
              <li>Le trafic d&apos;enfants</li>
              <li>Tout contenu sexualisant des mineurs</li>
              <li>L&apos;exploitation commerciale d&apos;enfants</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Mesures de Protection</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1. Détection Proactive</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Systèmes automatisés de détection de contenus inappropriés</li>
              <li>Analyse par intelligence artificielle des images et textes</li>
              <li>Équipe de modération dédiée 24/7</li>
              <li>Vérification manuelle des profils suspects</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2. Signalement et Action</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Bouton de signalement visible sur chaque profil et événement sportif</li>
              <li>Catégorie spécifique pour les problèmes de sécurité des enfants</li>
              <li>Traitement prioritaire des signalements liés aux mineurs</li>
              <li>Suspension immédiate des comptes pendant l&apos;enquête</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3. Collaboration avec les Autorités</h3>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Signalement systématique aux autorités compétentes (NCMEC, autorités locales)</li>
              <li>Conservation des preuves selon les exigences légales</li>
              <li>Coopération totale avec les forces de l&apos;ordre</li>
              <li>Respect des obligations légales de signalement</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Comment Signaler un Problème</h2>
            <p className="mb-4">
              Si vous rencontrez du contenu impliquant des mineurs lors d&apos;événements sportifs ou dans les discussions :
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-1">
              <li>Ne partagez pas le contenu</li>
              <li>Signalez immédiatement via le bouton de signalement dans l&apos;application</li>
              <li>Sélectionnez &quot;Sécurité des enfants&quot; comme motif</li>
              <li>Fournissez autant de détails que possible</li>
              <li>Bloquez l&apos;utilisateur concerné</li>
            </ol>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="font-medium text-red-800 mb-2">🚨 Méthodes de signalement alternatives :</p>
              <ul className="space-y-1 text-red-700">
                <li><strong>Email de contact :</strong> contact@smaaks.fr</li>
                <li><strong>Urgences :</strong> Contactez immédiatement les autorités locales</li>
              </ul>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Sécurité des Événements Sportifs</h2>
            <p className="mb-4">
              Pour les événements sportifs impliquant des mineurs, SMAAKS Sport Connect exige :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Encadrement par des adultes qualifiés et vérifiés</li>
              <li>Lieux publics et sécurisés pour les activités</li>
              <li>Autorisation parentale pour la participation</li>
              <li>Respect des ratios d&apos;encadrement selon l&apos;activité</li>
              <li>Vérification des assurances et qualifications</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Éducation et Prévention</h2>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Formation régulière de notre équipe de modération</li>
              <li>Sensibilisation des utilisateurs aux risques</li>
              <li>Conseils de sécurité affichés dans l&apos;application</li>
              <li>Partenariats avec des organisations de protection de l&apos;enfance</li>
              <li>Guides de sécurité pour les organisateurs d&apos;événements sportifs</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Conséquences des Violations</h2>
            <p className="mb-4">
              Toute violation de nos normes de sécurité des enfants entraîne :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Bannissement permanent et immédiat de la plateforme</li>
              <li>Signalement aux autorités compétentes</li>
              <li>Partage d&apos;informations avec d&apos;autres plateformes partenaires</li>
              <li>Poursuite judiciaire si applicable</li>
              <li>Conservation des données pour les enquêtes</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Transparence et Responsabilité</h2>
            <p className="mb-4">
              SMAAKS Sport Connect publie régulièrement des rapports de transparence incluant :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Nombre de comptes suspendus pour violation de l&apos;âge minimum</li>
              <li>Nombre de signalements traités</li>
              <li>Temps moyen de traitement des signalements</li>
              <li>Nombre de cas transmis aux autorités</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Contact et réclamations</h2>
            <p className="mb-4">
              Pour toute question sur cette politique ou exercer vos droits :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <ul className="space-y-2">
                <li><strong>Email :</strong> contact@smaaks.fr</li>
                <li><strong>Courrier :</strong> CORBERA 10 SAS, 71 rue Jean de Bernardy, 13001 Marseille</li>
              </ul>
              <p className="mt-3 text-sm text-gray-600">
                Vous avez également le droit de déposer une réclamation auprès de la CNIL (www.cnil.fr).
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-semibold mb-2">🆘 Numéros d&apos;urgence :</p>
              <ul className="space-y-1">
                <li><strong>Police/Pompiers :</strong> 15, 17, 18, 112</li>
                <li><strong>Enfance en Danger :</strong> 119</li>
                <li><strong>Cyber-harcèlement :</strong> 3018</li>
                <li><strong>Net Écoute :</strong> 0800 200 000</li>
              </ul>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Engagement Continu</h2>
            <p className="mb-6">
              Nous révisons et améliorons continuellement nos politiques et technologies pour garantir la sécurité des enfants dans le contexte sportif. Cette page est mise à jour régulièrement pour refléter nos pratiques actuelles et nos engagements en matière de protection des mineurs.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="mb-2">
                <strong>CORBERA 10 SAS</strong> s&apos;engage solennellement à :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Protéger tous les mineurs contre toute forme d&apos;exploitation</li>
                <li>Appliquer une tolérance zéro envers les comportements inappropriés</li>
                <li>Coopérer pleinement avec les autorités de protection de l&apos;enfance</li>
                <li>Améliorer continuellement nos mesures de sécurité</li>
                <li>Promouvoir un environnement sportif sain et sécurisé</li>
              </ul>
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