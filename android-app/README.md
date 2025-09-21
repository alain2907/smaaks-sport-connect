# SMAAKS Groups - Android App

## 📱 Application Android TWA (Trusted Web Activity)

Cette application Android est une version native de [SMAAKS Groups](https://smaaks-groups.vercel.app), permettant une expérience mobile optimisée avec installation directe sur Android.

## 🚀 Information de Build

### Version Actuelle
- **Version**: 1.2 CLEAN
- **Package ID**: `com.smaaks.groups1`
- **Version Code**: 3
- **APK**: `SMAAKS-Groups-v1.2-CLEAN.apk`
- **AAB**: `app-release.aab` (pour Google Play Store)

### Configuration Technique
- **Min SDK**: 21 (Android 5.0 Lollipop)
- **Target SDK**: 35 (Android 14)
- **Compile SDK**: 36
- **URL TWA**: https://smaaks-groups.vercel.app
- **Keystore Alias**: `smaaks_groups`

## 📦 Fichiers de Distribution

```
android-app/
├── SMAAKS-Groups-v1.2-CLEAN.apk       # APK de production signée
├── app/build/outputs/
│   ├── apk/release/app-release.apk    # APK brute signée
│   └── bundle/release/app-release.aab # Bundle pour Play Store
```

## 🛠️ Build Process

### Prérequis
1. **Java 17** (OBLIGATOIRE - Java 24 ne fonctionnera pas)
2. Android SDK
3. Gradle 8.11.1

### Configuration Java
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
java -version  # Doit afficher version 17.x
```

### Commandes de Build

#### Build Debug (pour tests)
```bash
./gradlew assembleDebug
```

#### Build Release (APK de production)
```bash
./gradlew clean
./gradlew assembleRelease
```

#### Build Bundle (pour Google Play Store)
```bash
./gradlew bundleRelease
```

#### Build Complet (APK + AAB)
```bash
./gradlew clean
./gradlew assembleRelease bundleRelease
```

## 🔐 Signature

L'application est automatiquement signée via `gradle.properties`:
- Keystore: `android.keystore`
- Alias: `smaaks_groups`
- Validité: 27+ ans (jusqu'en ~2052)

## 📲 Installation

### Via APK (Sideloading)
1. Télécharger `SMAAKS-Groups-v1.2-CLEAN.apk`
2. Activer "Sources inconnues" sur Android
3. Ouvrir l'APK pour installer

### Via ADB
```bash
adb install -r SMAAKS-Groups-v1.2-CLEAN.apk
```

### Via Google Play Store
Utiliser le fichier AAB: `app/build/outputs/bundle/release/app-release.aab`

## ✨ Fonctionnalités

### Application Native
- 📱 Installation native sur Android
- 🚀 Lancement rapide depuis l'écran d'accueil
- 📌 Raccourcis d'application (App Shortcuts)
- 🎨 Interface adaptée au mobile
- 🔔 Support des notifications push (préparé)
- 🌐 Mode hors ligne avec page dédiée

### Raccourcis d'Application
1. **Mes Groupes** - Accès direct à `/my-groups`
2. **Créer un Groupe** - Accès direct à `/create-group`

### Thème et Couleurs
- Couleur principale: `#5A2D82` (Violet SMAAKS)
- Navigation: Violet uniforme
- Splash screen: Fond blanc avec logo

## 🐛 Résolution de Problèmes

### L'APK ne s'installe pas
- Vérifier que "Sources inconnues" est activé
- Désinstaller toute version précédente
- S'assurer qu'aucune app avec le même package ID n'est installée

### Conflit avec SMAAKS Match
La version 1.2 utilise le package ID `com.smaaks.groups1` pour éviter tout conflit avec SMAAKS Match (`com.smaaks.match`).

### Erreur de build
- Vérifier que Java 17 est utilisé (pas Java 24)
- Nettoyer le projet: `./gradlew clean`
- Vérifier la présence du keystore dans `app/`

## 📋 Historique des Versions

### v1.2 CLEAN (16 Sept 2025)
- ✅ Nettoyage complet de toutes références à smaaks-match
- ✅ Package Java déplacés vers com.smaaks.groups1
- ✅ URLs corrigées vers smaaks-groups.vercel.app
- ✅ Asset statements mis à jour
- ✅ Aucun conflit avec SMAAKS Match

### v1.1 (16 Sept 2025)
- 🔄 Changement du package ID vers com.smaaks.groups1
- 🐛 Tentative de résolution des conflits d'installation

### v1.0 (16 Sept 2025)
- 🎉 Version initiale
- 📱 TWA de base fonctionnel
- 🎨 Thème violet SMAAKS

## 🔍 Vérification du Package

Pour vérifier le package ID de l'APK:
```bash
# Si aapt est disponible
aapt dump badging SMAAKS-Groups-v1.2-CLEAN.apk | grep package

# Sinon, extraire et vérifier manuellement
unzip -l SMAAKS-Groups-v1.2-CLEAN.apk | grep AndroidManifest
```

## 📝 Notes Importantes

- **NE JAMAIS** changer le keystore après publication sur Play Store
- **TOUJOURS** utiliser Java 17 pour les builds
- **SAUVEGARDER** le keystore dans plusieurs endroits sécurisés
- Les mots de passe sont stockés de manière sécurisée dans gradle.properties

## 🤝 Support

Pour toute question ou problème:
1. Vérifier d'abord cette documentation
2. Consulter KEYSTORE.md pour les détails de signature
3. Contacter l'équipe de développement SMAAKS

---

**SMAAKS Groups** - Réunir, Partager, Évoluer Ensemble 🚀