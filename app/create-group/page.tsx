'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

const categories = [
  'Sport & Fitness',
  'Technologie & Innovation',
  'Arts & Culture',
  'Cuisine & Gastronomie',
  'Voyage & Aventure',
  'Entrepreneuriat & Business',
  'Santé & Bien-être',
  'Éducation & Formation',
  'Musique & Spectacle',
  'Jeux & Divertissement',
  'Nature & Environnement',
  'Communauté & Social',
  'Autre'
];

export default function CreateGroupPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const standardRules = [
    'Respecter tous les membres du groupe',
    'Pas de contenu offensant ou discriminatoire',
    'Rester dans le thème du groupe',
    'Pas de spam ou de publicité non autorisée',
    'Être ponctuel aux événements',
    'Prévenir en cas d\'absence à un événement',
    'Pas de harcèlement ou comportement inapproprié',
    'Respecter la confidentialité du groupe',
    'Participer de façon constructive',
    'Signaler tout problème aux modérateurs'
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: {
      city: '',
      region: '',
      country: 'France',
      address: ''
    },
    rules: [] as string[],
    selectedStandardRules: [] as boolean[],
    customRules: [''] as string[],
    admissionQuestions: [
      {
        id: '1',
        question: 'Pourquoi souhaitez-vous rejoindre ce groupe ?',
        required: true,
        type: 'text' as const,
        options: []
      }
    ],
    externalLinks: {
      whatsapp: '',
      discord: '',
      telegram: '',
      website: '',
      other: [] as { name: string; url: string }[]
    },
    settings: {
      isPrivate: false,
      requiresApproval: true,
      maxMembers: undefined as number | undefined,
      minAge: undefined as number | undefined,
      maxAge: undefined as number | undefined
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof typeof prev] as object),
          [field]: type === 'number' ? (value ? Number(value) : undefined) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addOtherLink = () => {
    setFormData(prev => ({
      ...prev,
      externalLinks: {
        ...prev.externalLinks,
        other: [...prev.externalLinks.other, { name: '', url: '' }]
      }
    }));
  };

  const updateOtherLink = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: {
        ...prev.externalLinks,
        other: prev.externalLinks.other.map((link, i) =>
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };

  const removeOtherLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      externalLinks: {
        ...prev.externalLinks,
        other: prev.externalLinks.other.filter((_, i) => i !== index)
      }
    }));
  };

  const handleStandardRuleChange = (index: number, checked: boolean) => {
    setFormData(prev => {
      const newSelected = [...prev.selectedStandardRules];
      newSelected[index] = checked;

      // Update the final rules array
      const selectedRules = standardRules.filter((_, i) => newSelected[i]);
      const customRules = prev.customRules.filter(rule => rule.trim() !== '');

      return {
        ...prev,
        selectedStandardRules: newSelected,
        rules: [...selectedRules, ...customRules]
      };
    });
  };

  const addCustomRule = () => {
    setFormData(prev => ({
      ...prev,
      customRules: [...prev.customRules, '']
    }));
  };

  const updateCustomRule = (index: number, value: string) => {
    setFormData(prev => {
      const newCustomRules = prev.customRules.map((rule, i) => i === index ? value : rule);
      const selectedRules = standardRules.filter((_, i) => prev.selectedStandardRules[i]);
      const validCustomRules = newCustomRules.filter(rule => rule.trim() !== '');

      return {
        ...prev,
        customRules: newCustomRules,
        rules: [...selectedRules, ...validCustomRules]
      };
    });
  };

  const removeCustomRule = (index: number) => {
    setFormData(prev => {
      const newCustomRules = prev.customRules.filter((_, i) => i !== index);
      const selectedRules = standardRules.filter((_, i) => prev.selectedStandardRules[i]);
      const validCustomRules = newCustomRules.filter(rule => rule.trim() !== '');

      return {
        ...prev,
        customRules: newCustomRules,
        rules: [...selectedRules, ...validCustomRules]
      };
    });
  };

  const addQuestion = () => {
    const newId = String(formData.admissionQuestions.length + 1);
    setFormData(prev => ({
      ...prev,
      admissionQuestions: [
        ...prev.admissionQuestions,
        {
          id: newId,
          question: '',
          required: false,
          type: 'text' as const,
          options: []
        }
      ]
    }));
  };

  const updateQuestion = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      admissionQuestions: prev.admissionQuestions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      admissionQuestions: prev.admissionQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: checked
      }
    }));
  };

  const nextStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Final rules combining standard and custom
      const selectedRules = standardRules.filter((_, i) => formData.selectedStandardRules[i]);
      const validCustomRules = formData.customRules.filter(rule => rule.trim() !== '');
      const finalRules = [...selectedRules, ...validCustomRules];

      // Clean settings object - remove undefined values
      const cleanSettings = {
        isPrivate: formData.settings.isPrivate,
        requiresApproval: formData.settings.requiresApproval,
        ...(formData.settings.maxMembers && { maxMembers: formData.settings.maxMembers }),
        ...(formData.settings.minAge && { minAge: formData.settings.minAge }),
        ...(formData.settings.maxAge && { maxAge: formData.settings.maxAge })
      };

      // Clean external links - remove empty values
      const cleanExternalLinks = {
        ...(formData.externalLinks.whatsapp && { whatsapp: formData.externalLinks.whatsapp }),
        ...(formData.externalLinks.discord && { discord: formData.externalLinks.discord }),
        ...(formData.externalLinks.telegram && { telegram: formData.externalLinks.telegram }),
        ...(formData.externalLinks.website && { website: formData.externalLinks.website }),
        ...(formData.externalLinks.other.length > 0 && {
          other: formData.externalLinks.other.filter(link => link.name.trim() && link.url.trim())
        })
      };

      const groupData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        rules: finalRules,
        admissionQuestions: formData.admissionQuestions,
        externalLinks: cleanExternalLinks,
        settings: cleanSettings,
        organizer: {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          email: user.email || ''
        },
        members: [
          {
            uid: user.uid,
            joinedAt: new Date(),
            role: 'admin' as const,
            status: 'active' as const
          }
        ],
        stats: {
          memberCount: 1,
          activeMembers: 1,
          totalEvents: 0,
          avgRating: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'groups'), groupData);

      setSuccess('Groupe créé avec succès !');

      setTimeout(() => {
        router.push(`/groups/${docRef.id}`);
      }, 2000);

    } catch (err: unknown) {
      setError('Erreur lors de la création du groupe.');
      console.error('Group creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Informations de base</h3>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du groupe *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Ex: Club de Randonnée Paris"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Décrivez votre groupe, ses objectifs et ce qu'il propose..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Localisation</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label htmlFor="location.region" className="block text-sm font-medium text-gray-700 mb-2">
                  Région
                </label>
                <input
                  type="text"
                  id="location.region"
                  name="location.region"
                  value={formData.location.region}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Île-de-France"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse ou lieu de rencontre (facultatif)
              </label>
              <input
                type="text"
                id="location.address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Parc des Buttes-Chaumont, métro Botzaris..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Lieu principal où se déroulent vos activités (optionnel)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Règles du groupe</h3>
            <p className="text-gray-600">Sélectionnez les règles standard et ajoutez vos règles personnalisées</p>

            {/* Standard Rules */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Règles standard</h4>
              <p className="text-sm text-gray-600 mb-4">
                Cochez les règles qui s&apos;appliquent à votre groupe
              </p>
              <div className="space-y-3">
                {standardRules.map((rule, index) => (
                  <label key={index} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.selectedStandardRules[index] || false}
                      onChange={(e) => handleStandardRuleChange(index, e.target.checked)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700 text-sm">{rule}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Rules */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Règles personnalisées</h4>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez des règles spécifiques à votre groupe
              </p>

              {formData.customRules.map((rule, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => updateCustomRule(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder={`Règle personnalisée ${index + 1}`}
                  />
                  {formData.customRules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCustomRule(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addCustomRule}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                + Ajouter une règle personnalisée
              </button>
            </div>

            {/* Rules Summary */}
            {formData.rules.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Résumé des règles ({formData.rules.length})
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    {formData.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Questions d&apos;admission</h3>
            <p className="text-gray-600">Questions que devront compléter les nouveaux membres</p>

            {formData.admissionQuestions.map((q, index) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  {formData.admissionQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Votre question..."
                  />

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                        className="mr-2"
                      />
                      Obligatoire
                    </label>

                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="text">Texte libre</option>
                      <option value="choice">Choix unique</option>
                      <option value="multipleChoice">Choix multiple</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              + Ajouter une question
            </button>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Paramètres du groupe</h4>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.settings.isPrivate}
                    onChange={handleCheckboxChange}
                    className="mr-3"
                  />
                  Groupe privé (invisible dans les recherches)
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresApproval"
                    checked={formData.settings.requiresApproval}
                    onChange={handleCheckboxChange}
                    className="mr-3"
                  />
                  Approbation requise pour rejoindre
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre max de membres
                    </label>
                    <input
                      type="number"
                      name="settings.maxMembers"
                      value={formData.settings.maxMembers || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Illimité"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Âge minimum
                    </label>
                    <input
                      type="number"
                      name="settings.minAge"
                      value={formData.settings.minAge || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="16"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Âge maximum
                    </label>
                    <input
                      type="number"
                      name="settings.maxAge"
                      value={formData.settings.maxAge || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="99"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">🚀 Liens externes (optionnel)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez des liens vers vos plateformes de communication externes (WhatsApp, Discord, etc.)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="url"
                    name="externalLinks.whatsapp"
                    value={formData.externalLinks.whatsapp}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discord
                  </label>
                  <input
                    type="url"
                    name="externalLinks.discord"
                    value={formData.externalLinks.discord}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="https://discord.gg/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram
                  </label>
                  <input
                    type="url"
                    name="externalLinks.telegram"
                    value={formData.externalLinks.telegram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="https://t.me/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="externalLinks.website"
                    value={formData.externalLinks.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Other Links */}
              {formData.externalLinks.other.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Autres liens</h5>
                  {formData.externalLinks.other.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => updateOtherLink(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Nom du lien"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateOtherLink(index, 'url', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => removeOtherLink(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm"
                      >
                        Suppr.
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addOtherLink}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                + Ajouter un autre lien
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen smaaks-bg-light">
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au dashboard
            </button>

            <h1 className="text-3xl font-bold smaaks-text-primary">Créer un Groupe</h1>
            <p className="text-gray-600 mt-2">
              Créez votre groupe et rassemblez des personnes partageant vos passions
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Étape {currentStep} sur {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="smaaks-bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="smaaks-card">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4 mb-6">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={(e) => nextStep(e)}
                    className="smaaks-btn-primary px-6 py-2"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="smaaks-btn-primary px-8 py-2 disabled:opacity-50"
                  >
                    {loading ? 'Création...' : 'Créer le groupe'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}