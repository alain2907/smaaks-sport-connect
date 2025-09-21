import { GoogleAuth } from 'google-auth-library';
import { join } from 'path';

// Cache pour le token d'accès
let accessTokenCache: { token: string; expires: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Vérifier si on a un token en cache valide
  if (accessTokenCache && accessTokenCache.expires > Date.now()) {
    return accessTokenCache.token;
  }

  try {
    // Utiliser GoogleAuth avec le service account
    const auth = new GoogleAuth({
      keyFile: join(process.cwd(), 'smaaks-1-b0b4f542ac45.json'),
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error('No access token received');
    }

    // Mettre en cache le token (expire dans 55 minutes)
    accessTokenCache = {
      token: accessToken.token,
      expires: Date.now() + (55 * 60 * 1000),
    };

    return accessToken.token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}