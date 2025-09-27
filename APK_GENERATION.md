# 📱 Génération APK - SMAAKS Sport Connect

Guide pour créer l'APK Android de l'application SMAAKS Sport Connect.

## ✅ Pré-requis Complétés

- [x] **PWA configuré** avec next-pwa
- [x] **Manifest.json optimisé** avec icônes et métadonnées
- [x] **Icônes générées** dans toutes les tailles (72px à 512px)
- [x] **Icon maskable** pour Android
- [x] **Service Worker** activé en production

## 🚀 Méthode 1 : PWA Builder (Recommandée)

### Étape 1 : Déployer l'application

```bash
# 1. Build et déployer l'application
npm run build
./deploy.sh

# 2. Vérifier que l'app est accessible sur votre domaine
# URL : https://your-domain.vercel.app
```

### Étape 2 : Générer l'APK avec PWA Builder

1. **Aller sur PWA Builder** : https://www.pwabuilder.com/

2. **Entrer l'URL de votre app** :
   ```
   https://your-domain.vercel.app
   ```

3. **Analyser l'application** :
   - PWA Builder analysera automatiquement votre manifest.json
   - Vérifiera les icônes et la configuration PWA

4. **Générer l'APK Android** :
   - Cliquer sur "Package For Stores"
   - Sélectionner "Android"
   - Choisir "Trusted Web Activity (TWA)"
   - Configurer les options :
     - **Package ID** : `com.smaaks.sportconnect`
     - **App name** : `SMAAKS Sport Connect`
     - **Launcher name** : `SMAAKS Sport`
     - **Start URL** : `/`

5. **Télécharger l'APK** :
   - PWA Builder générera l'APK
   - Télécharger le fichier `.apk`

## 🔧 Méthode 2 : Android Studio & TWA

### Prérequis

```bash
# Installer Android Studio
# Télécharger : https://developer.android.com/studio

# Installer les outils de build
npm install -g @bubblewrap/cli
```

### Générer l'APK

```bash
# 1. Initialiser le projet TWA
bubblewrap init --manifest https://your-domain.vercel.app/manifest.json

# 2. Configurer le projet
# Suivre les instructions interactives :
# - Package name : com.smaaks.sportconnect
# - App name : SMAAKS Sport Connect
# - Display mode : standalone
# - Orientation : portrait

# 3. Build l'APK
bubblewrap build

# 4. L'APK sera généré dans le dossier app/build/outputs/apk/
```

## 📋 Configuration Optimale

### Manifest.json (✅ Déjà configuré)

```json
{
  "name": "SMAAKS Sport Connect",
  "short_name": "SMAAKS Sport",
  "description": "Plateforme de connexion sportive SMAAKS",
  "theme_color": "#5A2D82",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "lang": "fr",
  "categories": ["sports", "social", "lifestyle"]
}
```

### Icônes Générées (✅ Complété)

```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png (avec purpose: maskable)
└── favicon.png
```

## 🧪 Tests Avant Génération APK

### 1. Tester PWA en Local

```bash
# 1. Build de production
npm run build

# 2. Servir en mode production
npm start

# 3. Ouvrir dans Chrome
# URL : http://localhost:3000

# 4. Ouvrir DevTools > Application > Manifest
# Vérifier que toutes les icônes chargent correctement

# 5. Tester "Install App" dans Chrome
# Menu 3 points > Install SMAAKS Sport Connect
```

### 2. Audit PWA

```bash
# Dans Chrome DevTools
# Lighthouse > Generate report > PWA
# Score cible : 90+ / 100
```

## 📦 Déploiement APK

### Étapes Finales

1. **Tester l'APK** :
   ```bash
   # Installer sur un device Android de test
   adb install app-release.apk

   # Tester toutes les fonctionnalités :
   # - Authentification Google
   # - Navigation
   # - Création d'événements
   # - Messagerie temps réel
   ```

2. **Signer l'APK pour production** :
   ```bash
   # Générer une clé de signature
   keytool -genkey -v -keystore release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

   # Signer l'APK
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore app-release-unsigned.apk my-key-alias

   # Zipalign
   zipalign -v 4 app-release-unsigned.apk app-release.apk
   ```

3. **Publier sur Google Play Store** :
   - Créer un compte développeur Google Play
   - Uploader l'APK signé
   - Remplir les métadonnées
   - Soumettre pour review

## 🔍 Vérifications Importantes

### Checklist Pré-APK

- [ ] **URL HTTPS** : Application accessible en HTTPS
- [ ] **Manifest valide** : Aucune erreur dans DevTools
- [ ] **Service Worker** : Fonctionne en production
- [ ] **Icônes** : Toutes les tailles chargent correctement
- [ ] **OAuth** : Authentification Google fonctionne
- [ ] **Firebase** : Base de données accessible
- [ ] **Responsive** : Interface mobile optimisée

### URLs Importantes

- **App Production** : https://your-domain.vercel.app
- **PWA Builder** : https://www.pwabuilder.com/
- **Google Play Console** : https://play.google.com/console/

## 🚨 Troubleshooting

### Problèmes Courants

1. **Icônes ne chargent pas** :
   ```bash
   # Vérifier les chemins dans manifest.json
   # S'assurer que les fichiers existent dans public/icons/
   ```

2. **PWA non détectée** :
   ```bash
   # Vérifier HTTPS obligatoire
   # Vérifier Service Worker actif
   # Vérifier manifest.json accessible
   ```

3. **APK ne s'installe pas** :
   ```bash
   # Activer "Sources inconnues" sur Android
   # Vérifier signature APK
   ```

---

**Status Actuel** : ✅ Prêt pour génération APK avec PWA Builder !

L'application est maintenant configurée pour générer l'APK Android. Suivez la **Méthode 1** avec PWA Builder pour le processus le plus simple.