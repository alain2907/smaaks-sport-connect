import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonne 1 - À propos */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SMAAKS Sport Connect
            </h3>
            <p className="text-gray-300 text-sm">
              La plateforme sportive qui connecte les passionnés pour créer des rencontres sportives et partager des moments inoubliables.
            </p>
          </div>

          {/* Colonne 2 - Plateforme */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-300">Plateforme</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  🔍 Découvrir des événements
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  🏠 Mon tableau de bord
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  👤 Mon profil
                </Link>
              </li>
              <li>
                <Link href="/how-to-create" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  ❓ Centre d&apos;aide
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Légal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-purple-300">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/settings/terms" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  📜 Conditions générales
                </Link>
              </li>
              <li>
                <Link href="/settings/privacy" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  🔒 Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/settings/cookies" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  🍪 Politique des cookies
                </Link>
              </li>
              <li>
                <Link href="/settings/legal" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  ⚖️ Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/settings/child-safety" className="text-gray-300 hover:text-purple-400 transition-colors text-sm">
                  🛡️ Sécurité des enfants
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas du footer */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SMAAKS Sport Connect. Tous droits réservés.
            </p>
            <a
              href="mailto:contact@smaaks.fr"
              className="text-gray-400 hover:text-purple-400 transition-colors text-sm mt-4 md:mt-0"
            >
              📧 contact@smaaks.fr
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}