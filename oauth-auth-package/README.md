# 🔐 Firebase OAuth Next.js Package

Un package réutilisable pour implémenter rapidement l'authentification Google OAuth avec Firebase dans vos projets Next.js.

## ✨ Fonctionnalités

- 🚀 Authentification Google OAuth prête à l'emploi
- 🔥 Configuration Firebase simplifiée
- 🎨 Composants UI modernes avec Tailwind CSS
- 🪝 Hook React `useAuth` pour gérer l'état de connexion
- 📱 Responsive et mobile-first
- 🔒 Gestion sécurisée des erreurs
- ⚡ Compatible Next.js 14+ et 15+

## 📦 Installation

### 1. Copier les fichiers dans votre projet

Copiez le contenu de ce package dans votre projet Next.js :

```bash
# Structure à copier dans votre projet
src/
├── lib/
│   └── firebase.ts       # Configuration Firebase
├── hooks/
│   └── useAuth.tsx       # Hook d'authentification
├── components/
│   └── (vos composants UI)
├── types/
│   └── user.ts          # Types TypeScript
└── app/
    └── login/
        └── page.tsx     # Page de connexion
```

### 2. Installer les dépendances

```bash
npm install firebase
# ou
yarn add firebase
# ou
pnpm add firebase
```

### 3. Configuration Firebase

#### Étape 1 : Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez Authentication > Sign-in method > Google

#### Étape 2 : Obtenir les clés de configuration

Dans Firebase Console :
1. Paramètres du projet > Général
2. Créez une nouvelle application web
3. Copiez la configuration

#### Étape 3 : Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine de votre projet :

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Configuration Google OAuth

#### Dans Firebase Console :

1. **Authentication > Sign-in method > Google**
   - Activez le fournisseur Google
   - Ajoutez votre email de support

2. **Authentication > Settings > Authorized domains**
   - Ajoutez vos domaines de production
   - Supprimez `*.vercel.app` si présent (sécurité)

#### Dans Google Cloud Console :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez votre projet Firebase
3. APIs & Services > Credentials
4. Configurez le OAuth 2.0 Client ID :
   - Origines JavaScript autorisées : ajoutez vos domaines
   - URI de redirection : ajoutez `https://your-domain.com/__/auth/handler`

## 🚀 Utilisation

### 1. Page de connexion

Le fichier `src/login.tsx` contient une page de connexion prête à l'emploi. Personnalisez-la :

```tsx
// Remplacez "Your App Name" par le nom de votre application
<h1 className="text-3xl font-bold text-center">
  Your App Name
</h1>
```

### 2. Hook useAuth

Utilisez le hook dans vos composants :

```tsx
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, loading, error, signOut } = useAuth();

  if (loading) return <div>Chargement...</div>;
  if (!user) return <div>Non connecté</div>;

  return (
    <div>
      <p>Bienvenue {user.displayName}!</p>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  );
}
```

### 3. Protection des routes

Créez un middleware pour protéger vos routes :

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vérifier l'authentification ici
  // Rediriger vers /login si non authentifié
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
};
```

### 4. Types utilisateur

Les types sont définis dans `types/user.ts` :

```tsx
export interface User {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Personnalisation

### Thème et couleurs

Modifiez les classes Tailwind CSS dans les composants :

```tsx
// Exemple : changer les couleurs du bouton Google
<Button
  className="bg-blue-600 hover:bg-blue-700"
  // au lieu de
  className="bg-gradient-to-r from-blue-600 to-purple-600"
>
```

### Messages d'erreur

Personnalisez les messages dans `login.tsx` :

```tsx
if (error.message.includes('popup-closed')) {
  setError('Votre message personnalisé');
}
```

## 📝 Checklist de déploiement

- [ ] Variables d'environnement configurées sur votre plateforme d'hébergement
- [ ] Domaines autorisés configurés dans Firebase
- [ ] OAuth 2.0 Client ID configuré dans Google Cloud
- [ ] HTTPS activé (requis pour OAuth)
- [ ] Tests sur mobile et desktop

## 🐛 Dépannage

### Erreur "popup-closed-by-user"
- L'utilisateur a fermé la fenêtre de connexion
- Solution : Réessayer la connexion

### Erreur "unauthorized-domain"
- Le domaine n'est pas autorisé dans Firebase
- Solution : Ajouter le domaine dans Firebase Console > Authentication > Settings

### Erreur "invalid-api-key"
- Les variables d'environnement ne sont pas correctement configurées
- Solution : Vérifier le fichier `.env.local`

### Build échoue sur Vercel
- Les variables d'environnement ne sont pas configurées sur Vercel
- Solution : Ajouter les variables dans Vercel Dashboard > Settings > Environment Variables

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais exposer les clés secrètes côté client**
   - Utilisez uniquement les variables `NEXT_PUBLIC_*` pour le client

2. **Valider les domaines autorisés**
   - Supprimez `*.vercel.app` des domaines autorisés
   - Ajoutez uniquement vos domaines de production

3. **Implémenter une validation côté serveur**
   - Vérifiez toujours les tokens côté serveur pour les actions sensibles

4. **Gérer les erreurs gracieusement**
   - Ne jamais afficher de détails techniques aux utilisateurs

## 📚 Ressources

- [Documentation Firebase Auth](https://firebase.google.com/docs/auth)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Identity Platform](https://developers.google.com/identity)

## 🤝 Support

Pour toute question ou problème, consultez la documentation Firebase ou Next.js.

## 📄 License

MIT - Utilisez librement ce package dans vos projets commerciaux ou personnels.

---

**Note** : Ce package est un template de démarrage. Adaptez-le selon vos besoins spécifiques.