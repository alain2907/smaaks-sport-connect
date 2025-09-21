'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="smaaks-gradient-light min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Trouvez vos</span>
              <span className="block smaaks-text-primary">groupes parfaits</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
              Rejoignez des communautés qui partagent vos passions. Créez des liens authentiques
              et participez à des activités qui vous correspondent vraiment.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="smaaks-btn-primary text-center px-8 py-4 text-lg"
              >
                Découvrir des groupes
              </Link>
              <Link
                href="/auth/login"
                className="smaaks-btn-secondary text-center px-8 py-4 text-lg"
              >
                Créer mon profil
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Experience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Deux façons de vivre l&apos;expérience
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Que vous soyez organisateur ou participant, SMAAKS Groups s&apos;adapte à vous
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Participant Card */}
            <div className="smaaks-card text-center">
              <div className="text-6xl mb-6">👥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Participant</h3>
              <p className="text-gray-600 mb-6">
                Rejoignez des groupes existants et participez à des activités qui vous passionnent
              </p>
              <ul className="space-y-3 text-left">
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Parcourez des milliers de groupes
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Matching intelligent basé sur vos intérêts
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Chat intégré avec les membres
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Notifications d&apos;événements personnalisées
                </li>
              </ul>
            </div>

            {/* Organizer Card */}
            <div className="smaaks-card text-center">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Organisateur</h3>
              <p className="text-gray-600 mb-6">
                Créez et gérez vos propres groupes, rassemblez des communautés passionnées
              </p>
              <ul className="space-y-3 text-left">
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Outils de création de groupes intuitifs
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gestion avancée des membres
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Planification d&apos;événements
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 smaaks-text-secondary mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Statistiques et analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Une expérience de groupes unique
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez pourquoi SMAAKS Groups révolutionne la façon de créer des communautés
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="smaaks-icon-circle primary mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Matching intelligent</h3>
              <p className="mt-2 text-gray-600">Algorithme avancé pour vous connecter aux groupes parfaits</p>
            </div>

            <div className="text-center">
              <div className="smaaks-icon-circle secondary mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Chat en temps réel</h3>
              <p className="mt-2 text-gray-600">Échangez instantanément avec les membres de vos groupes</p>
            </div>

            <div className="text-center">
              <div className="smaaks-icon-circle accent mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v3m-4-3h8" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Sécurité garantie</h3>
              <p className="mt-2 text-gray-600">Vérification d&apos;identité et modération active</p>
            </div>

            <div className="text-center">
              <div className="smaaks-icon-circle primary mx-auto">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Analytics complets</h3>
              <p className="mt-2 text-gray-600">Suivez l&apos;activité et l&apos;engagement de vos groupes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Ils ont trouvé leur communauté avec SMAAKS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Marie</h4>
                  <p className="text-gray-600 text-sm">Passionnée de randonnée</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &ldquo;J&apos;ai enfin trouvé un groupe de randonneurs de mon niveau ! Les sorties sont parfaitement organisées.&rdquo;
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Julien</h4>
                  <p className="text-gray-600 text-sm">Entrepreneur</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &ldquo;SMAAKS Groups m&apos;a permis de créer un réseau professionnel solide dans ma ville. Les événements networking sont top !&rdquo;
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sophie</h4>
                  <p className="text-gray-600 text-sm">Créatrice de contenu</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &ldquo;En tant qu&apos;organisatrice, j&apos;apprécie la facilité de gestion des membres et la qualité des outils proposés.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="smaaks-bg-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Prêt à rejoindre votre communauté ?
          </h2>
          <p className="mt-4 text-xl text-purple-100">
            Plus de 10 000 groupes vous attendent. Créez votre profil dès maintenant.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-purple-700 px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Créer mon compte
            </Link>
            <Link
              href="/auth/login"
              className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-purple-600 transition-colors"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}