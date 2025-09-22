# 🤖 Documentation Claude Code

Ce fichier contient les informations spécifiques à Claude Code pour faciliter le développement et la maintenance du projet SMAAKS Sport Connect.

## 🛠️ Commandes de Développement

### Scripts NPM
```bash
# Développement
npm run dev          # Lance le serveur de développement avec Turbopack

# Build et Production
npm run build        # Build de production avec Next.js
npm start           # Démarre l'application en mode production

# Quality Assurance
npm run lint        # ESLint pour la qualité du code
npm run typecheck   # Vérification TypeScript (si configuré)
```

### Déploiement Sécurisé
```bash
# Déploiement avec protection automatique
./deploy.sh         # Script de déploiement sécurisé avec vérifications

# Le script vérifie automatiquement :
# ✅ Bon dossier de projet (smaaks-sport-connect)
# ✅ Package.json valide
# ✅ Projet Vercel correct
# ✅ Pas de fichiers sensibles (vercel-env-vars.txt)
# ✅ Build réussi
# ✅ Confirmation manuelle
```

## 🔒 Système de Protection Automatique

### Hook Pre-Push
Fichier : `.git/hooks/pre-push`

Exécute automatiquement les vérifications avant chaque `git push` :
1. **Validation dossier** : Vérifie qu'on est dans smaaks-sport-connect
2. **Validation package.json** : Contrôle la cohérence du projet
3. **Validation Vercel** : S'assure que le bon projet est lié
4. **Scan sécurité** : Détecte les fichiers sensibles (env vars, clés)
5. **Tests** : Lance les tests automatiques (si configurés)
6. **Build** : Vérifie que le projet se build correctement

### Script de Déploiement
Fichier : `deploy.sh`

Protection multicouche avant déploiement sur Vercel :
- Vérifications identiques au hook pre-push
- Affichage du statut Vercel
- Confirmation manuelle obligatoire
- Déploiement sécurisé vers la production

## 🎨 Système de Design

### Palette de Couleurs
Définie dans `src/app/globals.css` :
```css
:root {
  --primary: #FF6B6B;        /* Rouge corail énergique */
  --secondary: #4ECDC4;      /* Turquoise dynamique */
  --accent: #FFD93D;         /* Jaune doré */
  --success: #6BCF7F;        /* Vert menthe */
  --warning: #FF9F43;        /* Orange vif */
  --danger: #EE5A6F;         /* Rose punch */
  --info: #54A0FF;           /* Bleu électrique */
}
```

### Composants UI

#### Button (src/components/ui/Button.tsx)
Variants disponibles :
- `primary` : Gradient rose-rouge
- `secondary` : Gradient cyan-teal
- `gradient` : Gradient violet-indigo
- `success` : Gradient vert
- `warning` : Gradient orange
- `danger` : Gradient rouge-rose

#### Card (src/components/ui/Card.tsx)
Variants disponibles :
- `default` : Card blanche classique
- `gradient` : Fond avec gradient subtil
- `glass` : Effet glassmorphism
- `neon` : Bordure néon avec effet

#### Badge (src/components/ui/Badge.tsx)
Tous les badges utilisent des gradients avec effets hover.

### Utilitaires CSS Personnalisés
```css
.bg-gradient-primary     /* Gradient principal */
.bg-gradient-secondary   /* Gradient secondaire */
.bg-gradient-accent      /* Gradient accent */
.bg-gradient-sport       /* Gradient sport (bleu-cyan) */
.hover-lift              /* Effet hover avec élévation */
```

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
src/
├── app/                    # Pages Next.js App Router
│   ├── dashboard/         # Dashboard utilisateur
│   ├── profile/           # Profil utilisateur
│   ├── login/             # Authentification
│   ├── search/            # Recherche d'événements
│   ├── create/            # Création d'événements
│   ├── messages/          # Messagerie
│   ├── globals.css        # Styles globaux et variables CSS
│   └── layout.tsx         # Layout global avec navigation

├── components/
│   ├── ui/                # Composants UI réutilisables
│   │   ├── Button.tsx     # Boutons avec variants
│   │   ├── Card.tsx       # Cards avec variants
│   │   └── Badge.tsx      # Badges animés
│   ├── navigation/        # Composants de navigation
│   │   └── BottomTabs.tsx # Navigation bottom avec glassmorphism
│   ├── events/            # Composants liés aux événements
│   └── onboarding/        # Guide d'onboarding
│       └── QuickGuide.tsx # Guide rapide interactif

├── hooks/                 # Hooks React personnalisés
│   └── useAuth.tsx        # Hook d'authentification Firebase

├── lib/                   # Utilitaires et configuration
│   └── firebase.ts        # Configuration Firebase

└── types/                 # Types TypeScript
    ├── user.ts            # Types utilisateur
    ├── event.ts           # Types événement
    └── sport.ts           # Types sport
```

### Configuration Firebase
Fichier : `src/lib/firebase.ts`
- Configuration Firebase Auth
- Exports : `auth`, `app`
- Utilisé par le hook `useAuth`

### Hook d'Authentification
Fichier : `src/hooks/useAuth.tsx`
- State management pour l'utilisateur connecté
- Loading states
- Persistence automatique

## 🔄 Workflow de Développement

### 1. Développement Local
```bash
npm run dev
# L'app est disponible sur http://localhost:3000
```

### 2. Avant de Commiter
Le hook pre-push s'exécute automatiquement et vérifie :
- Build réussi
- Pas de fichiers sensibles
- Bon projet

### 3. Déploiement
```bash
git add .
git commit -m "Description des changements"
git push origin main    # Hook pre-push s'exécute automatiquement
./deploy.sh            # Déploiement sécurisé vers Vercel
```

## 🐛 Debugging & Troubleshooting

### Erreurs de Build
```bash
npm run build
# Vérifier les erreurs TypeScript et de build
```

### Problèmes Firebase
1. Vérifier la configuration dans `src/lib/firebase.ts`
2. S'assurer que Firebase Auth est activé
3. Vérifier les variables d'environnement

### Problèmes de Déploiement
1. Vérifier que le bon projet Vercel est lié : `vercel ls`
2. Re-lier si nécessaire : `vercel link`
3. Vérifier les permissions : `vercel whoami`

### Reset du Hook Pre-Push
Si le hook pose problème :
```bash
# Désactiver temporairement
chmod -x .git/hooks/pre-push

# Réactiver
chmod +x .git/hooks/pre-push
```

## 📊 Performance & Optimisations

### Bundle Analysis
Le build utilise Turbopack pour des performances optimales :
- Hot reload ultra-rapide
- Compilation incrémentale
- Tree-shaking automatique

### PWA Features
Configuration dans `next.config.ts` :
- Service Worker automatique
- Cache strategies
- Offline support

### Images & Assets
- Utilisation de `next/image` pour l'optimisation automatique
- Lazy loading par défaut
- Responsive images

## 🔮 Prochaines Étapes

### Fonctionnalités à Implémenter
1. **Firebase Firestore** : Base de données pour les événements
2. **Real-time Updates** : Synchronisation en temps réel
3. **Push Notifications** : Notifications web
4. **Géolocalisation** : Événements par proximité
5. **Chat System** : Messagerie temps réel

### Améliorations Techniques
1. **Tests** : Ajout de Jest/Testing Library
2. **Storybook** : Documentation des composants
3. **CI/CD** : Pipeline GitHub Actions
4. **Analytics** : Suivi des performances

---

**Note** : Ce fichier est maintenu à jour automatiquement par Claude Code pour faciliter le développement collaboratif.