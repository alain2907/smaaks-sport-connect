'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

export function useFCM() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<string>('default');

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const requestPermission = async () => {
      try {
        // D'abord enregistrer le service worker manuellement
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker enregistré:', registration);
        }

        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted') {
          const messaging = getMessaging(app);

          // Attendre que le service worker soit bien enregistré
          const registration = await navigator.serviceWorker.ready;
          console.log('Service Worker prêt:', registration);

          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (currentToken) {
            console.log('🔑 Token FCM:', currentToken);
            setToken(currentToken);
          } else {
            console.log('Pas de token FCM disponible');
          }

          // Écouter les messages en foreground
          onMessage(messaging, (payload) => {
            console.log('📩 Message reçu en foreground:', payload);

            // Afficher notification custom ou utiliser l'API Notification
            if (payload.notification) {
              new Notification(payload.notification.title || 'Nouvelle notification', {
                body: payload.notification.body,
                icon: '/icons/icon-192x192.png'
              });
            }
          });
        }
      } catch (error) {
        console.error('Erreur FCM:', error);
      }
    };

    requestPermission();
  }, [user]);

  const subscribeToGroupTopic = async (groupId: string) => {
    if (!token) {
      console.error('Pas de token FCM disponible');
      return false;
    }

    try {
      const response = await fetch('/api/subscribeTopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          topic: `group_${groupId}`
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log(`✅ Abonné au topic: group_${groupId}`);
        return true;
      } else {
        console.error('Erreur abonnement topic:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Erreur abonnement topic:', error);
      return false;
    }
  };

  const unsubscribeFromGroupTopic = async (groupId: string) => {
    if (!token) {
      console.error('Pas de token FCM disponible');
      return false;
    }

    try {
      const response = await fetch('/api/unsubscribeTopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          topic: `group_${groupId}`
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log(`❌ Désabonné du topic: group_${groupId}`);
        return true;
      } else {
        console.error('Erreur désabonnement topic:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Erreur désabonnement topic:', error);
      return false;
    }
  };

  return {
    token,
    permission,
    subscribeToGroupTopic,
    unsubscribeFromGroupTopic
  };
}