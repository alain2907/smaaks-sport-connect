# 💬 Système de Messagerie avec Modération

Package réutilisable pour implémenter un système de messagerie temps réel avec fonctionnalités complètes de modération et signalement.

## ✨ Fonctionnalités

- 💬 **Messagerie temps réel** - Messages instantanés avec Firebase Firestore
- 🛡️ **Modération complète** - Masquer, afficher, supprimer les messages
- 🚩 **Système de signalement** - Signalement par les utilisateurs avec email automatique
- 👤 **Gestion des rôles** - Organisateurs vs Participants avec permissions différentes
- 🔄 **Auto-modération** - Masquage automatique après 3 signalements
- 📧 **Email de signalement** - Client mail avec message pré-rempli
- 🎨 **Interface moderne** - Design responsive avec badges et états visuels

## 📦 Installation

### 1. Copier les fichiers dans votre projet

Copiez le contenu de ce package dans votre projet Next.js :

```bash
# Structure à copier dans votre projet
src/
├── types/
│   └── message.ts         # Types TypeScript pour les messages
├── lib/
│   └── firestore.ts       # Service de messagerie Firebase
└── components/
    └── MessageSection.tsx # Composant de messagerie React
```

### 2. Configuration Firebase

#### Initialiser Firestore dans votre projet

```typescript
// Dans votre fichier de configuration Firebase
import { initializeFirestore } from './lib/firestore';
import { db, auth } from './firebase'; // Vos instances Firebase

// Initialiser le service de messagerie
initializeFirestore(db, auth);
```

#### Variables d'environnement

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### 3. Personnalisation

#### Configuration des collections Firestore

Modifiez les noms de collections dans `firestore.ts` :

```typescript
export const COLLECTIONS = {
  EVENT_MESSAGES: 'your_messages_collection',
  EVENTS: 'your_events_collection',
  USERS: 'your_users_collection'
};
```

#### Configuration email de signalement

Dans `MessageSection.tsx`, modifiez l'email de contact :

```typescript
const mailtoLink = `mailto:contact@yourapp.com?subject=...`;
```

## 🚀 Utilisation

### Composant de base

```tsx
import { MessageSection } from './components/MessageSection';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

function EventPage({ event }) {
  return (
    <div>
      <MessageSection event={event} />
    </div>
  );
}
```

### Structure des données

#### Event (Événement)

```typescript
interface Event {
  id: string;
  title: string;
  creatorId: string;        // ID de l'organisateur
  participantIds: string[]; // IDs des participants
}
```

#### EventMessage

```typescript
interface EventMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  status: 'visible' | 'hidden' | 'reported';
  reports?: MessageReport[];
  isOrganizer: boolean;
}
```

## 🛡️ Système de Modération

### Rôles et Permissions

#### Organisateur
- ✅ Voir TOUS les messages (même masqués)
- ✅ Masquer/Afficher les messages
- ✅ Supprimer n'importe quel message
- ✅ Voir les badges de statut (Masqué, Signalé)

#### Participant
- ✅ Voir seulement les messages visibles
- ✅ Signaler les messages inappropriés
- ✅ Supprimer ses propres messages
- ✅ Envoyer de nouveaux messages

#### Utilisateur non-participant
- ✅ Voir les messages (lecture seule)
- ❌ Ne peut pas envoyer de messages

### Actions de Modération

#### Signalement par utilisateur
1. Clic sur "🚩 Signaler"
2. Sélection de la raison (spam, inapproprié, offensant, autre)
3. Description optionnelle
4. Email automatique envoyé à l'équipe
5. Comptage des signalements

#### Auto-modération
- **3 signalements** → Message automatiquement marqué comme "signalé"
- **Badge visuel** pour l'organisateur
- **Filtrage automatique** pour les utilisateurs normaux

#### Actions organisateur
- **Masquer** : Cache le message pour tous (sauf organisateur)
- **Afficher** : Rend visible un message masqué
- **Supprimer** : Suppression définitive

## 🎨 Interface Utilisateur

### États Visuels

#### Messages
- **Messages normaux** : Fond gris/bleu selon l'auteur
- **Messages masqués** : Fond rouge avec bordure (organisateur uniquement)
- **Alignement** : Messages de l'utilisateur à droite, autres à gauche

