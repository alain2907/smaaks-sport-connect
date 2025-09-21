'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Group } from '@/types/models';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';

const categories = [
  'Tous',
  'Sport & Fitness',
  'Technologie & Innovation',
  'Arts & Culture',
  'Cuisine & Gastronomie',
  'Voyage & Aventure',
  'Entrepreneuriat & Business',
  'Santé & Bien-être',
  'Éducation & Formation',
  'Musique & Spectacle',
  'Jeux & Divertissement',
  'Nature & Environnement',
  'Communauté & Social',
  'Autre'
];

export default function DiscoverGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetch all groups first (we'll filter client-side for now)
        const allGroupsQuery = query(
          collection(db, 'groups'),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(allGroupsQuery);
        const fetchedGroups: Group[] = [];
        querySnapshot.forEach((doc) => {
          const groupData = { id: doc.id, ...doc.data() } as Group;
          // Only include public groups
          if (!groupData.settings.isPrivate) {
            fetchedGroups.push(groupData);
          }
        });

        console.log('Fetched groups:', fetchedGroups.length); // Debug log
        setGroups(fetchedGroups);
        setFilteredGroups(fetchedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    let filtered = groups;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(group =>
        group.location.city?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        group.location.region?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredGroups(filtered);
  }, [groups, searchTerm, selectedCategory, selectedLocation]);

  // Get unique locations for filter
  const locations = Array.from(new Set(
    groups.map(group => group.location.city).filter(city => city)
  )).sort();

  const isUserMember = (group: Group) => {
    return group.members.some(member => member.uid === user?.uid);
  };

  const isUserOwner = (group: Group) => {
    return group.organizer.uid === user?.uid;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen smaaks-bg-light">
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold smaaks-text-primary mb-4">Découvrir des Groupes</h1>
            <p className="text-gray-600">
              Rejoignez des communautés partageant vos passions et centres d&apos;intérêt
            </p>
          </div>

          {/* Filters */}
          <div className="smaaks-card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nom, description..."
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Toutes les villes</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              {loading ? 'Chargement...' : `${filteredGroups.length} groupe${filteredGroups.length > 1 ? 's' : ''} trouvé${filteredGroups.length > 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="smaaks-card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun groupe trouvé</h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche ou créez le premier groupe !
              </p>
              <Link
                href="/create-group"
                className="smaaks-btn-primary"
              >
                Créer un groupe
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div key={group.id} className="smaaks-card group hover:shadow-lg transition-shadow">
                  {/* Group Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {group.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <span className="smaaks-badge-primary text-xs">{group.category}</span>
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

                    {/* Status badges */}
                    <div className="flex flex-col space-y-1">
                      {isUserOwner(group) && (
                        <span className="smaaks-badge-accent text-xs">Organisateur</span>
                      )}
                      {isUserMember(group) && !isUserOwner(group) && (
                        <span className="smaaks-badge-secondary text-xs">Membre</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {group.description}
                  </p>

                  {/* Stats */}
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

                  {/* Settings info */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mb-4">
                    {group.settings.requiresApproval && (
                      <span className="flex items-center">
                        <svg className="h-3 w-3 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Approbation requise
                      </span>
                    )}
                    {group.settings.maxMembers && (
                      <span>
                        Max {group.settings.maxMembers} membres
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/groups/${group.id}`}
                    className="smaaks-btn-primary w-full text-center"
                  >
                    {isUserMember(group) ? 'Voir le groupe' : 'Découvrir'}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {!loading && filteredGroups.length > 0 && (
            <div className="text-center mt-12 smaaks-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Vous ne trouvez pas votre groupe idéal ?
              </h3>
              <p className="text-gray-600 mb-6">
                Créez votre propre groupe et rassemblez des personnes partageant vos passions !
              </p>
              <Link
                href="/create-group"
                className="smaaks-btn-secondary"
              >
                Créer un groupe
              </Link>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}