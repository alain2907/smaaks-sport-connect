#!/bin/bash

# Configuration spécifique à CE projet
PROJECT_NAME="smaaks-sport-connect"
EXPECTED_DIR="smaaks-sport-connect"

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérification 1: Bon dossier ?
CURRENT_DIR=$(basename "$PWD")
if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
    echo -e "${RED}❌ ERREUR: Vous n'êtes pas dans le bon dossier!${NC}"
    echo -e "   Dossier actuel: ${YELLOW}$CURRENT_DIR${NC}"
    echo -e "   Dossier attendu: ${GREEN}$EXPECTED_DIR${NC}"
    exit 1
fi

# Vérification 2: Bon package.json ?
if ! grep -q "$PROJECT_NAME" package.json; then
    echo -e "${RED}❌ ERREUR: Le package.json ne correspond pas au projet $PROJECT_NAME${NC}"
    exit 1
fi

# Vérification 3: Bon projet Vercel ?
echo -e "${YELLOW}📋 Vérification du projet Vercel...${NC}"

# Vérifier le projet lié
if [ -f ".vercel/project.json" ]; then
    # Récupérer le nom du projet depuis vercel ls
    VERCEL_OUTPUT=$(vercel ls 2>&1 | grep -A1 "Retrieving project")
    VERCEL_NAME=$(echo "$VERCEL_OUTPUT" | grep "/" | sed -n 's/.*\/\([^ ]*\).*/\1/p')

    if [ -z "$VERCEL_NAME" ]; then
        # Fallback: essayer une autre méthode
        VERCEL_NAME=$(vercel ls 2>&1 | grep "smaaks-sport-connect" | head -1)
    fi

    if [[ "$VERCEL_NAME" == *"smaaks-sport-connect"* ]]; then
        echo -e "${GREEN}✅ Projet Vercel vérifié: smaaks-sport-connect${NC}"
    else
        echo -e "${RED}❌ ERREUR: Le projet Vercel ne correspond pas à smaaks-sport-connect!${NC}"
        echo -e "${YELLOW}Utilisez 'vercel link' pour lier le bon projet${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Aucun projet Vercel lié. Utilisez 'vercel link' d'abord${NC}"
    exit 1
fi

vercel ls | head -n 5

echo ""
read -p "⚠️  Confirmez le déploiement de $PROJECT_NAME (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo -e "${RED}❌ Déploiement annulé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Déploiement de $PROJECT_NAME...${NC}"

# ==============================================================================
# 📋 VALIDATION COMPLÈTE AVEC validate.sh
# ==============================================================================
echo -e "${YELLOW}📋 Lancement de la validation complète...${NC}"
echo ""

# Exécuter validate.sh pour tout vérifier d'un coup
if [ -f "./validate.sh" ]; then
    echo -e "${YELLOW}🔍 Exécution de validate.sh...${NC}"
    if ./validate.sh; then
        echo -e "${GREEN}✅ Toutes les validations ont réussi !${NC}"
    else
        echo -e "${RED}❌ La validation a échoué${NC}"
        echo -e "${YELLOW}💡 Corrigez les erreurs ci-dessus avant de déployer${NC}"
        read -p "Voulez-vous continuer malgré tout? (oui/non): " force_deploy
        if [ "$force_deploy" != "oui" ]; then
            echo -e "${RED}❌ Déploiement annulé${NC}"
            exit 1
        fi
    fi
else
    # Fallback si validate.sh n'existe pas
    echo -e "${YELLOW}⚠️  validate.sh introuvable, vérifications basiques...${NC}"
    echo -e "${YELLOW}   📝 Vérification des erreurs ESLint courantes...${NC}"

ESLINT_ERRORS=0

# Chercher les apostrophes non échappées
if grep -r "l'" src/ --include="*.tsx" --include="*.ts" | grep -v "l&apos;" | grep -v "l\'" > /dev/null 2>&1; then
    echo -e "${RED}   ❌ Apostrophes non échappées trouvées (remplacer ' par &apos;)${NC}"
    ESLINT_ERRORS=1
fi

# Chercher les variables error inutilisées dans catch
if grep -r "} catch (error) {" src/ --include="*.tsx" --include="*.ts" > /dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️  Variables 'error' potentiellement inutilisées dans catch blocks${NC}"
    echo -e "${YELLOW}      Remplacer par '} catch {' si la variable n'est pas utilisée${NC}"
fi

# Chercher les dépendances manquantes dans useEffect/useCallback
if grep -r "useEffect\|useCallback" src/ --include="*.tsx" --include="*.ts" | grep -A5 -B5 "user\|db" | grep -v "dependencies" > /dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️  Vérifier les dépendances des hooks (useEffect/useCallback)${NC}"
fi

# Chercher les imports inutilisés
echo -e "${YELLOW}   🔍 Recherche des imports potentiellement inutilisés...${NC}"

# Vérification 5: Build de test
echo -e "${YELLOW}   🔨 Test de build local...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Build local réussi${NC}"
else
    echo -e "${RED}   ❌ Build local échoué - vérifiez les erreurs TypeScript/ESLint${NC}"
    echo -e "${YELLOW}   💡 Commandes de débogage:${NC}"
    echo -e "${YELLOW}      - npm run build (voir les erreurs détaillées)${NC}"
    echo -e "${YELLOW}      - npm run lint (vérifier ESLint)${NC}"
    echo -e "${YELLOW}      - npm run typecheck (si disponible)${NC}"
    ESLINT_ERRORS=1
fi

echo ""
echo -e "${YELLOW}📋 TODO Manuel avant déploiement:${NC}"
echo -e "${YELLOW}☐ 1. Tous les apostrophes sont échappés avec &apos;${NC}"
echo -e "${YELLOW}☐ 2. Variables 'error' inutilisées remplacées par 'catch {'${NC}"
echo -e "${YELLOW}☐ 3. Dépendances useEffect/useCallback correctes${NC}"
echo -e "${YELLOW}☐ 4. Imports inutilisés supprimés${NC}"
echo -e "${YELLOW}☐ 5. Build local fonctionne (npm run build)${NC}"
echo -e "${YELLOW}☐ 6. Tests passent (si disponibles)${NC}"
echo -e "${YELLOW}☐ 7. Variables d'environnement configurées${NC}"
echo -e "${YELLOW}☐ 8. Pas de console.log sensibles${NC}"
echo ""

fi # Fermer le if [ -f "./validate.sh" ]

if [ $ESLINT_ERRORS -eq 1 ]; then
    echo -e "${RED}❌ Des problèmes ont été détectés!${NC}"
    echo -e "${YELLOW}💡 Corrigez les problèmes ci-dessus avant de déployer${NC}"
    read -p "Voulez-vous continuer malgré tout? (oui/non): " force_deploy
    if [ "$force_deploy" != "oui" ]; then
        echo -e "${RED}❌ Déploiement annulé${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🚀 Lancement du déploiement Vercel...${NC}"
vercel --prod