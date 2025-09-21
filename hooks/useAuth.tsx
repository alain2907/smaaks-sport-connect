'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  linkWithPopup,
  fetchSignInMethodsForEmail,
  deleteUser
} from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User, UserMode } from '@/types/models';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, avatar?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUserData(userDoc.data() as User);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          setUserData(null);
        }

        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth initialization error:', error);
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, displayName: string, avatar?: any) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(newUser, { displayName });

    // Envoyer l'email de vérification
    await sendEmailVerification(newUser);

    const userData: User = {
      uid: newUser.uid,
      email: email,
      displayName: displayName,
      avatar: avatar,
      profileData: {
        age: 25,
        bio: '',
        lookingFor: [],
        interests: [],
        skills: [],
        languages: ['Français'],
        photos: [],
        preferences: {
          ageRange: { min: 18, max: 99 },
          distance: 50,
          availability: 'flexible',
          preferredMeetingType: 'both'
        }
      },
      matchStats: {
        totalMatches: 0,
        activeChats: 0,
        profileViews: 0,
        lastActive: new Date() as any
      },
      subscriptions: {
        participant: {
          plan: 'freemium',
          status: 'active'
        }
      },
      preferences: {
        notifications: true,
        language: 'fr',
        timezone: 'Europe/Paris',
        defaultMode: 'participant'
      },
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    };

    await setDoc(doc(firestore, 'users', newUser.uid), userData);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const userDoc = await getDoc(doc(firestore, 'users', googleUser.uid));

      if (!userDoc.exists()) {
        const userData: User = {
          uid: googleUser.uid,
          email: googleUser.email!,
          displayName: googleUser.displayName!,
          photoURL: googleUser.photoURL || undefined,
          profileData: {
            age: 25,
            bio: '',
            lookingFor: [],
            interests: [],
            skills: [],
            languages: ['Français'],
            photos: googleUser.photoURL ? [googleUser.photoURL] : [],
            preferences: {
              ageRange: { min: 18, max: 99 },
              distance: 50,
              availability: 'flexible',
              preferredMeetingType: 'both'
            }
          },
          matchStats: {
            totalMatches: 0,
            activeChats: 0,
            profileViews: 0,
            lastActive: new Date() as any
          },
          subscriptions: {
            participant: {
              plan: 'freemium',
              status: 'active'
            }
          },
          preferences: {
            notifications: true,
            language: 'fr',
            timezone: 'Europe/Paris',
            defaultMode: 'participant'
          },
          createdAt: new Date() as any,
          updatedAt: new Date() as any
        };

        await setDoc(doc(firestore, 'users', googleUser.uid), userData);
      }
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        // L'email existe déjà avec une méthode différente (email/password)
        const email = error.customData?.email;
        if (email) {
          // Vérifier les méthodes de connexion existantes
          const methods = await fetchSignInMethodsForEmail(auth, email);
          throw new Error(`Ce compte existe déjà. Connectez-vous avec: ${methods.includes('password') ? 'email/mot de passe' : 'Google'}`);
        }
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    await updateDoc(doc(firestore, 'users', user.uid), {
      ...data,
      updatedAt: new Date()
    });
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in');

    // Supprimer les données utilisateur de Firestore
    await deleteDoc(doc(firestore, 'users', user.uid));

    // Supprimer le compte Firebase Auth
    await deleteUser(user);
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}