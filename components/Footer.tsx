import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold smaaks-text-primary mb-4">SMAAKS Groups</h3>
            <p className="text-gray-300 mb-4">
              La plateforme de groupes qui connecte les passionnés pour créer des communautés
              et partager des expériences enrichissantes.
            </p>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Plateforme</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/groups" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Découvrir des groupes
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Mon compte
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Mon profil
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Centre d&apos;aide
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens légaux */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Politique des cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/mentions" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/child-safety" className="text-gray-300 hover:text-indigo-400 transition-colors">
                  Sécurité des enfants
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              <p>© {new Date().getFullYear()} SMAAKS Groups. Tous droits réservés.</p>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="mailto:contact@smaaks.fr"
                className="text-gray-300 hover:text-indigo-400 transition-colors text-sm"
              >
                contact@smaaks.fr
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}