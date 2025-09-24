'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const SPORTS = [
  { id: 'football', name: 'Football', emoji: '⚽' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾' },
  { id: 'running', name: 'Course à pied', emoji: '🏃‍♂️' },
  { id: 'badminton', name: 'Badminton', emoji: '🏸' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐' },
  { id: 'cycling', name: 'Vélo', emoji: '🚴‍♂️' },
  { id: 'swimming', name: 'Natation', emoji: '🏊‍♂️' }
];

const SKILL_LEVELS = [
  { id: 'beginner', name: 'Débutant', description: 'Je débute dans ce sport' },
  { id: 'intermediate', name: 'Intermédiaire', description: 'J\'ai quelques bases' },
  { id: 'advanced', name: 'Avancé', description: 'J\'ai un bon niveau' },
  { id: 'all', name: 'Tous niveaux', description: 'Ouvert à tous' }
];

// Lieux adaptés par sport
const LOCATIONS_BY_SPORT: Record<string, Array<{ id: string; name: string; type: string; emoji: string }>> = {
  football: [
    { id: 'terrain-foot-1', name: 'Terrain de Football', type: 'Terrain synthétique', emoji: '⚽' },
    { id: 'stade-municipal', name: 'Stade Municipal', type: 'Stade', emoji: '🏟️' },
    { id: 'complexe-sportif', name: 'Complexe Sportif', type: 'Complexe', emoji: '🏢' },
    { id: 'parc-public', name: 'Parc Public', type: 'Parc/Pelouse', emoji: '🌳' },
  ],
  basketball: [
    { id: 'salle-basket', name: 'Salle de Basketball', type: 'Salle couverte', emoji: '🏀' },
    { id: 'playground', name: 'Playground', type: 'Terrain extérieur', emoji: '🏢' },
    { id: 'gymnase', name: 'Gymnase Municipal', type: 'Gymnase', emoji: '🏭' },
    { id: 'city-stade', name: 'City-stade', type: 'Terrain multisport', emoji: '🏙️' },
  ],
  tennis: [
    { id: 'court-tennis', name: 'Courts de Tennis', type: 'Courts couverts', emoji: '🎾' },
    { id: 'tennis-club', name: 'Tennis Club', type: 'Club privé', emoji: '🏢' },
    { id: 'courts-municipaux', name: 'Courts Municipaux', type: 'Courts publics', emoji: '🏟️' },
  ],
  running: [
    { id: 'parc-running', name: 'Parc de la Ville', type: 'Parc urbain', emoji: '🌳' },
    { id: 'piste-athletisme', name: 'Piste d\'Athlétisme', type: 'Piste 400m', emoji: '🏃‍♂️' },
    { id: 'bord-de-seine', name: 'Bords de Seine', type: 'Parcours nature', emoji: '🌊' },
    { id: 'foret', name: 'Forêt de Vincennes', type: 'Sentier nature', emoji: '🌲' },
  ],
  badminton: [
    { id: 'salle-badminton', name: 'Salle de Badminton', type: 'Salle spécialisée', emoji: '🏸' },
    { id: 'gymnase-bad', name: 'Gymnase Municipal', type: 'Gymnase', emoji: '🏭' },
    { id: 'complexe-raquettes', name: 'Complexe Raquettes', type: 'Centre sportif', emoji: '🏢' },
  ],
  volleyball: [
    { id: 'salle-volley', name: 'Salle de Volleyball', type: 'Salle couverte', emoji: '🏐' },
    { id: 'beach-volley', name: 'Terrain Beach-Volley', type: 'Terrain sable', emoji: '🏖️' },
    { id: 'gymnase-volley', name: 'Gymnase Municipal', type: 'Gymnase', emoji: '🏭' },
  ],
  cycling: [
    { id: 'piste-cyclable', name: 'Piste Cyclable', type: 'Véloroute', emoji: '🚴‍♂️' },
    { id: 'velo-drome', name: 'Vélodrome', type: 'Piste couverte', emoji: '🏟️' },
    { id: 'foret-velo', name: 'Forêt VTT', type: 'Sentiers VTT', emoji: '🌲' },
  ],
  swimming: [
    { id: 'piscine-municipale', name: 'Piscine Municipale', type: 'Piscine couverte', emoji: '🏊‍♂️' },
    { id: 'piscine-olympique', name: 'Piscine Olympique', type: '50m couverte', emoji: '🏆' },
    { id: 'centre-aquatique', name: 'Centre Aquatique', type: 'Complexe aquatique', emoji: '🏊‍♀️' },
  ]
};

// Villes avec variantes de recherche
const POPULAR_CITIES = [
  { id: 'paris', name: 'Paris', emoji: '🏛️', searchTerms: ['paris', 'paname'] },
  { id: 'lyon', name: 'Lyon', emoji: '🦁', searchTerms: ['lyon', 'lyons'] },
  { id: 'marseille', name: 'Marseille', emoji: '⛵', searchTerms: ['marseille', 'marseilles', 'marselle'] },
  { id: 'toulouse', name: 'Toulouse', emoji: '🚀', searchTerms: ['toulouse', 'tolouse'] },
  { id: 'nice', name: 'Nice', emoji: '🌴', searchTerms: ['nice', 'nise'] },
  { id: 'nantes', name: 'Nantes', emoji: '🏰', searchTerms: ['nantes', 'nante'] },
  { id: 'montpellier', name: 'Montpellier', emoji: '☀️', searchTerms: ['montpellier', 'montpelier'] },
  { id: 'strasbourg', name: 'Strasbourg', emoji: '🏰', searchTerms: ['strasbourg', 'strassbourg'] },
  { id: 'bordeaux', name: 'Bordeaux', emoji: '🍷', searchTerms: ['bordeaux', 'bordeau'] },
  { id: 'lille', name: 'Lille', emoji: '🏛️', searchTerms: ['lille', 'lile'] },
  { id: 'rennes', name: 'Rennes', emoji: '🏰', searchTerms: ['rennes', 'rene'] },
  { id: 'grenoble', name: 'Grenoble', emoji: '🏔️', searchTerms: ['grenoble', 'grennoble'] }
];

// Suggestions de description par sport
const DESCRIPTION_SUGGESTIONS: Record<string, string[]> = {
  football: [
    "Match amical 5v5, niveau détendu 😊",
    "Recherche joueurs pour compléter l’équipe",
    "Match 11v11, venez nombreux !",
    "Séance d’entraînement technique et physique"
  ],
  basketball: [
    "Partie 3v3, ambiance conviviale 🏀",
    "Match 5v5, tous niveaux bienvenus",
    "Entraînement tirs et dribbles",
    "Tournoi improvisé, qui est chaud ? 🔥"
  ],
  tennis: [
    "Recherche partenaire pour simple 🎾",
    "Double mixte, ambiance détendue",
    "Séance d’entraînement coups droits",
    "Match en sets courts (6 jeux)"
  ],
  running: [
    "Footing matinal, rythme tranquille 🏃‍♂️",
    "Course 5-10km, allure 5min/km",
    "Découverte du parcours, tous niveaux",
    "Préparation semi-marathon ensemble"
  ],
  badminton: [
    "Double détendu, niveau intermédiaire 🏸",
    "Simple, recherche adversaire régulier",
    "Initiation badminton, débutants ok",
    "Match comptant, niveau confirmé"
  ],
  volleyball: [
    "Match 6v6, ambiance fun 🏐",
    "Beach-volley, venez bronzer ! ☀️",
    "Entraînement service et attaque",
    "Tournoi amical, équipes mélangées"
  ],
  cycling: [
    "Sortie vélo route, 30-50km 🚴‍♂️",
    "VTT en forêt, niveau sportif",
    "Balade urbaine à vélo, détendue",
    "Entraînement col et dénivelé"
  ],
  swimming: [
    "Nage libre, séance endurance 🏊‍♂️",
    "Cours d’aquagym collectif",
    "Entraînement 4 nages technique",
    "Longueurs tranquilles, pauses discus"
  ]
};

export default function Create() {
  const router = useRouter();
  const { user } = useAuth();
  const { createEvent, error, clearError } = useEvents();

  const [formData, setFormData] = useState({
    city: '',
    title: '',
    sport: '',
    description: '',
    location: '',
    date: '',
    maxParticipants: 4,
    skillLevel: 'all' as string,
    equipment: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState(POPULAR_CITIES);
  const [filteredLocations, setFilteredLocations] = useState<Array<{ id: string; name: string; type: string; emoji: string }>>([]); // Vide par défaut

  const STEPS = [
    { id: 'basic', title: 'Informations de base', description: 'Ville, titre et sport' },
    { id: 'details', title: 'Détails', description: 'Description et lieu précis' },
    { id: 'when', title: 'Quand et combien', description: 'Date et participants' },
    { id: 'level', title: 'Niveau et équipement', description: 'Finalisation' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Clear previous errors
    setValidationError(null);
    clearError();

    // Validation
    if (!formData.city.trim()) {
      setValidationError('La ville est obligatoire');
      return;
    }
    if (!formData.title.trim()) {
      setValidationError('Le titre est obligatoire');
      return;
    }
    if (!formData.sport) {
      setValidationError('Veuillez sélectionner un sport');
      return;
    }
    if (!formData.location.trim()) {
      setValidationError('Le lieu est obligatoire');
      return;
    }
    if (!formData.date) {
      setValidationError('La date est obligatoire');
      return;
    }

    const selectedDate = new Date(formData.date);
    if (selectedDate <= new Date()) {
      setValidationError('La date doit être dans le futur');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        ...formData,
        date: selectedDate,
        creatorId: user.uid
      };

      const eventId = await createEvent({...eventData, skillLevel: eventData.skillLevel as "beginner" | "intermediate" | "advanced" | "all"});

      if (eventId) {
        router.push('/dashboard');
      } else {
        setValidationError('Erreur lors de la création de l’événement');
      }
    } catch {
      setValidationError('Erreur inattendue lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }

    // Filter city suggestions when typing
    if (field === 'city' && typeof value === 'string') {
      const filtered = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase()) ||
        city.searchTerms.some(term => term.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredCities(filtered);
      setShowCitySuggestions(value.length > 0 && filtered.length > 0);
    }

    // Filter location suggestions when typing in location field
    if (field === 'location' && typeof value === 'string') {
      const sportLocations = formData.sport ? LOCATIONS_BY_SPORT[formData.sport] || [] : [];
      const filtered = sportLocations.filter(location =>
        location.name.toLowerCase().includes(value.toLowerCase()) ||
        location.type.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationSuggestions(value.length > 0 && filtered.length > 0);
    }

    // Update location suggestions when sport changes
    if (field === 'sport' && typeof value === 'string') {
      const sportLocations = LOCATIONS_BY_SPORT[value] || [];
      setFilteredLocations(sportLocations);
      // Reset location if it doesn’t match the new sport
      if (formData.location && !sportLocations.some(loc => loc.name === formData.location)) {
        setFormData(prev => ({ ...prev, location: '' }));
      }
    }
  };

  const selectCity = (cityName: string) => {
    updateField('city', cityName);
    setShowCitySuggestions(false);
  };

  const selectLocation = (locationName: string) => {
    updateField('location', locationName);
    setShowLocationSuggestions(false);
  };

  const selectDescription = (description: string) => {
    updateField('description', description);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic info
        if (!formData.city.trim()) {
          setValidationError('La ville est obligatoire');
          return false;
        }
        if (!formData.title.trim()) {
          setValidationError('Le titre est obligatoire');
          return false;
        }
        if (!formData.sport) {
          setValidationError('Veuillez sélectionner un sport');
          return false;
        }
        break;
      case 1: // Details
        if (!formData.location.trim()) {
          setValidationError('Le lieu est obligatoire');
          return false;
        }
        break;
      case 2: // When
        if (!formData.date) {
          setValidationError('La date est obligatoire');
          return false;
        }
        const selectedDate = new Date(formData.date);
        if (selectedDate <= new Date()) {
          setValidationError('La date doit être dans le futur');
          return false;
        }
        break;
      case 3: // Final step
        // All validations are done
        break;
    }
    setValidationError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setValidationError(null);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return formData.city.trim() !== '' && formData.title.trim() !== '' && formData.sport !== '';
      case 1:
        return formData.location.trim() !== '';
      case 2:
        return formData.date !== '' && new Date(formData.date) > new Date();
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20 flex items-center justify-center">
        <Card variant="gradient">
          <CardContent className="text-center py-8">
            <span className="text-4xl mb-4 block">🔒</span>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Connexion requise
            </h2>
            <p className="text-gray-500 mb-4">
              Connectez-vous pour créer un événement
            </p>
            <Button onClick={() => router.push('/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <h1 className="text-2xl font-bold text-white">
              ➕ Propose une partie
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {(error || validationError) && (
          <Card variant="gradient" className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <span className="text-lg">⚠️</span>
                <p className="font-medium">{error || validationError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <>
              {/* Ville */}
              <Card variant="gradient">
                <CardContent className="p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    Ville * 🏙️
                  </label>

                  {/* Villes populaires */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">Villes populaires :</p>
                    <div className="grid grid-cols-3 gap-2">
                      {POPULAR_CITIES.slice(0, 9).map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => selectCity(city.name)}
                          className={`p-2 rounded-lg border-2 transition-all text-left text-sm ${
                            formData.city === city.name
                              ? 'border-purple-500 bg-purple-100'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <span className="text-base mr-1">{city.emoji}</span>
                          <span className="font-medium text-xs">{city.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Champ de recherche ville avec autocomplétion */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      onFocus={() => {
                        if (formData.city.length > 0) {
                          setShowCitySuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowCitySuggestions(false), 200);
                      }}
                      placeholder="Ou recherchez votre ville..."
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                    />

                    {/* Suggestions dropdown ville */}
                    {showCitySuggestions && filteredCities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-purple-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredCities.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => selectCity(city.name)}
                            className="w-full p-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-base mr-2">{city.emoji}</span>
                            <span className="font-medium">{city.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Titre */}
              <Card variant="gradient">
                <CardContent className="p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Titre de l&apos;événement *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Ex: Football 5v5 - Terrain synthétique"
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                  />
                </CardContent>
              </Card>

              {/* Sport */}
              <Card variant="gradient">
                <CardContent className="p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    Sport *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {SPORTS.map((sport) => (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => updateField('sport', sport.id)}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          formData.sport === sport.id
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-lg mr-2">{sport.emoji}</span>
                        <span className="font-medium">{sport.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 1: Details */}
          {currentStep === 1 && (
            <>
              {/* Description avec suggestions */}
              <Card variant="gradient">
                <CardContent className="p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description 📝
                  </label>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">💡 Que renseigner ?</span><br/>
                      Vous pouvez préciser l&apos;ambiance (conviviale, compétitive, détendue), le niveau attendu (débutant, confirmé, tous niveaux), les détails pratiques (durée, règles particulières, équipement à apporter) ainsi que ce qui est fourni (ballon, raquettes, vestiaires).
                    </p>
                  </div>

                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder={formData.sport ?
                      `Décrivez votre session de ${SPORTS.find(s => s.id === formData.sport)?.name.toLowerCase()}...` :
                      "Décrivez votre événement..."
                    }
                    rows={3}
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                  />

                </CardContent>
              </Card>

              {/* Lieu avec suggestions */}
              <Card variant="gradient">
                <CardContent className="p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    Lieu * 📍
                  </label>

                  {/* Lieux adaptés au sport */}
                  {formData.sport && LOCATIONS_BY_SPORT[formData.sport] && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Lieux adaptés pour le {SPORTS.find(s => s.id === formData.sport)?.name.toLowerCase()} :
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {LOCATIONS_BY_SPORT[formData.sport].slice(0, 4).map((location) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => selectLocation(location.name)}
                            className={`p-2 rounded-lg border-2 transition-all text-left text-sm ${
                              formData.location === location.name
                                ? 'border-purple-500 bg-purple-100'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <span className="text-base mr-1">{location.emoji}</span>
                            <span className="font-medium">{location.name}</span>
                            <div className="text-xs text-gray-500">{location.type}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Champ de saisie avec autocomplétion */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      onFocus={() => {
                        if (formData.location.length > 0) {
                          setShowLocationSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding to allow clicking on suggestions
                        setTimeout(() => setShowLocationSuggestions(false), 200);
                      }}
                      placeholder="Ou tapez votre lieu personnalisé..."
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                    />

                    {/* Suggestions dropdown */}
                    {showLocationSuggestions && filteredLocations.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-purple-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredLocations.map((location) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => selectLocation(location.name)}
                            className="w-full p-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-base mr-2">{location.emoji}</span>
                            <span className="font-medium">{location.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({location.type})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    💡 Conseil : Soyez précis (ex: &quot;Stade Municipal, Rue de la Paix, Paris 15e&quot;)
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step 2: When & How Many */}
          {currentStep === 2 && (
            <>
              {/* Date et Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="gradient">
                  <CardContent className="p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date et heure *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                    />
                  </CardContent>
                </Card>

                <Card variant="gradient">
                  <CardContent className="p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre max de participants
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={formData.maxParticipants}
                      onChange={(e) => updateField('maxParticipants', parseInt(e.target.value))}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Step 3: Level & Equipment */}
          {currentStep === 3 && (
            <>
              {/* Niveau */}
              <Card variant="gradient">
                <CardContent className="p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-4">
                    Niveau requis
                  </label>
                  <div className="space-y-2">
                    {SKILL_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => updateField('skillLevel', level.id)}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                          formData.skillLevel === level.id
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-medium">{level.name}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Équipement */}
              <Card variant="gradient">
                <CardContent className="p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Équipement nécessaire
                  </label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => updateField('equipment', e.target.value)}
                    placeholder="Ex: Crampons recommandés, ballon fourni"
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 0 ? () => router.back() : prevStep}
              className="font-bold"
            >
              {currentStep === 0 ? '❌ Annuler' : '← Précédent'}
            </Button>

            <div className="flex space-x-2">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index <= currentStep
                      ? 'bg-purple-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
                disabled={!canProceed()}
                className="font-bold"
              >
                Suivant →
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !canProceed()}
                className="font-bold"
              >
                {isSubmitting ? '⏳ Création...' : '🚀 Créer l&apos;événement'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}