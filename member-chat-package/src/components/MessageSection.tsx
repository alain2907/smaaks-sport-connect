'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MessagesService } from '@/lib/firestore';
import { EventMessage } from '@/types/message';
import { Event } from '@/types/event';
import { useAuth } from '@/hooks/useAuth';

interface MessageSectionProps {
  event: Event;
}

export function MessageSection({ event }: MessageSectionProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<'spam' | 'inappropriate' | 'offensive' | 'other'>('inappropriate');
  const [reportDescription, setReportDescription] = useState('');

  const isOrganizer = user?.uid === event.creatorId;
  const isParticipant = event.participantIds?.includes(user?.uid || '');
  const canSendMessage = isOrganizer || isParticipant;

  useEffect(() => {
    if (!event.id) return;

    setLoading(true);
    const unsubscribe = MessagesService.subscribeToEventMessages(event.id, (msgs) => {
      // Pour l'organisateur, montrer TOUS les messages (même masqués)
      // Pour les autres, filtrer les messages masqués
      const filteredMessages = isOrganizer
        ? msgs // Montrer tous les messages pour l'organisateur
        : msgs.filter(msg => msg.status === 'visible'); // Montrer seulement visibles pour les autres

      setMessages(filteredMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [event.id, isOrganizer]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || !canSendMessage) return;

    setSending(true);
    try {
      await MessagesService.createMessage(
        {
          eventId: event.id,
          content: newMessage.trim()
        },
        user.uid
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        await MessagesService.deleteMessage(messageId, user.uid);
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Erreur lors de la suppression du message');
      }
    }
  };

  const handleModerateMessage = async (messageId: string, action: 'hide' | 'show') => {
    if (!user || !isOrganizer) return;

    try {
      await MessagesService.moderateMessage(messageId, action, user.uid);
    } catch (error) {
      console.error('Error moderating message:', error);
      alert('Erreur lors de la modération du message');
    }
  };

  const handleReportMessage = async (messageId: string) => {
    if (!user) return;

    try {
      await MessagesService.reportMessage(
        messageId,
        user.uid,
        reportReason,
        reportDescription || undefined
      );
      setShowReportModal(null);
      setReportReason('inappropriate');
      setReportDescription('');

      // Essayer d'envoyer un email à l'équipe de modération
      sendReportEmail(messageId);

      alert('Message signalé. Merci de votre vigilance.');
    } catch (error) {
      if (error instanceof Error && error.message.includes('déjà signalé')) {
        alert('Vous avez déjà signalé ce message');
      } else {
        alert('Erreur lors du signalement du message');
      }
      console.error('Error reporting message:', error);
    }
  };

  const sendReportEmail = (messageId: string) => {
    const reportedMessage = messages.find(msg => msg.id === messageId);
    if (!reportedMessage) return;

    const subject = `Signalement message - ${reportReason}`;
    const body = `
Bonjour,

Un message a été signalé dans votre application.

Événement : ${event.title} (ID: ${event.id})
Message signalé par : ${user?.displayName || user?.email || 'Utilisateur'}
Auteur du message : ${reportedMessage.userName}
Raison : ${reportReason}
Description : ${reportDescription || 'Aucune description fournie'}

Contenu du message :
"${reportedMessage.content}"

Date du message : ${formatDate(reportedMessage.createdAt)}

Merci de prendre les mesures appropriées.

Cordialement
    `.trim();

    const mailtoLink = `mailto:contact@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;  // À personnaliser

    // Essayer d'ouvrir le client mail
    try {
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.click();
    } catch {
      console.log('Impossible d\'ouvrir le client mail, fallback vers la page de signalement');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="py-8 text-center">
          <div className="text-gray-500">Chargement des messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          💬 Discussion
          {messages.length > 0 && (
            <Badge variant="info" className="ml-2">{messages.length}</Badge>
          )}
        </h3>
        {!canSendMessage && (
          <p className="text-sm text-gray-600 mt-2">
            Seuls les participants peuvent envoyer des messages
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {canSendMessage
              ? 'Soyez le premier à envoyer un message !'
              : 'Aucun message pour le moment'
            }
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.status === 'hidden'
                    ? 'bg-red-50 border-2 border-red-200 opacity-70'
                    : message.userId === user?.uid
                    ? 'bg-blue-50 ml-8'
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="font-bold text-sm text-gray-800">
                      {message.userName}
                    </div>
                    {message.isOrganizer && (
                      <Badge variant="success" className="text-xs">Organisateur</Badge>
                    )}
                    {message.status === 'hidden' && isOrganizer && (
                      <Badge variant="warning" className="text-xs">Masqué</Badge>
                    )}
                    {message.status === 'reported' && isOrganizer && (
                      <Badge variant="error" className="text-xs">
                        Signalé ({message.reports?.length})
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(message.createdAt)}
                  </div>
                </div>

                <p className="text-gray-700 mb-2">{message.content}</p>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {/* Report button - visible to all except author */}
                  {user && message.userId !== user.uid && (
                    <button
                      onClick={() => setShowReportModal(message.id)}
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      🚩 Signaler
                    </button>
                  )}

                  {/* Delete button - for author */}
                  {user && message.userId === user.uid && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      🗑️ Supprimer
                    </button>
                  )}

                  {/* Moderation buttons - for organizer */}
                  {isOrganizer && message.userId !== user?.uid && (
                    <>
                      {message.status === 'visible' ? (
                        <button
                          onClick={() => handleModerateMessage(message.id, 'hide')}
                          className="text-xs text-orange-500 hover:text-orange-700"
                        >
                          👁️‍🗨️ Masquer
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerateMessage(message.id, 'show')}
                          className="text-xs text-green-500 hover:text-green-700"
                        >
                          👁️ Afficher
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        ❌ Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Message Form */}
        {canSendMessage && user && (
          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                variant="primary"
              >
                {sending ? '...' : 'Envoyer'}
              </Button>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-lg font-bold">Signaler ce message</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du signalement
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as 'spam' | 'inappropriate' | 'offensive' | 'other')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="spam">Spam</option>
                      <option value="inappropriate">Contenu inapproprié</option>
                      <option value="offensive">Contenu offensant</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Donnez plus de détails si nécessaire..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>

                  {/* Info sur le processus de signalement */}
                  <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p className="font-bold mb-1">📧 Envoyer l&apos;email de signalement :</p>
                    <p>Votre client email s&apos;ouvrira avec un message pré-rempli pour l&apos;équipe de modération</p>
                    <p>Si votre client email ne s&apos;ouvre pas, utilisez votre formulaire de signalement alternatif.</p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReportModal(null);
                        setReportReason('inappropriate');
                        setReportDescription('');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReportMessage(showReportModal)}
                    >
                      Signaler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}