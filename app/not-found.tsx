import Link from 'next/link';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen smaaks-bg-light">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="smaaks-icon-circle primary mx-auto mb-8" style={{ width: '80px', height: '80px' }}>
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h1 className="text-6xl font-bold smaaks-text-primary mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Page introuvable</h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            La page que vous recherchez semble avoir disparu. Elle a peut-être été supprimée,
            renommée ou temporairement indisponible.
          </p>

          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/"
              className="smaaks-btn-primary inline-block"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/dashboard"
              className="smaaks-btn-secondary inline-block"
            >
              Aller au dashboard
            </Link>
            <Link
              href="/groups"
              className="smaaks-btn-secondary inline-block"
            >
              Découvrir des groupes
            </Link>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="smaaks-card text-center">
                <div className="smaaks-icon-circle secondary mx-auto mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Rejoindre un groupe</h4>
                <p className="text-sm text-gray-600">Découvrez des communautés passionnantes</p>
              </div>

              <div className="smaaks-card text-center">
                <div className="smaaks-icon-circle accent mx-auto mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Créer un groupe</h4>
                <p className="text-sm text-gray-600">Rassemblez des personnes autour de vos passions</p>
              </div>

              <div className="smaaks-card text-center">
                <div className="smaaks-icon-circle primary mx-auto mb-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Mon profil</h4>
                <p className="text-sm text-gray-600">Personnalisez votre expérience SMAAKS</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}