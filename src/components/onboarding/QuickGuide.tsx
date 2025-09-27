'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useNextAction } from '@/hooks/useNextAction';

const steps = [
  {
    number: '1',
    emoji: '👤',
    title: 'CRÉE',
    subtitle: 'ton annonce',
    description: 'Crée une annonce sportive avec lieu, date et nombre de joueurs',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    lightColor: 'bg-gradient-to-r from-blue-100 to-blue-200',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-600',
    action: '/how-to-create',
  },
  {
    number: '2',
    emoji: '📍',
    title: 'PUBLIE',
    subtitle: 'ta dispo',
    description: 'Sport, lieu, date, nombre de joueurs',
    color: 'bg-gradient-to-r from-emerald-500 to-green-600',
    lightColor: 'bg-gradient-to-r from-emerald-100 to-green-200',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-600',
    action: '/create',
  },
  {
    number: '3',
    emoji: '🔍',
    title: 'CHERCHE',
    subtitle: 'des partenaires',
    description: 'Parcours les dispos autour de toi et rejoins une partie',
    color: 'bg-gradient-to-r from-purple-500 to-violet-600',
    lightColor: 'bg-gradient-to-r from-purple-100 to-violet-200',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-600',
    action: '/search',
  },
  {
    number: '4',
    emoji: '💬',
    title: 'ORGANISE',
    subtitle: 'ta session',
    description: 'Chat, confirmation et suivi dans Mes Parties',
    color: 'bg-gradient-to-r from-amber-500 to-orange-600',
    lightColor: 'bg-gradient-to-r from-amber-100 to-orange-200',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-600',
    action: '/organise',
  },
  {
    number: '5',
    emoji: '⚽',
    title: 'JOUE',
    subtitle: '& recommence',
    description: "L'app centralise tout, tu n'as plus qu'à profiter",
    color: 'bg-gradient-to-r from-red-500 to-rose-600',
    lightColor: 'bg-gradient-to-r from-red-100 to-rose-200',
    borderColor: 'border-red-400',
    textColor: 'text-red-600',
    action: '/dashboard',
  },
];

interface QuickGuideProps {
  onComplete?: () => void;
  isCompact?: boolean;
}

export function QuickGuide({ onComplete, isCompact = false }: QuickGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const { nextAction, loading: actionLoading } = useNextAction();

  const getStepTitle = (step: typeof steps[0]) => {
    if (step.number === '5' && nextAction && !actionLoading) {
      return nextAction.label;
    }
    return step.title;
  };

  const getStepDescription = (step: typeof steps[0]) => {
    if (step.number === '5' && nextAction && !actionLoading) {
      switch (nextAction.type) {
        case 'next_event':
          return nextAction.event ? `${nextAction.event.title} - ${new Date(nextAction.event.date).toLocaleDateString('fr-FR')}` : 'Votre prochaine partie vous attend';
        case 'search':
          return 'Trouvez des parties à rejoindre';
        case 'create':
          return 'Commencez par créer votre premier événement';
        default:
          return step.description;
      }
    }
    return step.description;
  };

  const handleStepClick = (step: typeof steps[0]) => {
    // Pour le bouton JOUE, utiliser la logique intelligente
    if (step.number === '5' && nextAction && !actionLoading) {
      router.push(nextAction.url);
    } else {
      router.push(step.action);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isCompact) {
    return (
      <div className="w-full bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ⚡ Comment ça marche ?
          </h3>
          <Button
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? '✨ Masquer' : '🚀 Voir tout'}
          </Button>
        </div>

        {showAll ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                onClick={() => handleStepClick(step)}
                className={`${step.lightColor} border-2 ${step.borderColor} rounded-2xl p-4 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
              >
                <div className="flex items-center mb-3">
                  <div className={`w-10 h-10 rounded-xl ${step.color} text-white flex items-center justify-center font-bold text-sm shadow-lg`}>
                    {step.number}
                  </div>
                  <span className="ml-3 text-2xl">{step.emoji}</span>
                </div>
                <h4 className={`font-black text-sm ${step.textColor} mb-1`}>
                  {getStepTitle(step)}
                </h4>
                <p className="text-xs text-gray-700 font-medium">
                  {getStepDescription(step)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                onClick={() => handleStepClick(step)}
                className={`flex-shrink-0 flex items-center space-x-2 ${step.lightColor} ${step.borderColor} border-2 rounded-full px-4 py-2 hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer`}
              >
                <span className="text-xl">{step.emoji}</span>
                <span className={`text-sm font-bold ${step.textColor}`}>{getStepTitle(step)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
        <CardContent className="bg-white p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              ⚡ Guide rapide – Sport Connect
            </h2>
            <p className="text-gray-700 font-medium">
              5 étapes pour commencer à jouer
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between mb-8 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1"
              >
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all transform ${
                      index <= currentStep
                        ? `${step.color} text-white shadow-lg scale-110`
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? '✨' : step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute top-6 left-12 h-1 transition-all rounded-full ${
                        index < currentStep
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : 'bg-gray-200'
                      }`}
                      style={{ width: 'calc(100% + 20px)' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current step content */}
          <div className={`text-center mb-8 p-8 rounded-2xl ${steps[currentStep].lightColor} border-2 ${steps[currentStep].borderColor}`}>
            <div className="text-7xl mb-4 animate-bounce">{steps[currentStep].emoji}</div>
            <h3 className={`text-3xl font-black ${steps[currentStep].textColor} mb-2`}>
              {getStepTitle(steps[currentStep])}{' '}
              <span className="text-xl font-medium text-gray-700">
                {steps[currentStep].subtitle}
              </span>
            </h3>
            <p className="text-lg text-gray-800 font-medium mt-4">
              {getStepDescription(steps[currentStep])}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-2 border-gray-300 hover:border-purple-400 font-bold"
            >
              ← Précédent
            </Button>

            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`rounded-full transition-all transform hover:scale-125 ${
                    index === currentStep
                      ? `w-8 h-3 ${step.color}`
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600 font-bold shadow-lg"
            >
              {currentStep === steps.length - 1 ? "🚀 C'est parti !" : 'Suivant →'}
            </Button>
          </div>

          {onComplete && currentStep === steps.length - 1 && (
            <div className="text-center mt-6">
              <button
                onClick={onComplete}
                className="text-sm text-gray-500 hover:text-purple-600 underline font-medium transition-colors"
              >
                Passer ce guide
              </button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}