'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth not initialized');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase auth not initialized');

    try {
      console.log('🔍 Tentative de connexion Google...');
      const provider = new GoogleAuthProvider();

      // Configuration pour forcer la sélection de compte
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('🔧 Provider configuré:', provider);
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Connexion Google réussie:', result.user.email);

    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string; stack?: string };
      console.error('❌ Erreur Google Sign-in:', error);
      console.error('📋 Code erreur:', firebaseError.code);
      console.error('📋 Message:', firebaseError.message);
      console.error('📋 Stack:', firebaseError.stack);

      // Messages d'erreur plus explicites
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        throw new Error('Connexion annulée par l\'utilisateur');
      } else if (firebaseError.code === 'auth/unauthorized-domain') {
        throw new Error('Domaine non autorisé. Vérifiez la configuration Firebase.');
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        throw new Error('Authentification Google non activée dans Firebase.');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        throw new Error('Popup bloquée par le navigateur. Autorisez les popups.');
      } else if (firebaseError.code === 'auth/cancelled-popup-request') {
        throw new Error('Requête popup annulée.');
      } else {
        throw new Error(`Erreur de connexion Google: ${firebaseError.message || 'Erreur inconnue'} (${firebaseError.code || 'no-code'})`);
      }
    }
  };

  const logout = async () => {
    if (!auth) throw new Error('Firebase auth not initialized');
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}