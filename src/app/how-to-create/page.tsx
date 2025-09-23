'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const CREATION_STEPS = [
  {
    emoji: '🏆',
    title: 'Choisis ton sport',
    description: 'Sélectionne le sport que tu veux pratiquer parmi nos 8 sports disponibles',
    tips: ['Football, Basketball, Tennis...', 'Chaque sport a ses spécificités']
  },
  {
    emoji: '📍',
    title: 'Indique le lieu',
    description: 'Précise où se déroule ta session sportive',
    tips: ['Nom du stade, gymnase ou terrain', 'Adresse complète si possible', 'Mentions spéciales (terrain synthétique, etc.)']
  },
  {
    emoji: '🗓️',
    title: 'Fixe la date et l\'heure',
    description: 'Choisis quand tu veux jouer',
    tips: ['Date dans le futur uniquement', 'Sois précis sur l\'heure', 'Pense à la durée de ta session']
  },
  {
    emoji: '👥',
    title: 'Définis le nombre de joueurs',
    description: 'Combien de personnes peuvent rejoindre ta partie ?',
    tips: ['Entre 2 et 50 participants', 'Pense à l\'espace disponible', 'Plus il y a de monde, plus c\'est fun !']
  },
  {
    emoji: '🎯',
    title: 'Précise le niveau',
    description: 'Quel niveau est requis pour participer ?',
    tips: ['Débutant : pour ceux qui découvrent', 'Intermédiaire : quelques bases', 'Avancé : bon niveau', 'Tous niveaux : ouvert à tous']
  },
  {
    emoji: '⚽',
    title: 'Ajoute des détails (optionnel)',
    description: 'Description, équipement nécessaire...',
    tips: ['Ambiance souhaitée', 'Matériel à apporter', 'Règles spéciales']
  }
];

export default function HowToCreate() {
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
              📝 Comment créer une annonce
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <Card variant="gradient" className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Crée ta première annonce sportive !
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Suis ces 6 étapes simples pour publier ton événement et trouver des partenaires de jeu.
            </p>
            <div className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300 rounded-xl p-4">
              <p className="text-emerald-700 font-bold">
                💡 Astuce : Plus tu donnes de détails, plus tu attires les bons joueurs !
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {CREATION_STEPS.map((step, index) => (
            <div
              key={index}
              onClick={() => router.push('/create')}
              className="cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              <Card variant="gradient" className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{step.emoji}</span>
                        <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
                        <span className="text-purple-500 text-sm font-medium">→ Créer</span>
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <ul className="space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-gray-500 flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 text-xs text-purple-600 font-medium">
                        👆 Cliquer pour créer ton événement
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <Card variant="neon" className="text-center">
          <CardContent className="p-8">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Prêt à créer ton événement ?
            </h3>
            <p className="text-gray-600 mb-6">
              Tu as maintenant toutes les clés pour créer une super annonce qui attirera plein de joueurs !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/create')}
                className="text-lg px-8 py-4"
              >
                🚀 Créer mon événement
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/search')}
                className="text-lg px-8 py-4"
              >
                👀 Voir les événements existants
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card variant="glass" className="mt-8">
          <CardContent className="p-6">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💎</span>
              Conseils de pro
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-bold text-blue-800 mb-2">📱 Timing optimal</h5>
                <p className="text-blue-600 text-sm">Publie ton annonce 2-3 jours avant pour avoir le temps de rassembler du monde.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-bold text-green-800 mb-2">🎪 Ambiance</h5>
                <p className="text-green-600 text-sm">Précise si c&apos;est compétitif ou juste pour le fun dans ta description.</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-bold text-purple-800 mb-2">🏟️ Lieu</h5>
                <p className="text-purple-600 text-sm">Choisis un lieu facile d&apos;accès avec parking ou transports à proximité.</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="font-bold text-orange-800 mb-2">💬 Communication</h5>
                <p className="text-orange-600 text-sm">Reste disponible pour répondre aux questions des participants.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}