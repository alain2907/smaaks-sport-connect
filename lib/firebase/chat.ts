import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatMessageData {
  content: string;
  userId: string;
  userDisplayName: string;
  type: 'text';
}

export async function sendChatMessage(groupId: string, messageData: ChatMessageData) {
  try {
    const messagesRef = collection(db, 'groups', groupId, 'messages');

    await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp(),
      createdAt: new Date()
    });

    // Envoyer notification push aux membres du groupe
    try {
      await fetch('/api/sendTopicNotification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `group_${groupId}`,
          title: "💬 Nouveau message dans le chat",
          body: `${messageData.userDisplayName}: ${messageData.content.substring(0, 50)}${messageData.content.length > 50 ? '...' : ''}`
        }),
      });
    } catch (notificationError) {
      console.error('Erreur envoi notification:', notificationError);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw error;
  }
}