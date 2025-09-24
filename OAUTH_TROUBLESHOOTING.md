# 🔐 Guide de Résolution OAuth - SMAAKS Sport Connect

## 🚨 Problème Actuel
**Erreur**: "Erreur de connexion avec Google" sur la version déployée
**URL Production**: https://smaaks-sport-connect-25r6gsjln-alains-projects-9dd030b8.vercel.app

## ✅ Configuration à Vérifier

### 1. 🔥 Firebase Console
**URL**: https://console.firebase.google.com/project/smaaks-1

#### A. Authentication → Sign-in method
- [ ] **Google** est activé ✅
- [ ] **Web SDK configuration** présente
- [ ] **Support email** configuré (obligatoire)

#### B. Authentication → Settings → Authorized domains
```
localhost
smaaks-sport-connect-25r6gsjln-alains-projects-9dd030b8.vercel.app
```
**⚠️ SÉCURITÉ**: Ne PAS ajouter `*.vercel.app` !

### 2. 🌐 Google Cloud Console
**URL**: https://console.cloud.google.com/apis/credentials?project=smaaks-1

#### OAuth 2.0 Client ID Configuration:
- [ ] **Authorized JavaScript origins**:
  ```
  https://smaaks-1.firebaseapp.com
  https://smaaks-sport-connect-25r6gsjln-alains-projects-9dd030b8.vercel.app
  ```

- [ ] **Authorized redirect URIs**:
  ```
  https://smaaks-1.firebaseapp.com/__/auth/handler
  ```

### 3. 📱 Variables d'Environnement Vercel
**Vérifier sur**: https://vercel.com/[votre-account]/smaaks-sport-connect/settings/environment-variables

Variables requises:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDchDtEb58CLaFDp7wqu4edVAqNWu-r00M
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=smaaks-1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=smaaks-1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=smaaks-1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1042129418067
NEXT_PUBLIC_FIREBASE_APP_ID=1:1042129418067:web:5d00fd62f1f2e69fa893a6
```

## 🔧 Tests de Diagnostic

### Test 1: Console du Navigateur
1. Ouvrir https://smaaks-sport-connect-25r6gsjln-alains-projects-9dd030b8.vercel.app
2. Ouvrir DevTools (F12) → Console
3. Cliquer "Connexion avec Google"
4. Chercher les erreurs dans la console

### Test 2: Erreurs Courantes
| Erreur | Cause | Solution |
|--------|-------|----------|
| `auth/unauthorized-domain` | Domaine non autorisé | Ajouter l'URL dans Firebase authorized domains |
| `auth/operation-not-allowed` | Google Sign-in désactivé | Activer Google dans Firebase Authentication |
| `auth/popup-closed-by-user` | Utilisateur a fermé popup | Normal, pas d'action |
| `auth/network-request-failed` | Problème réseau/CORS | Vérifier configuration Google Cloud |

## 🎯 Actions Prioritaires

### ⚡ Action Immédiate (5 min)
1. **Firebase Console** → Authentication → Settings → Authorized domains
2. **Ajouter**: `smaaks-sport-connect-25r6gsjln-alains-projects-9dd030b8.vercel.app`
3. **Tester** immédiatement sur production

### 🔧 Configuration Complète (15 min)
1. **Vérifier Google Cloud Console** OAuth configuration
2. **Confirmer** que le support email est configuré
3. **Tester** avec différents comptes Google

### 🔒 Sécurisation (10 min)
1. **Supprimer** tout domaine wildcard (`*.vercel.app`)
2. **Configurer** un domaine personnalisé (optionnel)
3. **Documenter** la configuration finale

## 📞 Support Technique

Si le problème persiste après ces vérifications:

1. **Logs Vercel**: Vérifier les logs de déploiement
2. **Firebase Logs**: Consulter les logs d'authentification
3. **Network Tab**: Analyser les requêtes réseau échouées

## 🎯 Configuration Idéale

```javascript
// Configuration OAuth recommandée
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'  // Force la sélection de compte
});
```

---

**⚡ Étape suivante**: Vérifier Authorization domains dans Firebase Console