# 📋 Checklist de Déploiement - SMAAKS Sport Connect

## 🚀 Avant chaque déploiement

### ✅ Vérifications automatiques (dans deploy.sh)

Le script `deploy.sh` vérifie automatiquement :

1. **Bon dossier de projet** ✓
2. **Bon package.json** ✓
3. **Projet Vercel correct** ✓
4. **Erreurs ESLint courantes** ⚠️
5. **Build local** ✓

### 📝 Vérifications manuelles obligatoires

Avant de lancer `./deploy.sh`, vérifiez manuellement :

#### 1. 🔤 Caractères échappés
- [ ] Tous les apostrophes sont échappés : `l'événement` → `l&apos;événement`
- [ ] Guillemets doubles dans les JSX sont corrects

#### 2. 🐛 Gestion d'erreurs
- [ ] Variables `error` inutilisées : `} catch (error) {` → `} catch {`
- [ ] Pas de `console.error()` avec variables inutilisées

#### 3. ⚛️ Hooks React
- [ ] Dépendances `useEffect` complètes et correctes
- [ ] `useCallback` avec bonnes dépendances (pas `db` ou variables statiques)
- [ ] Pas de variables utilisées avant déclaration

#### 4. 📦 Imports/Exports
- [ ] Suppression des imports inutilisés
- [ ] Tous les composants utilisés sont importés

#### 5. 🔧 Build et tests
- [ ] `npm run build` fonctionne localement
- [ ] `npm run lint` sans erreurs
- [ ] Pas d'erreurs TypeScript

#### 6. 🔐 Sécurité
- [ ] Pas de variables d'environnement exposées
- [ ] Pas de console.log avec données sensibles
- [ ] Clés API Firebase cachées

#### 7. 🌐 Configuration Vercel
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Domaine personnalisé configuré (si nécessaire)

## 🔄 Erreurs courantes ESLint

### React/JSX
```bash
# ❌ Erreur
'l'événement'

# ✅ Correct
'l&apos;événement'
```

### Gestion d'erreurs
```javascript
// ❌ Erreur
} catch (error) {
  setError('Message');
}

// ✅ Correct
} catch {
  setError('Message');
}
```

### Hooks dependencies
```javascript
// ❌ Erreur
useCallback(async () => {
  // fonction
}, [user, db]); // db ne devrait pas être une dépendance

// ✅ Correct
useCallback(async () => {
  // fonction
}, [user]);
```

## 🛠️ Commandes de débogage

```bash
# Voir les erreurs de build détaillées
npm run build

# Vérifier ESLint
npm run lint

# Tester localement
npm run dev

# Déployer avec vérifications
./deploy.sh
```

## 📞 En cas de problème

1. **Build échoue** : Vérifier les erreurs TypeScript/ESLint
2. **Erreurs 404** : Vérifier les routes et la configuration Vercel
3. **Erreurs Firebase** : Vérifier les variables d'environnement
4. **Erreurs de style** : Vérifier Tailwind et les imports CSS

## 🎯 Objectif

**Zéro répétition d'erreurs !** Ce checklist évite de perdre du temps avec les mêmes erreurs ESLint à chaque déploiement.

---

💡 **Astuce** : Gardez ce fichier ouvert pendant le développement pour référence rapide.