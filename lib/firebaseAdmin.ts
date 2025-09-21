import admin from 'firebase-admin';

// Éviter la double initialisation en développement
if (!admin.apps.length) {
  try {
    // Utiliser le fichier JSON directement
    const serviceAccount = require('../smaaks-1-b0b4f542ac45.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export { admin };