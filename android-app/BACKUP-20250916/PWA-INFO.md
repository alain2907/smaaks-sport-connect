# SMAAKS Groups - PWA Backup Info
## 16 Septembre 2025

### 🌐 PWA Déployé
- **URL Production**: https://smaaks-groups.vercel.app
- **Plateforme**: Vercel
- **Framework**: Next.js 15.5.3 avec App Router
- **Base de données**: Firebase Firestore

### 📱 Configuration PWA

#### Manifest (public/manifest.json)
```json
{
  "name": "SMAAKS Groups",
  "short_name": "SMAAKS Groups",
  "theme_color": "#5A2D82",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [192x192, 512x512]
}
```

#### Service Worker
- **Stratégie**: Network First avec cache fallback
- **Cache**: Images, fonts, assets statiques
- **Offline**: Page offline personnalisée

### 🔔 Fonctionnalités PWA
- ✅ Installation native (Add to Home Screen)
- ✅ Mode standalone
- ✅ Icônes adaptatives
- ✅ Splash screen
- ✅ Thème violet SMAAKS (#5A2D82)
- ✅ Support offline basique
- ⏳ Notifications push (préparées, pas activées)

### 📲 Installation PWA

#### Sur Android Chrome
1. Ouvrir https://smaaks-groups.vercel.app
2. Menu ⋮ → "Installer l'application"
3. Ou attendre la popup automatique (2 secondes)

#### Sur iOS Safari
1. Ouvrir https://smaaks-groups.vercel.app
2. Tap Partager → "Sur l'écran d'accueil"

#### Sur Desktop
- Chrome/Edge: Icône d'installation dans la barre d'adresse
- Ou Menu → "Installer SMAAKS Groups..."

### 🎨 Composant PWAInstallPrompt
- **Délai**: 2 secondes après chargement
- **Browser Detection**: Messages spécifiques par navigateur
- **Chrome Recommendation**: Suggère Chrome pour meilleure expérience
- **Auto-dismiss**: Se ferme après installation

### 📊 Métriques PWA
- Lighthouse PWA Score: ~90+
- Installation possible: ✅
- HTTPS: ✅
- Service Worker: ✅
- Manifest valide: ✅
- Icônes requises: ✅

### 🔄 Scripts NPM
```bash
npm run dev      # Dev server localhost:3000
npm run build    # Build production
npm run start    # Start production
npm run lint     # ESLint
npm run fix      # Auto-fix lint
```

### 📁 Structure PWA
```
public/
├── manifest.json           # PWA manifest
├── sw.js                  # Service Worker
├── offline.html           # Page offline
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
└── images/
    └── logo.png

components/
├── PWAInstallPrompt.tsx  # Composant d'invitation
└── ClientLayout.tsx       # Layout avec PWA

app/
├── layout.tsx            # Layout principal avec meta PWA
└── page.tsx              # Page d'accueil
```

### 🚀 Déploiement Vercel
- **Auto-deploy**: Push sur main branch
- **Preview**: Chaque PR génère un preview
- **Domaine**: smaaks-groups.vercel.app
- **SSL**: Automatique

### 🔗 Liens Importants
- **Production**: https://smaaks-groups.vercel.app
- **Repository**: (privé)
- **Vercel Dashboard**: https://vercel.com/dashboard

### 📝 Notes
- Le PWA et l'APK Android partagent la même URL
- L'APK est un TWA (Trusted Web Activity) qui encapsule le PWA
- Les deux peuvent coexister sur le même appareil
- Package ID APK: `com.smaaks.groups1` (évite conflit avec SMAAKS Match)

---
**Backup créé le 16 Septembre 2025**