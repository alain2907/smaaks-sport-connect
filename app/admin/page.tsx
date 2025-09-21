'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Group } from '@/types/models';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalGroups: number;
  pendingRequests: number;
  totalPosts: number;
  totalReports: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGroups: 0,
    pendingRequests: 0,
    totalPosts: 0,
    totalReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get Firebase ID token
        const idToken = await user.getIdToken();

        // Call admin API with authorization header
        const response = await fetch('/api/admin/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur de vérification admin');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (data.isAdmin) {
          setIsAdmin(true);
          setStats({
            totalUsers: data.stats.totalUsers,
            totalGroups: data.stats.totalGroups,
            pendingRequests: data.stats.pendingRequests,
            totalPosts: data.stats.totalPosts,
            totalReports: data.stats.totalReports
          });
        } else {
          setIsAdmin(false);
          setError('Accès refusé - Rôle admin requis');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification admin:', error);
        setError('Erreur de connexion');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [user]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen smaaks-bg-light flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen smaaks-bg-light flex items-center justify-center">
          <div className="text-center">
            <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
            <p className="text-gray-600 mb-6">
              {error || "Vous n'avez pas les permissions nécessaires pour accéder au tableau de bord administrateur."}
            </p>
            <Link
              href="/dashboard"
              className="smaaks-btn-primary"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen smaaks-bg-light">
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold smaaks-text-primary mb-2">
              Tableau de bord administrateur
            </h1>
            <p className="text-gray-600">
              Vue d&apos;ensemble des statistiques de l&apos;application et de la plateforme
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Groups */}
            <div className="smaaks-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Groupes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalGroups}</p>
                </div>
              </div>
            </div>

            {/* Total Members */}
            <div className="smaaks-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            {/* Total Posts */}
            <div className="smaaks-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Publications</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="smaaks-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Platform Overview */}
            <div className="smaaks-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vue d&apos;ensemble de la plateforme</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Utilisateurs totaux</span>
                  <span className="font-semibold text-blue-600">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Groupes totaux</span>
                  <span className="font-semibold text-green-600">{stats.totalGroups}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posts totaux</span>
                  <span className="font-semibold text-purple-600">{stats.totalPosts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Signalements</span>
                  <span className="font-semibold text-red-600">{stats.totalReports}</span>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="smaaks-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions administrateur</h3>
              <div className="space-y-3">
                <Link
                  href="/groups"
                  className="smaaks-btn-primary w-full text-center"
                >
                  Voir tous les groupes
                </Link>
                <button
                  className="smaaks-btn-secondary w-full text-center opacity-50 cursor-not-allowed"
                  disabled
                >
                  Gérer les signalements (TODO)
                </button>
                <button
                  className="smaaks-btn-secondary w-full text-center opacity-50 cursor-not-allowed"
                  disabled
                >
                  Modération des contenus (TODO)
                </button>
              </div>
            </div>
          </div>

        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}