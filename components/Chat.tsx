'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { sendChatMessage } from '@/lib/firebase/chat';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatProps {
  groupId: string;
}

export default function Chat({ groupId }: ChatProps) {
  const { user, userData } = useAuth();
  const { messages, loading } = useChatMessages(groupId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      await sendChatMessage(groupId, {
        content: newMessage.trim(),
        userId: user.uid,
        userDisplayName: userData?.displayName || user.email?.split('@')[0] || 'Utilisateur',
        type: 'text'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💬 Chat SMAAKS</h2>
          <p className="text-gray-600 mb-4">Connectez-vous pour participer au chat global</p>
          <a
            href="/auth/login"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            💬 Chat Global SMAAKS
          </h1>
          <p className="text-gray-600 mt-1">
            Discussions en temps réel avec la communauté
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Aucun message pour le moment</p>
                  <p className="text-sm">Soyez le premier à lancer la conversation !</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.userId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.userId === user?.uid
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {message.userId !== user?.uid && (
                      <div className="text-xs font-medium mb-1 opacity-75">
                        {message.userDisplayName}
                      </div>
                    )}
                    <div className="break-words">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.userId === user?.uid ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                    >
                      {formatDistanceToNow(message.timestamp, {
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? '...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}