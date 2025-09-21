import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline'
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts-stylesheets"
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
        }
      }
    }
  ]
});

const nextConfig: NextConfig = {
  // Configuration pour Vercel SSR - pas d'export statique
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ TEMPORAIRE : Ignorer les erreurs TS pendant la migration
    // TODO: Réactiver une fois le schéma stabilisé
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com'  // Pour les avatars Google
    ]
  }
};

export default withPWA(nextConfig);