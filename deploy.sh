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
vercel ls | head -n 5

echo ""
read -p "⚠️  Confirmez le déploiement de $PROJECT_NAME (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo -e "${RED}❌ Déploiement annulé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Déploiement de $PROJECT_NAME...${NC}"
vercel --prod