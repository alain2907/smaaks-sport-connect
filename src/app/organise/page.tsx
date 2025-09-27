'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BottomTabs } from '@/components/navigation/BottomTabs';
import { useRouter } from 'next/navigation';

export default function OrganisePage() {
  const router = useRouter();

  const tips = [
    {
      emoji: '📍',
      title: 'Choisis bien ton lieu',
      description: 'Sélectionne un endroit accessible et adapté au sport choisi',
      examples: ['Terrain de foot municipal', 'Court de tennis public', 'Salle de sport locale']
    },
    {
      emoji: '⏰',
      title: 'Planifie à l\'avance',
      description: 'Crée ton événement au moins 24h à l\'avance pour permettre aux autres de s\'organiser',
      examples: ['Week-end après-midi', 'Soirée en semaine', 'Pause déjeuner']
    },
    {
      emoji: '👥',
      title: 'Définis le bon nombre',
      description: 'Indique le nombre exact de participants nécessaires selon le sport',
      examples: ['Football : 10-22 joueurs', 'Basketball : 8-10 joueurs', 'Tennis : 2-4 joueurs']
    },
    {
      emoji: '📝',
      title: 'Sois précis dans la description',
      description: 'Explique clairement le niveau attendu et le matériel nécessaire',
      examples: ['Niveau débutant/intermédiaire/confirmé', 'Matériel fourni ou à apporter', 'Règles spécifiques']
    },
    {
      emoji: '💬',
      title: 'Communique avec les participants',
      description: 'Utilise ton profil pour gérer les demandes et confirmer les présences',
      examples: ['Accepter/refuser les demandes', 'Informer en cas de changement', 'Rappeler les détails']
    },
    {
      emoji: '🔄',
      title: 'Gère les imprévus',
      description: 'Prépare-toi aux changements météo ou aux désistements de dernière minute',
      examples: ['Plan B en cas de pluie', 'Liste d\'attente', 'Reprogrammation possible']
    }
  ];

  const bestPractices = [
    {
      icon: '✅',
      title: 'À faire',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      items: [
        'Confirmer le lieu et l\'heure 2h avant',
        'Arriver 10 minutes en avance',
        'Apporter le matériel promis',
        'Rester disponible par téléphone',
        'Remercier les participants après'
      ]
    },
    {
      icon: '❌',
      title: 'À éviter',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      items: [
        'Annuler au dernier moment sans raison',
        'Changer le lieu sans prévenir',
        'Accepter plus de participants que prévu',
        'Oublier d\'apporter le matériel',
        'Ne pas répondre aux questions'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 pt-8">
        {/* Header */}
        <Card variant="gradient" className="mb-6">
          <CardHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Guide d&apos;organisation
              </h1>
              <p className="text-gray-600">
                Découvre comment organiser des événements sportifs réussis
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Tips Section */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-800">💡 Conseils d&apos;organisation</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tips.map((tip, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{tip.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{tip.title}</h3>
                      <p className="text-gray-700 mb-3">{tip.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {tip.examples.map((example, exIndex) => (
                          <Badge key={exIndex} variant="info" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {bestPractices.map((practice, index) => (
            <Card key={index} className={practice.bgColor}>
              <CardHeader>
                <h3 className={`text-xl font-bold ${practice.color} flex items-center`}>
                  <span className="text-2xl mr-2">{practice.icon}</span>
                  {practice.title}
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {practice.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-700 flex items-start">
                      <span className={`${practice.color} mr-2 text-lg font-bold`}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <Card className="text-center">
          <CardContent className="py-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Prêt à organiser ton premier événement ?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/create')}
              >
                🚀 Créer un événement
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/profile')}
              >
                📊 Gérer mes événements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomTabs />
    </div>
  );
}