// Firebase FCM + PWA Service Worker fusionné

// --- Firebase FCM ---
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCCaJ9FqcGnkmNO2Lf_K6yClJP_VEWk7z8",
  authDomain: "smaaks-groups.firebaseapp.com",
  projectId: "smaaks-groups",
  storageBucket: "smaaks-groups.firebasestorage.app",
  messagingSenderId: "773052089142",
  appId: "1:773052089142:web:9e8be5b98a830d2e0e0d8c"
});

const messaging = firebase.messaging();

// --- Configuration cache PWA ---
const CACHE_NAME = "smaaks-cache-v1";

// Installer le SW sans pré-cacher (pour éviter les erreurs)
self.addEventListener("install", (event) => {
  console.log("[SW] Installation…");
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activer le SW (cleanup anciens caches)
self.addEventListener("activate", (event) => {
  console.log("[SW] Activation…");
  // Prendre le contrôle immédiatement
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[SW] Suppression cache", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
});

// Intercepter les requêtes réseau (simplifiée)
self.addEventListener("fetch", (event) => {
  // Ne rien faire, laisser passer les requêtes normalement
  return;
});

// --- Notifications FCM ---
// Reçoit les notifications quand l'app est en background
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Notification reçue en background", payload);

  const { title, body } = payload.notification || {};
  const options = {
    body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
  };

  self.registration.showNotification(title, options);
});

// Clique sur une notification → ouvrir /chat
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/chat") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/chat");
      }
    })
  );
});