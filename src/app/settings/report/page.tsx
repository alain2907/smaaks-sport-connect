'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    type: 'message',
    reason: 'inappropriate',
    description: '',
    userEmail: '',
    eventId: '',
    messageContent: ''
  });

  const handleSubmit = () => {
    const subject = `Signalement ${formData.type} - ${formData.reason}`;
    const body = `
Bonjour,

Je souhaite signaler un contenu inapproprié sur SMAAKS Sport Connect.

Type de signalement : ${formData.type}
Raison : ${formData.reason}
Événement concerné : ${formData.eventId || 'Non spécifié'}
Email de contact : ${formData.userEmail}

Description détaillée :
${formData.description}

${formData.messageContent ? `\nContenu du message signalé :\n"${formData.messageContent}"` : ''}

Merci de prendre les mesures appropriées.

Cordialement
    `.trim();

    const mailtoLink = `mailto:contact@smaaks.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Essayer d'ouvrir le client mail
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🚩 Signaler un Contenu
            </h1>
            <p className="text-gray-600">
              Utilisez ce formulaire pour signaler un contenu inapproprié sur SMAAKS Sport Connect.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Type de signalement */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Type de contenu à signaler
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="message">Message dans une discussion</option>
                  <option value="profile">Profil utilisateur</option>
                  <option value="event">Événement</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              {/* Raison */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Raison du signalement
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="spam">Spam</option>
                  <option value="inappropriate">Contenu inapproprié</option>
                  <option value="offensive">Contenu offensant</option>
                  <option value="harassment">Harcèlement</option>
                  <option value="fake">Fausses informations</option>
                  <option value="violence">Violence ou menaces</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              {/* Email de contact */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Votre email (pour suivi)
                </label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* ID Événement */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ID de l&apos;événement (si applicable)
                </label>
                <input
                  type="text"
                  value={formData.eventId}
                  onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                  placeholder="Copiez l'ID depuis l'URL de l'événement"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Contenu du message */}
              {formData.type === 'message' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Contenu du message signalé (copier-coller)
                  </label>
                  <textarea
                    value={formData.messageContent}
                    onChange={(e) => setFormData({...formData, messageContent: e.target.value})}
                    placeholder="Copiez ici le message que vous souhaitez signaler..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description détaillée
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez en détail le problème et pourquoi ce contenu devrait être signalé..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  required
                />
              </div>

              {/* Bouton d'envoi */}
              <div className="flex flex-col space-y-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.description.trim()}
                  variant="danger"
                  size="lg"
                  className="w-full"
                >
                  📧 Envoyer le signalement par email
                </Button>

                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <p className="font-bold mb-2">ℹ️ Comment ça marche :</p>
                  <ul className="space-y-1">
                    <li>• Cliquez sur le bouton pour ouvrir votre client email</li>
                    <li>• Si ça ne fonctionne pas, copiez cette adresse : <strong>contact@smaaks.fr</strong></li>
                    <li>• Incluez toutes les informations du formulaire dans votre email</li>
                    <li>• Nous traiterons votre signalement dans les plus brefs délais</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations légales */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">
              📋 Politique de Modération
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700">
              <p>
                SMAAKS Sport Connect s&apos;engage à maintenir un environnement sain et respectueux
                pour tous les utilisateurs. Nous prenons tous les signalements au sérieux.
              </p>

              <div>
                <h3 className="font-bold mb-2">Types de contenus interdits :</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Contenus offensants, discriminatoires ou haineux</li>
                  <li>Harcèlement ou intimidation</li>
                  <li>Spam ou contenus commerciaux non autorisés</li>
                  <li>Informations personnelles d&apos;autrui</li>
                  <li>Contenus violents ou menaçants</li>
                  <li>Fausses informations délibérées</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-2">Délais de traitement :</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Signalements urgents (violence, menaces) : &lt; 2 heures</li>
                  <li>Signalements standard : 24-48 heures</li>
                  <li>Vous recevrez une confirmation par email</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Contact direct :</strong> Pour des situations urgentes,
                contactez-nous directement à <strong>contact@smaaks.fr</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}