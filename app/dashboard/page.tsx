'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Group, MembershipRequest } from '@/types/models';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: string;
    status: string;
    groupName: string;
    groupId: string;
    timestamp: Date;
    rejectionReason?: string;
  }>>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fonction pour fermer le popup (utilisée par les boutons et le timer)
  const closeWelcomePopup = () => {
    setShowWelcome(false);
  };

  // Fonction pour debug - reset le sessionStorage (triple-click sur le titre)
  const handleTitleClick = (e: React.MouseEvent) => {
    if (e.detail === 3) { // triple-click
      sessionStorage.removeItem('hasSeenWelcome');
      window.location.reload();
    }
  };

  useEffect(() => {
    if (user) {
      // Vérifier si c'est la première connexion depuis le login
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');

        // Timer automatique de 5 secondes (plus long pour laisser le temps de lire)
        const timer = setTimeout(() => {
          closeWelcomePopup();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Fetch user groups
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) return;

      try {
        // Query for groups where user is organizer
        const organizerQuery = query(
          collection(db, 'groups'),
          where('organizer.uid', '==', user.uid)
        );

        const querySnapshot = await getDocs(organizerQuery);
        const groups: Group[] = [];
        querySnapshot.forEach((doc) => {
          groups.push({ id: doc.id, ...doc.data() } as Group);
        });

        setUserGroups(groups);
      } catch (error) {
        console.error('Error fetching user groups:', error);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchUserGroups();
  }, [user]);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user) return;

      setActivitiesLoading(true);
      try {
        const activities: Array<{
          id: string;
          type: string;
          status: string;
          groupName: string;
          groupId: string;
          timestamp: Date;
          rejectionReason?: string;
        }> = [];

        // Fetch user's membership requests
        const requestsQuery = query(
          collection(db, 'membershipRequests'),
          where('userId', '==', user.uid),
          orderBy('submittedAt', 'desc'),
          limit(10)
        );
        const requestsSnapshot = await getDocs(requestsQuery);

        // Get group details for each request
        for (const doc of requestsSnapshot.docs) {
          const requestData = doc.data() as MembershipRequest;

          // Fetch the group directly by its ID
          try {
            const groupQuery = query(collection(db, 'groups'));
            const groupSnapshot = await getDocs(groupQuery);
            let groupData = null;

            groupSnapshot.forEach((groupDoc) => {
              if (groupDoc.id === requestData.groupId) {
                groupData = groupDoc.data();
              }
            });

            activities.push({
              id: doc.id,
              type: 'membership_request',
              status: requestData.status ?? 'pending',
              groupName: groupData ? (groupData as { name?: string }).name || 'Groupe inconnu' : 'Groupe inconnu',
              groupId: requestData.groupId,
              timestamp: requestData.submittedAt,
              rejectionReason: requestData.rejectionReason
            });
          } catch (error) {
            console.error('Error fetching group for request:', error);
          }
        }

        // Sort activities by timestamp
        activities.sort((a, b) => {
          const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
          const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });

        setRecentActivities(activities.slice(0, 10));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchRecentActivities();
  }, [user]);

  // Removed handleLogout as logout is now handled by Navbar

  return (
    <ProtectedRoute>
      <div className="min-h-screen smaaks-bg-light">
        {/* Welcome Popup */}
        {showWelcome && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center smaaks-card relative">
              <button
                onClick={closeWelcomePopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="smaaks-icon-circle primary mx-auto mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bonjour {user.displayName || user.email?.split('@')[0]} !
              </h2>
              <p className="text-gray-600 mb-4">
                Tu es bien connecté à SMAAKS Groups
              </p>
              <button
                onClick={closeWelcomePopup}
                className="smaaks-btn-primary"
              >
                Commencer
              </button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1
              className="text-3xl font-bold smaaks-text-primary cursor-pointer"
              onClick={handleTitleClick}
              title="Triple-cliquez pour réinitialiser le popup de bienvenue"
            >
              Tableau de Bord
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenue dans votre espace SMAAKS Groups
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profil Card */}
            <div className="smaaks-card">
              <div className="flex items-center mb-4">
                <div className="smaaks-icon-circle primary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Mon Profil</h3>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  <strong>Nom :</strong> {user?.displayName || 'Non renseigné'}
                </p>
                <p className="text-gray-600">
                  <strong>Email :</strong> {user?.email}
                </p>
                <p className="text-gray-600">
                  <strong>Email vérifié :</strong> {user?.emailVerified ? 'Oui' : 'Non'}
                </p>
              </div>
              <Link
                href="/profile"
                className="smaaks-btn-secondary w-full text-center"
              >
                Modifier le profil
              </Link>
            </div>

            {/* Groups Card */}
            <div className="smaaks-card">
              <div className="flex items-center mb-4">
                <div className="smaaks-icon-circle secondary">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Mes Groupes</h3>
              </div>

              {groupsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 smaaks-border-primary"></div>
                </div>
              ) : userGroups.length > 0 ? (
                <div className="space-y-3">
                  {userGroups.slice(0, 2).map((group) => (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 truncate">{group.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {group.stats?.memberCount ?? 0} membre{(group.stats?.memberCount ?? 0) > 1 ? 's' : ''} • {group.category}
                      </p>
                    </Link>
                  ))}
                  {userGroups.length > 2 && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      +{userGroups.length - 2} autre{userGroups.length - 2 > 1 ? 's' : ''} groupe{userGroups.length - 2 > 1 ? 's' : ''}
                    </p>
                  )}
                  <Link
                    href="/my-groups"
                    className="smaaks-btn-secondary w-full text-center mt-3"
                  >
                    Voir tous mes groupes ({userGroups.length})
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Vous n&apos;avez pas encore de groupe</p>
                  <Link
                    href="/create-group"
                    className="smaaks-btn-primary text-center"
                  >
                    Créer mon premier groupe
                  </Link>
                </div>
              )}
            </div>

            {/* Activity Card */}
            <div className="smaaks-card">
              <div className="flex items-center mb-4">
                <div className="smaaks-icon-circle accent">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Activité</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Groupes créés</span>
                  <span className="font-semibold text-gray-900">{groupsLoading ? '-' : userGroups.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membres totaux</span>
                  <span className="font-semibold text-gray-900">
                    {groupsLoading ? '-' : userGroups.reduce((total, group) => total + (group.stats?.memberCount ?? 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Événements</span>
                  <span className="font-semibold text-gray-900">
                    {groupsLoading ? '-' : '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="smaaks-card md:col-span-2 lg:col-span-3">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Actions rapides</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/groups"
                  className="smaaks-btn-primary text-center"
                >
                  Découvrir des groupes
                </Link>
                <Link
                  href="/create-group"
                  className="smaaks-btn-secondary text-center"
                >
                  Créer un groupe
                </Link>
                <button className="smaaks-btn-secondary text-center">
                  Voir mes messages
                </button>
                <Link
                  href="/profile"
                  className="smaaks-btn-secondary text-center"
                >
                  Modifier mon profil
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 smaaks-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Activité récente</h3>
            {activitiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Chargement de l&apos;activité...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const activityDate = activity.timestamp instanceof Date
                    ? activity.timestamp
                    : new Date(activity.timestamp);

                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      {/* Activity Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === 'pending' ? 'bg-yellow-100' :
                          activity.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <svg className={`h-5 w-5 ${
                            activity.status === 'pending' ? 'text-yellow-600' :
                            activity.status === 'approved' ? 'text-green-600' : 'text-red-600'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {activity.status === 'pending' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : activity.status === 'approved' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </div>
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.status === 'pending' && (
                            <>Demande d&apos;adhésion envoyée au groupe <Link href={`/groups/${activity.groupId}`} className="font-semibold text-purple-600 hover:text-purple-700">{activity.groupName}</Link></>
                          )}
                          {activity.status === 'approved' && (
                            <>Votre demande pour rejoindre <Link href={`/groups/${activity.groupId}`} className="font-semibold text-purple-600 hover:text-purple-700">{activity.groupName}</Link> a été acceptée</>
                          )}
                          {activity.status === 'rejected' && (
                            <>Votre demande pour rejoindre <Link href={`/groups/${activity.groupId}`} className="font-semibold text-purple-600 hover:text-purple-700">{activity.groupName}</Link> a été refusée</>
                          )}
                        </p>
                        {activity.rejectionReason && (
                          <p className="text-xs text-gray-500 mt-1">Raison : {activity.rejectionReason}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {activityDate.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: activityDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })}
                          {' à '}
                          {activityDate.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Status Badge for pending requests */}
                      {activity.status === 'pending' && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            En attente
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {recentActivities.length >= 10 && (
                  <p className="text-sm text-gray-500 text-center pt-4">
                    Affichage des 10 dernières activités
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-gray-500">Aucune activité récente</p>
                <p className="text-sm text-gray-400 mt-2">
                  Commencez par rejoindre ou créer un groupe pour voir votre activité ici.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}