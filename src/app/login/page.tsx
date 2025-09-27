'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Fonction de validation de l'email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('L\'adresse email est obligatoire');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Veuillez saisir une adresse email valide');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Fonction de validation du mot de passe
  const validatePassword = (password: string, confirmPassword?: string): boolean => {
    if (!password) {
      setPasswordError('Le mot de passe est obligatoire');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (isSignUp && confirmPassword !== undefined && password !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validation côté client
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password, isSignUp ? confirmPassword : undefined);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('');
        // Automatiquement basculer vers connexion après inscription réussie
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
        setError('🎉 Inscription réussie ! Vous pouvez maintenant vous connecter.');
      } else {
        await signIn(email, password);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Auth error:', error);

      // Messages d'erreur plus explicites selon le type d'erreur Firebase
      if (isSignUp) {
        if (error.code === 'auth/email-already-in-use') {
          setError('Cette adresse email est déjà utilisée. Essayez de vous connecter.');
        } else if (error.code === 'auth/weak-password') {
          setError('Le mot de passe est trop faible. Utilisez au moins 6 caractères.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Adresse email invalide.');
        } else {
          setError('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
      } else {
        if (error.code === 'auth/user-not-found') {
          setError('Aucun compte trouvé avec cette adresse email.');
        } else if (error.code === 'auth/wrong-password') {
          setError('Mot de passe incorrect.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Adresse email invalide.');
        } else if (error.code === 'auth/too-many-requests') {
          setError('Trop de tentatives. Réessayez plus tard.');
        } else {
          setError('Erreur de connexion. Vérifiez vos identifiants.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      setError('Erreur de connexion avec Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            SMAAKS Sport Connect
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`rounded-md p-4 ${
              error.includes('🎉') ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`text-sm ${
                error.includes('🎉') ? 'text-green-800' : 'text-red-800'
              }`}>{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                  emailError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Adresse email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                    passwordError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value, confirmPassword);
                  }}
                  onBlur={() => validatePassword(password, confirmPassword)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`appearance-none relative block w-full px-3 py-2 pr-10 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${
                      passwordError && password !== confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) validatePassword(password, e.target.value);
                    }}
                    onBlur={() => validatePassword(password, confirmPassword)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading
                ? (isSignUp ? 'Inscription...' : 'Connexion...')
                : (isSignUp ? 'S\'inscrire' : 'Se connecter')
              }
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter avec Google'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmailError('');
                setPasswordError('');
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500 underline"
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Pas de compte ? S\'inscrire'
              }
            </button>
          </div>

          {isSignUp && (
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>En vous inscrivant, vous acceptez nos</p>
              <div className="flex justify-center space-x-2">
                <a href="/settings/terms" className="text-indigo-600 hover:text-indigo-500 underline">
                  Conditions d&apos;utilisation
                </a>
                <span>et notre</span>
                <a href="/settings/privacy" className="text-indigo-600 hover:text-indigo-500 underline">
                  Politique de confidentialité
                </a>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
      <Footer />
    </div>
  );
}