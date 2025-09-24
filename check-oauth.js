#!/usr/bin/env node

// Script de diagnostic OAuth Firebase
// Usage: node check-oauth.js

const https = require('https');

const config = {
  projectId: 'smaaks-1',
  authDomain: 'smaaks-1.firebaseapp.com',
  apiKey: 'AIzaSyDchDtEb58CLaFDp7wqu4edVAqNWu-r00M'
};

console.log('🔍 Diagnostic OAuth Firebase\n');

// 1. Vérifier la configuration Firebase
console.log('📋 Configuration Firebase:');
console.log(`   Project ID: ${config.projectId}`);
console.log(`   Auth Domain: ${config.authDomain}`);
console.log(`   API Key: ${config.apiKey ? 'Configurée' : 'Manquante'}`);
console.log('');

// 2. Vérifier l'API Firebase
console.log('🌐 Test connexion Firebase Auth API...');

const checkFirebaseAuth = () => {
  return new Promise((resolve, reject) => {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${config.apiKey}`;

    const req = https.request(url, { method: 'POST' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, response });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ idToken: 'test' }));
    req.end();
  });
};

// 3. Vérifier la configuration Google Identity
console.log('🔑 Test Google Identity API...');

const checkGoogleIdentity = () => {
  return new Promise((resolve, reject) => {
    const url = 'https://accounts.google.com/.well-known/openid_configuration';

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          resolve({
            issuer: config.issuer,
            authorization_endpoint: config.authorization_endpoint,
            token_endpoint: config.token_endpoint
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// Exécution des tests
(async () => {
  try {
    // Test Firebase
    const firebaseResult = await checkFirebaseAuth();
    if (firebaseResult.status === 400) {
      console.log('   ✅ Firebase Auth API accessible');
    } else {
      console.log(`   ⚠️  Status inattendu: ${firebaseResult.status}`);
    }

    // Test Google
    const googleResult = await checkGoogleIdentity();
    console.log('   ✅ Google Identity API accessible');
    console.log(`   Authorization: ${googleResult.authorization_endpoint}`);

    console.log('\n📋 Actions à vérifier dans Firebase Console:');
    console.log('');
    console.log('1. 🔐 Authentication → Sign-in method → Google:');
    console.log('   ☐ Google est activé');
    console.log('   ☐ Web SDK configuration présente');
    console.log('   ☐ Support email configuré');
    console.log('');
    console.log('2. 🌐 Authentication → Settings → Authorized domains:');
    console.log('   ☐ localhost (pour dev)');
    console.log('   ☐ smaaks-sport-connect-25r6gsjln-alains-projects-9dd030b8.vercel.app');
    console.log('   ❌ PAS de *.vercel.app (sécurité)');
    console.log('');
    console.log('3. 🔧 Google Cloud Console → APIs & Services → Credentials:');
    console.log('   ☐ OAuth 2.0 Client ID configuré');
    console.log('   ☐ Authorized origins includes Firebase domains');
    console.log('   ☐ Authorized redirect URIs correct');
    console.log('');
    console.log('4. 📱 Test sur production:');
    console.log('   URL: https://smaaks-sport-connect-25r6gsjln-alains-projects-9dd030b8.vercel.app');
    console.log('   ☐ Ouvrir DevTools → Console');
    console.log('   ☐ Cliquer "Connexion avec Google"');
    console.log('   ☐ Vérifier les erreurs dans la console');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
})();