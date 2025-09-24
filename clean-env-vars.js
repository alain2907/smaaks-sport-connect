#!/usr/bin/env node

/**
 * Script pour nettoyer les variables d'environnement Firebase
 * Supprime les caractères invisibles qui causent des erreurs OAuth
 */

const fs = require('fs');

console.log('🧹 Nettoyage des variables d\'environnement Firebase...\n');

// Variables à nettoyer
const envVars = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': 'AIzaSyDchDtEb58CLaFDp7wqu4edVAqNWu-r00M',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'smaaks-1.firebaseapp.com',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'smaaks-1',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'smaaks-1.firebasestorage.app',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': '1042129418067',
  'NEXT_PUBLIC_FIREBASE_APP_ID': '1:1042129418067:web:5d00fd62f1f2e69fa893a6',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': 'G-7LKZ2TQ9JQ',
  'NEXT_PUBLIC_FIREBASE_VAPID_KEY': 'BFw1xQ1f_6IA9k9nU85jdLkDLMKCTofqoqs89RN_uDEPNnnRnyYlrAduaIzBNTyMa81khKV1VBll9h2jkF4esZA'
};

console.log('📋 Variables nettoyées pour Vercel:\n');

Object.entries(envVars).forEach(([key, value]) => {
  // Nettoyer la valeur de tout caractère invisible
  const cleanValue = value.trim().replace(/[\r\n\t]/g, '');

  console.log(`${key}=${cleanValue}`);

  // Vérifier les caractères suspects
  if (value !== cleanValue) {
    console.log(`   ⚠️  Caractères invisibles supprimés!`);
  }
});

console.log('\n🔧 Instructions:');
console.log('1. Copiez chaque ligne ci-dessus');
console.log('2. Allez sur https://vercel.com/[account]/smaaks-sport-connect/settings/environment-variables');
console.log('3. Supprimez les anciennes variables');
console.log('4. Ajoutez les nouvelles variables nettoyées');
console.log('5. Redéployez l\'application');

console.log('\n⚠️  ATTENTION: Vérifiez spécialement NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
console.log('   Il doit être exactement: smaaks-1.firebaseapp.com');
console.log('   Sans caractères invisibles \\n ou \\r');

// Générer un fichier pour Vercel CLI
const vercelEnvContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value.trim()}`)
  .join('\n');

fs.writeFileSync('vercel-env-clean.txt', vercelEnvContent);
console.log('\n📄 Fichier généré: vercel-env-clean.txt');