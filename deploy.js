#!/usr/bin/env node

/**
 * Script de déploiement sécurisé SMAAKS Sport Connect
 * Usage: node deploy.js [--force] [--skip-checks]
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_NAME = 'smaaks-sport-connect';
const EXPECTED_DIR = 'smaaks-sport-connect';

// Couleurs pour le terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Arguments en ligne de commande
const args = process.argv.slice(2);
const force = args.includes('--force');
const skipChecks = args.includes('--skip-checks');

/**
 * Vérifications de base
 */
function basicChecks() {
  log('yellow', '📋 Vérifications de base...\n');

  // 1. Vérifier le dossier
  const currentDir = path.basename(process.cwd());
  if (currentDir !== EXPECTED_DIR) {
    log('red', `❌ ERREUR: Mauvais dossier!`);
    log('yellow', `   Actuel: ${currentDir}`);
    log('green', `   Attendu: ${EXPECTED_DIR}`);
    process.exit(1);
  }
  log('green', '✅ Bon dossier de projet');

  // 2. Vérifier package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.name.includes(PROJECT_NAME)) {
      log('red', `❌ ERREUR: package.json ne correspond pas au projet ${PROJECT_NAME}`);
      process.exit(1);
    }
    log('green', '✅ package.json correct');
  } catch (error) {
    log('red', '❌ ERREUR: Impossible de lire package.json');
    process.exit(1);
  }

  // 3. Vérifier projet Vercel
  if (!fs.existsSync('.vercel/project.json')) {
    log('red', '❌ ERREUR: Aucun projet Vercel lié');
    log('yellow', '💡 Utilisez "vercel link" d\'abord');
    process.exit(1);
  }
  log('green', '✅ Projet Vercel lié');
}

/**
 * Vérifications ESLint avancées
 */
function eslintChecks() {
  log('yellow', '📝 Vérifications ESLint avancées...\n');

  let errors = 0;
  const srcPath = path.join(process.cwd(), 'src');

  // Chercher les apostrophes non échappées
  try {
    execSync(`grep -r "l'" ${srcPath} --include="*.tsx" --include="*.ts" | grep -v "l&apos;" | grep -v "l\\\'"`, { stdio: 'pipe' });
    log('red', '❌ Apostrophes non échappées trouvées (remplacer \' par &apos;)');
    errors++;
  } catch {
    log('green', '✅ Apostrophes correctement échappées');
  }

  // Chercher les variables error inutilisées
  try {
    const result = execSync(`grep -r "} catch (error) {" ${srcPath} --include="*.tsx" --include="*.ts"`, { encoding: 'utf8' });
    const count = result.trim().split('\n').length;
    if (count > 0) {
      log('yellow', `⚠️  ${count} variables 'error' potentiellement inutilisées`);
      console.log(result);
    }
  } catch {
    log('green', '✅ Pas de variables error inutilisées');
  }

  // Test de build
  log('yellow', '🔨 Test de build local...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    log('green', '✅ Build local réussi');
  } catch (error) {
    log('red', '❌ Build local échoué');
    log('yellow', '💡 Commandes de débogage:');
    log('yellow', '   - npm run build (voir erreurs détaillées)');
    log('yellow', '   - npm run lint (vérifier ESLint)');
    errors++;
  }

  return errors;
}

/**
 * Vérifications Firebase/OAuth
 */
function firebaseChecks() {
  log('yellow', '🔥 Vérifications Firebase...\n');

  // Vérifier .env.local
  if (!fs.existsSync('.env.local')) {
    log('red', '❌ Fichier .env.local manquant');
    return 1;
  }

  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];

  let missing = 0;
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      log('red', `❌ Variable manquante: ${varName}`);
      missing++;
    }
  });

  if (missing === 0) {
    log('green', '✅ Variables Firebase configurées');
  }

  return missing;
}

/**
 * Afficher la checklist manuelle
 */
function showManualChecklist() {
  log('yellow', '\n📋 Checklist manuelle:\n');

  const checklist = [
    'Firebase Console → Authentication → Sign-in method → Google activé',
    'Firebase Console → Authorized domains configurés (pas de *.vercel.app)',
    'Google Cloud Console → OAuth 2.0 Client ID configuré',
    'Variables d\'environnement Vercel configurées',
    'Tests manuels effectués sur production',
    'Domaines de production sécurisés'
  ];

  checklist.forEach((item, index) => {
    log('yellow', `☐ ${index + 1}. ${item}`);
  });

  console.log('');
}

/**
 * Confirmation utilisateur
 */
function getUserConfirmation() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('⚠️  Confirmez le déploiement (oui/non): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'oui');
    });
  });
}

/**
 * Déploiement Vercel
 */
function deploy() {
  log('green', '🚀 Lancement du déploiement Vercel...\n');

  const vercelProcess = spawn('vercel', ['--prod'], {
    stdio: 'inherit',
    shell: true
  });

  vercelProcess.on('close', (code) => {
    if (code === 0) {
      log('green', '\n🎉 Déploiement réussi!');
      log('blue', '🔗 Vérifiez l\'URL de production dans la sortie ci-dessus');
    } else {
      log('red', '\n❌ Déploiement échoué');
      process.exit(code);
    }
  });

  vercelProcess.on('error', (error) => {
    log('red', `❌ Erreur de déploiement: ${error.message}`);
    process.exit(1);
  });
}

/**
 * Fonction principale
 */
async function main() {
  log('blue', '🚀 SMAAKS Sport Connect - Script de Déploiement\n');

  try {
    // Vérifications de base
    basicChecks();

    // Vérifications avancées (sauf si --skip-checks)
    if (!skipChecks) {
      log('yellow', '🔍 Exécution de la validation complète (validate.sh)...\n');

      try {
        // Exécuter validate.sh pour TOUTES les vérifications
        execSync('./validate.sh', { stdio: 'inherit' });
        log('green', '\n✅ Validation complète réussie!\n');
      } catch (error) {
        log('red', '\n❌ La validation a détecté des erreurs!');

        if (!force) {
          log('yellow', '💡 Corrigez les erreurs ci-dessus avant de déployer');
          log('yellow', '   OU utilisez --force pour ignorer les erreurs\n');
          process.exit(1);
        } else {
          log('yellow', '⚠️  Mode --force activé, déploiement malgré les erreurs...\n');
        }
      }

      // Vérifications Firebase spécifiques (pas dans validate.sh)
      const firebaseErrors = firebaseChecks();

      if (firebaseErrors > 0 && !force) {
        log('red', `\n❌ ${firebaseErrors} problème(s) Firebase détecté(s)!`);
        process.exit(1);
      }
    }

    // Checklist manuelle
    showManualChecklist();

    // Confirmation utilisateur (sauf si --force)
    if (!force) {
      const confirmed = await getUserConfirmation();
      if (!confirmed) {
        log('red', '❌ Déploiement annulé');
        process.exit(0);
      }
    }

    // Déploiement
    deploy();

  } catch (error) {
    log('red', `❌ Erreur: ${error.message}`);
    process.exit(1);
  }
}

// Aide
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node deploy.js [options]

Options:
  --force        Ignorer les erreurs et la confirmation
  --skip-checks  Ignorer les vérifications ESLint/Firebase
  --help, -h     Afficher cette aide

Exemples:
  node deploy.js                    # Déploiement normal avec vérifications
  node deploy.js --force            # Déploiement forcé sans confirmation
  node deploy.js --skip-checks      # Ignorer les vérifications avancées
`);
  process.exit(0);
}

// Exécution
main();