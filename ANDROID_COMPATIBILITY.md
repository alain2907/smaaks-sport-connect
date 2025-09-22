# Android Compatibility Guidelines - SMAAKS Sport Connect

## 📱 Compatibilité Android 15+ et Edge-to-Edge

### Problématiques identifiées sur d'autres apps SMAAKS

Les recommandations suivantes sont basées sur les problèmes détectés sur d'autres applications du portfolio SMAAKS et doivent être évitées dans Sport Connect.

---

## 🚨 Android 15 - Affichage Edge-to-Edge (SDK 35)

### Problème
À partir d'Android 15, les applications ciblant le SDK 35 proposent par défaut l'affichage de bord à bord. Les applications doivent gérer les encarts (insets) pour s'assurer qu'elles s'affichent correctement.

### ❌ APIs obsolètes à éviter
Ces APIs sont devenues obsolètes dans Android 15 :
```javascript
// À NE PAS utiliser dans notre PWA
android.view.Window.setNavigationBarColor
android.view.Window.setStatusBarColor
android.view.Window.getStatusBarColor
```

### ✅ Solutions recommandées pour PWA

#### 1. Configuration du manifest.json
```json
{
  "display": "standalone",
  "theme_color": "#5A2D82",
  "background_color": "#ffffff",
  "viewport_fit": "cover"
}
```

#### 2. CSS pour gérer les safe areas
```css
/* Dans globals.css */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
}

.safe-area {
  padding-top: var(--safe-area-inset-top);
  padding-right: var(--safe-area-inset-right);
  padding-bottom: var(--safe-area-inset-bottom);
  padding-left: var(--safe-area-inset-left);
}

/* Pour les éléments en position fixe */
.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: calc(1rem + var(--safe-area-inset-top));
}

.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: calc(1rem + var(--safe-area-inset-bottom));
}
```

#### 3. Meta tags pour viewport
```html
<!-- Dans layout.tsx -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

## 📱 Android 16 - Restrictions de redimensionnement

### Problème
À partir d'Android 16, Android ignore les restrictions de redimensionnement et d'orientation pour les appareils à grand écran (pliables, tablettes).

### ❌ Restrictions à éviter
```javascript
// À NE PAS faire dans les activités Android
setRequestedOrientation(SCREEN_ORIENTATION_PORTRAIT); // Portrait forcé
android:resizeableActivity="false" // Redimensionnement bloqué
```

### ✅ Solutions responsive pour PWA

#### 1. CSS responsive design
```css
/* Design adaptatif par taille d'écran */
@media (max-width: 640px) {
  /* Mobile portrait */
  .container { padding: 1rem; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  /* Tablette / Mobile landscape */
  .container {
    padding: 2rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

@media (min-width: 1025px) {
  /* Desktop / Tablette large */
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Gestion des écrans pliables */
@media (max-width: 768px) and (orientation: landscape) {
  .bottom-tabs {
    flex-direction: row;
    height: 60px;
  }
}
```

#### 2. Composants adaptatifs React
```typescript
// Hook pour détecter la taille d'écran
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState('mobile');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) setScreenSize('desktop');
      else if (window.innerWidth >= 641) setScreenSize('tablet');
      else setScreenSize('mobile');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};
```

---

## 🧪 Tests recommandés

### 1. Tests sur différentes tailles d'écran
- [ ] Mobile portrait (375px)
- [ ] Mobile landscape (667px)
- [ ] Tablette portrait (768px)
- [ ] Tablette landscape (1024px)
- [ ] Desktop (1200px+)
- [ ] Écrans pliables (différents ratios)

### 2. Tests PWA spécifiques
- [ ] Installation PWA
- [ ] Mode standalone
- [ ] Gestion des safe areas
- [ ] Navigation avec encarts
- [ ] Rotation d'écran

### 3. Outils de test
```bash
# Chrome DevTools - Device simulation
# Responsive design mode
# PWA audit avec Lighthouse
npm run build && npx lighthouse http://localhost:3000 --view
```

---

## 📋 Checklist implémentation

### Phase 1 - Configuration de base
- [ ] Ajouter viewport-fit=cover au manifest
- [ ] Configurer les CSS safe areas
- [ ] Tester sur Chrome DevTools

### Phase 2 - Responsive design
- [ ] Implémenter les breakpoints CSS
- [ ] Créer le hook useScreenSize
- [ ] Adapter les composants navigation

### Phase 3 - Tests et validation
- [ ] Tester sur différents appareils
- [ ] Valider avec Lighthouse PWA
- [ ] Documenter les cas limites

---

## 💡 Bonnes pratiques

1. **Toujours tester en mode PWA standalone**
2. **Éviter les hauteurs/largeurs fixes** → utiliser min/max
3. **Privilégier Flexbox/Grid** pour les layouts adaptatifs
4. **Tester sur vrais appareils** quand possible
5. **Documenter les breakpoints** dans le design system

---

*Ce document sera mis à jour selon les évolutions d'Android et les retours d'expérience.*