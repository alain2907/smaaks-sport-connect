# 🏆 SMAAKS Sport Connect

Une Progressive Web App (PWA) moderne pour connecter les sportifs et organiser des sessions sportives spontanées.

## ✨ Fonctionnalités

### 🎨 Design Moderne
- **Palette de couleurs vibrante** : Rouge corail, turquoise dynamique, jaune doré
- **Gradients énergiques** : Effets visuels immersifs pour une expérience sportive
- **Animations fluides** : Micro-interactions et transitions pour un UX premium
- **Mode sombre** : Support automatique avec couleurs adaptées

### 🔐 Authentification
- **Firebase Auth** : Connexion sécurisée avec email/mot de passe
- **Gestion de profil** : Profil utilisateur complet avec informations sportives
- **Protection des routes** : Accès sécurisé aux pages privées

### 📱 Interface Utilisateur
- **Bottom Navigation** : Navigation intuitive avec effet glassmorphism
- **Composants UI modernes** :
  - Boutons avec gradients et effets hover
  - Cards avec variantes (default, gradient, glass, neon)
  - Badges animés avec échelle au hover
- **Responsive Design** : Optimisé mobile-first avec support PWA

### 🏃‍♂️ Fonctionnalités Sportives
- **Dashboard personnalisé** : Vue d'ensemble des activités
- **Système de disponibilités** : Proposition et recherche de sessions
- **Guide d'onboarding** : Introduction interactive pour nouveaux utilisateurs
- **Stats utilisateur** : Suivi des matchs joués et sports pratiqués

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm/yarn/pnpm
- Compte Firebase configuré

### Installation

```bash
# Cloner le repository
git clone https://github.com/alain2907/smaaks-sport-connect.git
cd smaaks-sport-connect

# Installer les dépendances
npm install

# Configurer Firebase (voir section Configuration)

# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) pour voir l'application.

## ⚙️ Configuration

### Firebase Setup
1. Créer un projet Firebase
2. Activer Authentication (Email/Password)
3. Créer `src/lib/firebase-config.ts` :

```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Variables d'environnement
Créer `.env.local` :
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... autres variables Firebase
```

## 🛠️ Scripts Disponibles

```bash
# Développement avec Turbopack
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint

# Déploiement sécurisé
./deploy.sh
```

## 🔒 Sécurité & Déploiement

### Protection Automatique
- **Hook pre-push** : Vérifications automatiques avant chaque push
- **Script deploy.sh** : Protection multicouche avant déploiement

### Vérifications Automatiques
1. ✅ Validation du dossier projet
2. ✅ Vérification package.json
3. ✅ Validation projet Vercel
4. ✅ Scan des fichiers sensibles
5. ✅ Tests automatiques
6. ✅ Build de production

### Déploiement
```bash
# Déploiement sécurisé avec vérifications
./deploy.sh

# Le script vérifiera automatiquement :
# - Bon projet Vercel lié
# - Build réussi
# - Aucun fichier sensible
# - Confirmation manuelle
```

## 🏗️ Architecture

### Stack Technique
- **Framework** : Next.js 15.5.3 avec App Router
- **Styling** : Tailwind CSS 4 avec variables CSS custom
- **Authentification** : Firebase Auth
- **Déploiement** : Vercel
- **PWA** : next-pwa pour l'expérience mobile

### Structure du Projet
```
src/
├── app/                 # App Router pages
│   ├── dashboard/       # Page d'accueil
│   ├── profile/         # Profil utilisateur
│   ├── login/           # Authentification
│   └── ...
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   ├── navigation/     # Navigation
│   └── onboarding/     # Guide utilisateur
├── hooks/              # Hooks React custom
├── lib/                # Utilitaires et config
└── types/              # Types TypeScript
```

### Design System
- **Couleurs** : Palette énergique avec gradients
- **Composants** : UI library cohérente avec variants
- **Animations** : Micro-interactions pour l'engagement
- **Responsive** : Mobile-first avec breakpoints Tailwind

## 🎯 Roadmap

### Phase 1 ✅ (Actuelle)
- [x] Authentification Firebase
- [x] Interface utilisateur moderne
- [x] Navigation responsive
- [x] Système de protection déploiement

### Phase 2 🚧 (En cours)
- [ ] Intégration Firebase Firestore
- [ ] Système de matchmaking
- [ ] Notifications push
- [ ] Géolocalisation

### Phase 3 📋 (Planifiée)
- [ ] Chat en temps réel
- [ ] Système de notation
- [ ] Intégrations calendrier
- [ ] Analytics avancées

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens

- **Application Live** : [smaaks-sport-connect.vercel.app](https://smaaks-sport-connect.vercel.app)
- **Repository GitHub** : [github.com/alain2907/smaaks-sport-connect](https://github.com/alain2907/smaaks-sport-connect)
- **Issues** : [GitHub Issues](https://github.com/alain2907/smaaks-sport-connect/issues)

---

**Développé avec ❤️ pour la communauté sportive**