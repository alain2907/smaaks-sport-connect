'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function LegalNotices() {
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
              ⚖️ Mentions Légales
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

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Éditeur du site</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="mb-2">Le site <strong>SMAAKS Sport Connect</strong> est édité par :</p>
              <p className="font-medium">CORBERA 10 SAS</p>
              <p>Société par Actions Simplifiée au capital de 1 000 €</p>
              <p>Siège social : 71 rue Jean de Bernardy, 13001 Marseille, France</p>
              <p>RCS Marseille : 529 138 919</p>
              <p>SIRET : 529 138 919 00016</p>
              <p>N° TVA intracommunautaire : FR53529138919</p>
              <p>Téléphone : Non communiqué (contact par email uniquement)</p>
              <p>Email : contact@smaaks.fr</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Directeur de la publication</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p>Le directeur de la publication est :</p>
              <p className="font-medium">Monsieur Alain NATAF</p>
              <p>En qualité de : Président de CORBERA 10 SAS</p>
              <p>Contact : contact@smaaks.fr</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Hébergement</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Hébergement de l&apos;application :</h3>
              <p className="font-medium">Vercel Inc.</p>
              <p>340 S Lemon Ave #4133</p>
              <p>Walnut, CA 91789, États-Unis</p>
              <p>Site web : https://vercel.com</p>
              <p className="mt-2 text-sm italic">Note : Les données sont hébergées en Europe (région CDG1 - Paris)</p>

              <h3 className="font-semibold mb-2 mt-4">Base de données et authentification :</h3>
              <p className="font-medium">Google Ireland Limited (Firebase)</p>
              <p>Gordon House, Barrow Street</p>
              <p>Dublin 4, Irlande</p>
              <p>Site web : https://firebase.google.com</p>
              <p className="mt-2 text-sm italic">Note : Les données sont stockées en Europe (région europe-west1)</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Propriété intellectuelle</h2>
            <p className="mb-4">
              L&apos;ensemble du contenu de ce site (structure, textes, logos, images, éléments graphiques, etc.) est la propriété exclusive de CORBERA 10 SAS ou de ses partenaires.
            </p>
            <p className="mb-4">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de CORBERA 10 SAS.
            </p>
            <p className="mb-6">
              Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Protection des données personnelles</h2>
            <p className="mb-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi n° 78-17 du 6 janvier 1978 relative à l&apos;informatique, aux fichiers et aux libertés, vous disposez de droits sur vos données personnelles.
            </p>
            <p className="mb-4">
              Pour plus d&apos;informations, consultez notre <a href="/settings/privacy" className="text-purple-600 hover:underline">Politique de Confidentialité</a>.
            </p>
            <p className="mb-6">
              Délégué à la Protection des Données (DPO) : contact@smaaks.fr
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Cookies</h2>
            <p className="mb-6">
              Le site utilise des cookies pour améliorer l&apos;expérience utilisateur. Pour en savoir plus, consultez notre <a href="/settings/cookies" className="text-purple-600 hover:underline">Politique des Cookies</a>.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Responsabilité</h2>
            <p className="mb-4">
              CORBERA 10 SAS s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Cependant, CORBERA 10 SAS ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition sur ce site.
            </p>
            <p className="mb-4">
              En conséquence, CORBERA 10 SAS décline toute responsabilité pour :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-1">
              <li>Toute imprécision, inexactitude ou omission</li>
              <li>Tous dommages résultant d&apos;une intrusion frauduleuse d&apos;un tiers</li>
              <li>Plus généralement, tous dommages directs ou indirects</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Liens hypertextes</h2>
            <p className="mb-4">
              Le site peut contenir des liens vers d&apos;autres sites web. CORBERA 10 SAS n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur utilisation.
            </p>
            <p className="mb-6">
              La mise en place de liens hypertextes vers le site SMAAKS Sport Connect nécessite une autorisation préalable écrite de CORBERA 10 SAS.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Droit applicable</h2>
            <p className="mb-6">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de recherche d&apos;une solution amiable, les tribunaux français seront seuls compétents.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Crédits</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p><strong>Conception et développement :</strong> CORBERA 10 SAS</p>
              <p><strong>Technologies utilisées :</strong></p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Next.js (React Framework)</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Firebase (Google)</li>
                <li>Vercel (Hébergement)</li>
              </ul>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">11. Contact</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p>Pour toute question ou réclamation concernant le site :</p>
              <p className="font-medium mt-2">CORBERA 10 SAS</p>
              <p>Email : contact@smaaks.fr</p>
              <p>Courrier : 71 rue Jean de Bernardy, 13001 Marseille, France</p>
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