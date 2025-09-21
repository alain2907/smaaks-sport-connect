'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userDisplayName: string;
  timestamp: Date;
  type: 'text';
}

export function useChatMessages(groupId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(100) // Derniers 100 messages
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData: ChatMessage[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            content: data.content,
            userId: data.userId,
            userDisplayName: data.userDisplayName,
            timestamp: data.timestamp instanceof Timestamp
              ? data.timestamp.toDate()
              : new Date(data.timestamp),
            type: data.type || 'text'
          });
        });

        setMessages(messagesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erreur lors de la récupération des messages:', err);
        setError('Erreur lors du chargement des messages');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  return { messages, loading, error };
}