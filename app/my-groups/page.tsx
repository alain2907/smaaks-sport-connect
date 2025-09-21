'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Group } from '@/types/models';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';

export default function MyGroupsPage() {
  const { user } = useAuth();
  const [ownedGroups, setOwnedGroups] = useState<Group[]>([]);
  const [memberGroups, setMemberGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'owned' | 'member'>('owned');
  const [leaveLoading, setLeaveLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) return;

      try {
        // Fetch groups where user is organizer
        const organizerQuery = query(
          collection(db, 'groups'),
          where('organizer.uid', '==', user.uid)
        );

        const organizerSnapshot = await getDocs(organizerQuery);
        const owned: Group[] = [];
        organizerSnapshot.forEach((doc) => {
          owned.push({ id: doc.id, ...doc.data() } as Group);
        });

        // Fetch all groups and filter where user is member
        const allGroupsSnapshot = await getDocs(collection(db, 'groups'));
        const member: Group[] = [];
        allGroupsSnapshot.forEach((doc) => {
          const groupData = { id: doc.id, ...doc.data() } as Group;
          // Check if user is member but not organizer
          const isMember = groupData.members.some(m => m.uid === user.uid);
          const isOwner = groupData.organizer.uid === user.uid;
          if (isMember && !isOwner) {
            member.push(groupData);
          }
        });

        setOwnedGroups(owned);
        setMemberGroups(member);
      } catch (error) {
        console.error('Error fetching user groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, [user]);

  const handleLeaveGroup = async (groupId: string) => {
    if (!user || !confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) return;

    setLeaveLoading(groupId);
    try {
      const groupRef = doc(db, 'groups', groupId);
      const snap = await getDoc(groupRef);
      if (!snap.exists()) throw new Error('Groupe introuvable');

      // Retirer précisément le membre (évite l'échec silencieux d'arrayRemove)
      const data = snap.data() as Group;
      const newMembers = data.members.filter(m => m.uid !== user.uid);

      await updateDoc(groupRef, {
        members: newMembers,
        // Recalcule le total (le plus sûr)
        'stats.memberCount': Math.max(0, newMembers.length),
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setMemberGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Erreur lors de la sortie du groupe');
    } finally {
      setLeaveLoading(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen smaaks-bg-light">
          <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-96"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="smaaks-card">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
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
            <Link
              href="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au dashboard
            </Link>

            <h1 className="text-3xl font-bold smaaks-text-primary mb-4">Mes Groupes</h1>
            <p className="text-gray-600">
              Gérez vos groupes créés et les groupes dont vous êtes membre
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('owned')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'owned'
                    ? 'smaaks-border-primary smaaks-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mes créations ({ownedGroups.length})
              </button>
              <button
                onClick={() => setActiveTab('member')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'member'
                    ? 'smaaks-border-primary smaaks-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Membre de ({memberGroups.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'owned' ? (
            <div>
              {ownedGroups.length === 0 ? (
                <div className="text-center py-12 smaaks-card">
                  <div className="smaaks-icon-circle primary mx-auto mb-4">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Aucun groupe créé</h3>
                  <p className="text-gray-600 mb-6">
                    Vous n&apos;avez pas encore créé de groupe. Créez votre premier groupe pour rassembler des personnes autour de vos passions !
                  </p>
                  <Link
                    href="/create-group"
                    className="smaaks-btn-primary"
                  >
                    Créer mon premier groupe
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedGroups.map((group) => (
                    <div key={group.id} className="smaaks-card group hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {group.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                            <span className="smaaks-badge-primary text-xs">{group.category}</span>
                            <span className="smaaks-badge-accent text-xs">Organisateur</span>
                            {group.location.city && (
                              <span className="flex items-center">
                                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {group.location.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {group.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {group.stats.memberCount} membre{group.stats.memberCount > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs">
                          Créé le {(() => {
                            try {
                              if (group.createdAt instanceof Date) {
                                return group.createdAt.toLocaleDateString('fr-FR');
                              }
                              // Handle Firestore Timestamp
                              if (group.createdAt && typeof group.createdAt === 'object' && 'toDate' in group.createdAt) {
                                return (group.createdAt as { toDate(): Date }).toDate().toLocaleDateString('fr-FR');
                              }
                              // Handle seconds/nanoseconds object
                              if (group.createdAt && typeof group.createdAt === 'object' && 'seconds' in group.createdAt) {
                                return new Date((group.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('fr-FR');
                              }
                              // Fallback for string or number
                              return new Date(group.createdAt).toLocaleDateString('fr-FR');
                            } catch (error) {
                              console.error('Error formatting date:', error);
                              return 'Date non disponible';
                            }
                          })()}
                        </span>
                      </div>

                      <Link
                        href={`/groups/${group.id}`}
                        className="smaaks-btn-primary w-full text-center"
                      >
                        Gérer le groupe
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {memberGroups.length === 0 ? (
                <div className="text-center py-12 smaaks-card">
                  <div className="smaaks-icon-circle secondary mx-auto mb-4">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Aucune adhésion</h3>
                  <p className="text-gray-600 mb-6">
                    Vous n&apos;avez rejoint aucun groupe pour le moment. Découvrez des communautés passionnantes !
                  </p>
                  <Link
                    href="/groups"
                    className="smaaks-btn-primary"
                  >
                    Découvrir des groupes
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memberGroups.map((group) => (
                    <div key={group.id} className="smaaks-card group hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {group.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                            <span className="smaaks-badge-primary text-xs">{group.category}</span>
                            <span className="smaaks-badge-secondary text-xs">Membre</span>
                            {group.location.city && (
                              <span className="flex items-center">
                                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {group.location.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {group.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {group.stats.memberCount} membre{group.stats.memberCount > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs">
                          Organisateur: {group.organizer.name}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href={`/groups/${group.id}`}
                          className="smaaks-btn-primary w-full text-center"
                        >
                          Voir le groupe
                        </Link>
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          disabled={leaveLoading === group.id}
                          className="w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {leaveLoading === group.id ? 'Sortie...' : 'Quitter le groupe'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 text-center smaaks-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Actions rapides</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/groups"
                className="smaaks-btn-primary"
              >
                Découvrir des groupes
              </Link>
              <Link
                href="/create-group"
                className="smaaks-btn-secondary"
              >
                Créer un nouveau groupe
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}