#### Badges
- **Organisateur** : Badge vert "Organisateur"
- **Masqué** : Badge orange "Masqué"
- **Signalé** : Badge rouge "Signalé (X)"

#### Actions contextuelles
- **Boutons différents** selon le rôle et l'auteur
- **Hover states** avec couleurs appropriées
- **Confirmation** pour les actions destructives

## 📧 Système de Signalement

### Email automatique

Le système génère automatiquement un email avec :

- **Sujet** : "Signalement message - [raison]"
- **Contenu** : Événement, auteur, raison, description, contenu du message
- **Destinataire** : Configurable (contact@yourapp.com)

### Fallback

Si le client mail ne s'ouvre pas :
- Message informatif à l'utilisateur
- Possibilité d'ajouter un formulaire web de fallback

## 🔧 Dépendances

### Requises

```json
{
  "firebase": "^10.0.0",
  "next": "^14.0.0",
  "react": "^18.0.0"
}
```

### Composants UI

Le package utilise vos composants UI existants :
- `Card`, `CardContent`, `CardHeader`
- `Button` avec variants (primary, outline, danger)
- `Badge` avec variants (success, warning, error, info)

## 🔄 Temps Réel

### Synchronisation automatique
- **onSnapshot** Firebase pour les mises à jour temps réel
- **Filtrage côté client** selon les permissions
- **Tri automatique** par date de création

### Performance
- **Abonnement unique** par conversation
- **Désabonnement automatique** au démontage du composant
- **Filtrage efficace** côté client

## 🐛 Gestion d'Erreurs

### Messages d'erreur

- **"Seuls les participants peuvent envoyer des messages"**
- **"Vous avez déjà signalé ce message"**
- **"Seul l'organisateur peut modérer les messages"**
- **"Message introuvable"**

### Fallbacks

- **Loading states** pendant les opérations
- **Retry automatique** sur les erreurs réseau
- **Messages informatifs** pour l'utilisateur

## 🛠️ Personnalisation

### Styles

Modifiez les classes Tailwind CSS dans `MessageSection.tsx` :

```tsx
// Couleurs des messages
className={`p-4 rounded-lg ${
  message.status === 'hidden'
    ? 'bg-red-50 border-2 border-red-200'  // Messages masqués
    : message.userId === user?.uid
    ? 'bg-blue-50 ml-8'                    // Mes messages
    : 'bg-gray-50 mr-8'                    // Autres messages
}`}
```

### Textes

Tous les textes sont facilement modifiables dans le composant :

- Messages d'erreur
- Placeholders
- Labels des boutons
- Texte du modal de signalement

## 📋 Checklist d'Intégration

- [ ] Firebase initialisé avec Firestore et Auth
- [ ] Collections Firestore configurées
- [ ] Composants UI disponibles (Card, Button, Badge)
- [ ] Email de signalement configuré
- [ ] Hook useAuth fonctionnel
- [ ] Types Event compatibles avec votre structure
- [ ] Permissions testées (organisateur vs participant)

## 🔒 Sécurité

### Bonnes pratiques

1. **Validation côté serveur** - Vérifiez toujours les permissions côté Firebase
2. **Règles Firestore** - Configurez des règles de sécurité strictes
3. **Sanitisation** - Échappez le contenu des messages
4. **Rate limiting** - Limitez le nombre de messages par utilisateur

### Règles Firestore recommandées

```javascript
// Règles de sécurité Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /event_messages/{messageId} {
      allow read: if resource.data.eventId in getUserEventAccess();
      allow create: if isEventParticipant(resource.data.eventId);
      allow update, delete: if isMessageAuthorOrOrganizer(resource);
    }
  }
}
```

## 📚 Support

Pour toute question ou problème :
1. Vérifiez la configuration Firebase
2. Consultez les logs de la console
3. Testez les permissions avec différents rôles
4. Vérifiez la structure des données

## 📄 License

MIT - Utilisez librement ce package dans vos projets commerciaux ou personnels.

---

**Note** : Ce package est basé sur un système de messagerie éprouvé en production. Adaptez-le selon vos besoins spécifiques.