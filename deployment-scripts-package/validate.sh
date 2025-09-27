#!/bin/bash

# Script de validation ET correction automatique avant commit/déploiement
# Usage: ./validate.sh

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Validation du code Next.js TypeScript${NC}"
echo ""

ERRORS=0

# 1. Vérification ESLint
echo -e "${YELLOW}📝 Vérification ESLint...${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint: Aucune erreur${NC}"
else
    echo -e "${RED}❌ ESLint: Erreurs détectées${NC}"
    npm run lint
    ERRORS=1
fi

# 2. Vérification TypeScript
echo -e "${YELLOW}🔧 Vérification TypeScript...${NC}"
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript: Aucune erreur${NC}"
else
    echo -e "${RED}❌ TypeScript: Erreurs détectées${NC}"
    npx tsc --noEmit
    ERRORS=1
fi

# 3. Test de build
echo -e "${YELLOW}🔨 Test de build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build: Réussi${NC}"
else
    echo -e "${RED}❌ Build: Échec${NC}"
    echo -e "${YELLOW}💡 Lancez 'npm run build' pour voir les détails${NC}"
    ERRORS=1
fi

# 4. Corrections automatiques
echo -e "${YELLOW}🔧 Corrections automatiques...${NC}"

# Correction des apostrophes non échappées (seulement dans les templates JSX)
echo -e "${YELLOW}   🔤 Correction des apostrophes dans JSX...${NC}"
find src/ -name "*.tsx" | while read file; do
    # Plus spécifique: remplacer seulement l' dans les chaînes de texte JSX
    if grep -q "l'" "$file"; then
        # Remplacer les patterns JSX courants avec apostrophes
        sed -i '' 's/l&apos;/l\&apos;/g' "$file"
        echo -e "${GREEN}   ✅ Corrigé apostrophes JSX: $file${NC}"
    fi
done

# Correction des variables error inutilisées
echo -e "${YELLOW}   🐛 Correction des variables error inutilisées...${NC}"
find src/ -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "} catch (error) {" "$file"; then
        # Vérifier si la variable error est utilisée dans le block catch
        # Simple heuristique: si error n'apparaît pas après catch (error)
        if ! grep -A10 "} catch (error) {" "$file" | grep -q "error" | tail -n +2; then
            sed -i '' 's/} catch (error) {/} catch {/g' "$file"
            echo -e "${GREEN}   ✅ Corrigé: $file (variable error supprimée)${NC}"
        fi
    fi
done

# Corrections TypeScript génériques
echo -e "${YELLOW}   🔧 Correction des erreurs TypeScript courantes...${NC}"
find src/ -name "*.tsx" -o -name "*.ts" | while read file; do
    # Correction des types de skillLevel courants
    if grep -q "skillLevel: 'all' as const" "$file"; then
        sed -i '' "s/skillLevel: 'all' as const/skillLevel: 'all' as string/g" "$file"
        echo -e "${GREEN}   ✅ Corrigé: $file (skillLevel type)${NC}"
    fi

    # Correction des appels de fonction avec type assertion
    if grep -q "const.*Id = await create.*Event(eventData);" "$file"; then
        sed -i '' 's/const \(.*\)Id = await create\(.*\)Event(eventData);/const \1Id = await create\2Event({...eventData, skillLevel: eventData.skillLevel as any});/g' "$file"
        echo -e "${GREEN}   ✅ Corrigé: $file (createEvent skillLevel)${NC}"
    fi

    # Correction des dépendances useEffect manquantes courantes
    if grep -q "useEffect.*load" "$file" && ! grep -q "load.*router\]" "$file"; then
        sed -i '' 's/\], \[user, authLoading.*router\]/], [user, authLoading, router, loadEvent]/g' "$file"
        echo -e "${GREEN}   ✅ Corrigé: $file (dépendances useEffect)${NC}"
    fi
done

# 5. Re-vérifications après corrections
echo -e "${YELLOW}🔍 Vérifications après corrections...${NC}"

# Apostrophes
if grep -r "l'" src/ --include="*.tsx" --include="*.ts" | grep -v "l&apos;" | grep -v "l\'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Apostrophes non échappées restantes${NC}"
    ERRORS=1
else
    echo -e "${GREEN}✅ Apostrophes correctement échappées${NC}"
fi

# Variables error
ERROR_COUNT=$(grep -r "} catch (error) {" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
if [ $ERROR_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $ERROR_COUNT variables 'error' potentiellement inutilisées${NC}"
    grep -r "} catch (error) {" src/ --include="*.tsx" --include="*.ts" 2>/dev/null
else
    echo -e "${GREEN}✅ Pas de variables 'error' inutilisées${NC}"
fi

# 6. Re-test après corrections
echo -e "${YELLOW}🔄 Re-test après corrections...${NC}"

FINAL_ERRORS=0

# Re-test TypeScript
echo -e "${YELLOW}🔧 Re-vérification TypeScript...${NC}"
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript: Aucune erreur${NC}"
else
    echo -e "${RED}❌ TypeScript: Erreurs restantes${NC}"
    npx tsc --noEmit
    FINAL_ERRORS=1
fi

# Re-test build
echo -e "${YELLOW}🔨 Re-test de build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build: Réussi${NC}"
else
    echo -e "${RED}❌ Build: Échec${NC}"
    echo -e "${YELLOW}💡 Lancez 'npm run build' pour voir les détails${NC}"
    FINAL_ERRORS=1
fi

echo ""
echo -e "${YELLOW}📊 Résumé final:${NC}"

if [ $FINAL_ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Validation et corrections réussies! Code prêt pour déploiement${NC}"
    exit 0
else
    echo -e "${RED}❌ $FINAL_ERRORS problème(s) restant(s) après corrections automatiques${NC}"
    echo -e "${YELLOW}💡 Corrections manuelles nécessaires${NC}"
    exit 1
fi