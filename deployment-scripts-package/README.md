# 🚀 Scripts de Déploiement Next.js

Package réutilisable pour déployer en toute sécurité vos projets Next.js TypeScript avec validation automatique.

## ✨ Fonctionnalités

- 🔍 **Validation automatique** - ESLint, TypeScript, Build
- 🔧 **Corrections automatiques** - Apostrophes, variables inutilisées, erreurs courantes
- 🛡️ **Déploiement sécurisé** - Vérifications multi-niveaux avant déploiement
- ⚡ **Vercel optimisé** - Intégration directe avec Vercel
- 🎨 **Interface colorée** - Terminal friendly avec codes couleur
- 🔄 **Re-validation** - Tests après corrections automatiques

## 📦 Installation

### 1. Copier les fichiers dans votre projet

Copiez les scripts à la racine de votre projet Next.js :

```bash
# Structure à copier dans votre projet
your-project/
├── deploy.js           # Script de déploiement principal
├── validate.sh         # Script de validation et correction
└── package.json        # Votre package.json existant
```

### 2. Configuration

Éditez le fichier `deploy.js` et personnalisez la configuration :

```javascript
const PROJECT_CONFIG = {
  // Nom de votre projet (sera vérifié dans package.json)
  projectName: 'mon-super-projet',
  // Nom du dossier attendu (optionnel)
  expectedDir: 'mon-projet-folder',
  // Variables d'environnement Firebase requises (optionnel)
  requiredEnvVars: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ]
};
```

### 3. Permissions

Rendez les scripts exécutables :

```bash
chmod +x validate.sh
chmod +x deploy.js
```

## 🚀 Utilisation

### Déploiement Standard

```bash
# Déploiement avec toutes les vérifications
node deploy.js
```

Le script va :
1. ✅ Vérifier le dossier et package.json
2. ✅ Vérifier la liaison Vercel
3. ✅ Exécuter validate.sh (corrections automatiques)
4. ✅ Vérifier les variables d'environnement
5. ✅ Afficher la checklist manuelle
6. ✅ Demander confirmation
7. 🚀 Déployer sur Vercel

### Options Avancées

```bash
# Déploiement forcé (ignore erreurs et confirmation)
node deploy.js --force

# Ignorer les vérifications avancées
node deploy.js --skip-checks

# Validation seule (sans déploiement)
./validate.sh

# Aide
node deploy.js --help
```

## 🔧 Validation Automatique

Le script `validate.sh` effectue :

### Vérifications
- **ESLint** - Qualité du code
- **TypeScript** - Vérification des types
- **Build** - Test de compilation

### Corrections Automatiques
- **Apostrophes JSX** - `l'` → `l&apos;`
- **Variables error** - `catch (error) {` → `catch {` (si inutilisée)
- **Types courants** - Corrections TypeScript fréquentes
- **useEffect deps** - Dépendances manquantes

### Re-validation
- Re-test automatique après corrections
- Rapport final avec statut de réussite/échec

## 📋 Checklist de Déploiement

Le script affiche une checklist manuelle :

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Build et tests passent en local
- [ ] Domaines autorisés configurés (si Firebase)
- [ ] OAuth 2.0 Client ID configuré (si Google Auth)
- [ ] Tests manuels effectués
- [ ] Sauvegardes nécessaires effectuées

## 🛠️ Configuration Vercel

### Pré-requis

1. **Installer Vercel CLI** :
```bash
npm i -g vercel
```

2. **Lier votre projet** :
```bash
vercel link
```

3. **Configurer les variables d'environnement** :
```bash
# Via l'interface Vercel ou CLI
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Variables d'environnement**
   - Utilisez uniquement `NEXT_PUBLIC_*` pour le client
   - Gardez les secrets côté serveur

2. **Validation des domaines**
   - Configurez correctement les domaines autorisés
   - Évitez les wildcards en production

3. **Tests**
   - Toujours tester en local avant déploiement
   - Utiliser les environnements de staging

## 🐛 Dépannage

### Erreurs Courantes

**"Mauvais dossier de projet"**
```bash
# Solution : Modifier PROJECT_CONFIG.expectedDir
# ou exécuter depuis le bon dossier
```

**"Aucun projet Vercel lié"**
```bash
vercel link
```

**"Build local échoué"**
```bash
npm run build  # Voir les erreurs détaillées
npm run lint   # Vérifier ESLint
```

**"Variables Firebase manquantes"**
```bash
# Vérifier .env.local et Vercel dashboard
# Configurer les variables d'environnement
```

### Logs de Debug

```bash
# Voir les erreurs ESLint détaillées
npm run lint

# Voir les erreurs TypeScript
npx tsc --noEmit

# Voir les erreurs de build
npm run build
```

## 📝 Personnalisation

### Ajouter des Vérifications

Modifiez `validate.sh` pour ajouter vos propres vérifications :

```bash
# Exemple : Vérification de tests
echo -e "${YELLOW}🧪 Exécution des tests...${NC}"
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Tests: Réussis${NC}"
else
    echo -e "${RED}❌ Tests: Échec${NC}"
    ERRORS=1
fi
```

### Personnaliser les Corrections

Ajoutez vos corrections automatiques dans `validate.sh` :

```bash
# Exemple : Correction personnalisée
find src/ -name "*.tsx" | while read file; do
    if grep -q "ancien_pattern" "$file"; then
        sed -i '' 's/ancien_pattern/nouveau_pattern/g' "$file"
        echo -e "${GREEN}   ✅ Corrigé: $file${NC}"
    fi
done
```

## 🔄 Intégration CI/CD

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Validate
        run: ./validate.sh
      - name: Deploy
        run: node deploy.js --force
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 📚 Compatibilité

- **Next.js** 14+ et 15+
- **Node.js** 16+
- **TypeScript** 4.5+
- **Vercel CLI** dernière version
- **Bash** (macOS/Linux)

## 🤝 Support

Pour toute question :
1. Vérifiez cette documentation
2. Consultez les logs d'erreur
3. Vérifiez la configuration Vercel
4. Testez en mode `--skip-checks` pour isoler les problèmes

## 📄 License

MIT - Utilisez librement ce package dans vos projets commerciaux ou personnels.

---

**Note** : Ces scripts sont des templates de démarrage. Adaptez-les selon vos besoins spécifiques et votre workflow de déploiement.