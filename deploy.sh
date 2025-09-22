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
vercel --prod