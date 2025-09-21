'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useFCM } from '@/hooks/useFCM';
import { Group, MembershipRequest } from '@/types/models';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';
import GroupFeed from '@/components/group/GroupFeed';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { subscribeToGroupTopic } = useFCM();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Membership states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [userRequest, setUserRequest] = useState<MembershipRequest | null>(null);
  const [pendingRequests, setPendingRequests] = useState<MembershipRequest[]>([]);
  const [requestAnswers, setRequestAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [showMembershipRequests, setShowMembershipRequests] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'info' | 'feed' | 'requests'>('info');
  const [showFallback, setShowFallback] = useState(false);

  const [editData, setEditData] = useState({
    rules: [] as string[],
    externalLinks: {
      whatsapp: '',
      discord: '',
      telegram: '',
      website: '',
      other: [] as { name: string; url: string }[]
    },
    settings: {
      isPrivate: false,
      requiresApproval: true,
      maxMembers: undefined as number | undefined,
      minAge: undefined as number | undefined,
      maxAge: undefined as number | undefined
    }
  });

  useEffect(() => {
    const fetchGroup = async () => {
      if (!params.id) return;

      try {
        const groupDoc = await getDoc(doc(db, 'groups', params.id as string));
        if (groupDoc.exists()) {
          const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
          setGroup(groupData);
          setEditData({
            rules: groupData.rules || [],
            externalLinks: {
              whatsapp: groupData.externalLinks?.whatsapp || '',
              discord: groupData.externalLinks?.discord || '',
              telegram: groupData.externalLinks?.telegram || '',
              website: groupData.externalLinks?.website || '',
              other: groupData.externalLinks?.other || []
            },
            settings: {
              isPrivate: groupData.settings.isPrivate,
              requiresApproval: groupData.settings.requiresApproval,
              maxMembers: groupData.settings.maxMembers ?? undefined,
              minAge: groupData.settings.minAge ?? undefined,
              maxAge: groupData.settings.maxAge ?? undefined
            }
          });
        } else {
          setError('Groupe introuvable');
        }
      } catch (err) {
        setError('Erreur lors du chargement du groupe');
        console.error('Error fetching group:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [params.id]);

  // Fetch user's membership request status
  useEffect(() => {
    const fetchUserRequest = async () => {
      if (!user || !group) return;

      try {
        const requestQuery = query(
          collection(db, 'membershipRequests'),
          where('groupId', '==', group.id),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(requestQuery);

        if (!querySnapshot.empty) {
          const requestDoc = querySnapshot.docs[0];
          setUserRequest({ id: requestDoc.id, ...requestDoc.data() } as MembershipRequest);
        }
      } catch (error) {
        console.error('Error fetching user request:', error);
      }
    };

    fetchUserRequest();
  }, [user, group]);

  // Fetch pending requests for organizers/admins
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user || !group || !canManageRequests()) return;

      try {
        const requestQuery = query(
          collection(db, 'membershipRequests'),
          where('groupId', '==', group.id),
          where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(requestQuery);
        const requests: MembershipRequest[] = [];

        querySnapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() } as MembershipRequest);
        });

        setPendingRequests(requests);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, [user, group]);

  // Helper functions
  const isOwner = user?.uid === group?.organizer.uid;
  const isMember = group?.members.some(member => member.uid === user?.uid && member.status === 'active');
  const userMember = group?.members.find(member => member.uid === user?.uid);
  const canManageRequests = () => {
    if (!userMember) return isOwner;
    return isOwner || userMember.role === 'admin' || userMember.role === 'moderator';
  };

  // S'abonner aux notifications du groupe si l'utilisateur est membre
  useEffect(() => {
    if (group && user && (isMember || isOwner)) {
      subscribeToGroupTopic(group.id);
    }
  }, [group, user, isMember, isOwner, subscribeToGroupTopic]);

  // Membership functions
  const handleJoinRequest = async () => {
    if (!user || !group) return;

    setJoinLoading(true);
    try {
      if (group.settings.requiresApproval && group.admissionQuestions.length > 0) {
        setShowJoinModal(true);
      } else {
        await submitJoinRequest([]);
      }
    } catch (error) {
      console.error('Error initiating join request:', error);
      setError('Erreur lors de la demande d\'adhésion');
    } finally {
      setJoinLoading(false);
    }
  };

  const submitJoinRequest = async (answers: { questionId: string; answer: string | string[] }[]) => {
    if (!user || !group) return;

    setJoinLoading(true);
    try {
      const requestData = {
        groupId: group.id,
        userId: user.uid,
        userInfo: {
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          email: user.email || '',
          photoURL: user.photoURL || undefined
        },
        answers,
        status: 'pending' as const,
        submittedAt: new Date()
      };

      if (!group.settings.requiresApproval) {
        // Direct join
        await updateDoc(doc(db, 'groups', group.id), {
          members: arrayUnion({
            uid: user.uid,
            joinedAt: new Date(),
            role: 'member',
            status: 'active'
          }),
          'stats.memberCount': group.stats.memberCount + 1,
          updatedAt: new Date()
        });

        // Update local state
        setGroup(prev => prev ? {
          ...prev,
          members: [...prev.members, {
            uid: user.uid,
            joinedAt: new Date(),
            role: 'member',
            status: 'active'
          }],
          stats: { ...prev.stats, memberCount: prev.stats.memberCount + 1 }
        } : null);
      } else {
        // Submit request for approval
        await addDoc(collection(db, 'membershipRequests'), requestData);
        setUserRequest({ id: '', ...requestData });
      }

      setShowJoinModal(false);
      setRequestAnswers({});
    } catch (error) {
      console.error('Error submitting join request:', error);
      setError('Erreur lors de la soumission de la demande');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    if (!user || !group) return;

    try {
      const requestDoc = doc(db, 'membershipRequests', requestId);
      const request = pendingRequests.find(r => r.id === requestId);
      if (!request) return;

      if (action === 'approve') {
        // Add user to group members
        await updateDoc(doc(db, 'groups', group.id), {
          members: arrayUnion({
            uid: request.userId,
            joinedAt: new Date(),
            role: 'member',
            status: 'active'
          }),
          'stats.memberCount': group.stats.memberCount + 1,
          updatedAt: new Date()
        });

        // Update local group state
        setGroup(prev => prev ? {
          ...prev,
          members: [...prev.members, {
            uid: request.userId,
            joinedAt: new Date(),
            role: 'member',
            status: 'active'
          }],
          stats: { ...prev.stats, memberCount: prev.stats.memberCount + 1 }
        } : null);
      }

      // Update request status
      await updateDoc(requestDoc, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewedBy: user.uid,
        ...(rejectionReason && { rejectionReason })
      });

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

    } catch (error) {
      console.error('Error handling request:', error);
      setError('Erreur lors de la gestion de la demande');
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset to original data when canceling
      if (group) {
        setEditData({
          rules: group.rules || [],
          externalLinks: {
            whatsapp: group.externalLinks?.whatsapp || '',
            discord: group.externalLinks?.discord || '',
            telegram: group.externalLinks?.telegram || '',
            website: group.externalLinks?.website || '',
            other: group.externalLinks?.other || []
          },
          settings: {
            isPrivate: group.settings.isPrivate,
            requiresApproval: group.settings.requiresApproval,
            maxMembers: group.settings.maxMembers ?? undefined,
            minAge: group.settings.minAge ?? undefined,
            maxAge: group.settings.maxAge ?? undefined
          }
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleRuleChange = (index: number, value: string) => {
    setEditData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const addRule = () => {
    setEditData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    setEditData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSettingChange = (field: string, value: boolean | number | undefined) => {
    setEditData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!group || !params.id) return;

    setSaveLoading(true);
    try {
      // Clean rules (remove empty ones)
      const cleanRules = editData.rules.filter(rule => rule.trim() !== '');

      // Clean settings (remove undefined values)
      const cleanSettings = {
        isPrivate: editData.settings.isPrivate,
        requiresApproval: editData.settings.requiresApproval,
        ...(editData.settings.maxMembers && { maxMembers: editData.settings.maxMembers }),
        ...(editData.settings.minAge && { minAge: editData.settings.minAge }),
        ...(editData.settings.maxAge && { maxAge: editData.settings.maxAge })
      };

      // Clean external links (remove empty values)
      const cleanExternalLinks = {
        ...(editData.externalLinks.whatsapp && { whatsapp: editData.externalLinks.whatsapp }),
        ...(editData.externalLinks.discord && { discord: editData.externalLinks.discord }),
        ...(editData.externalLinks.telegram && { telegram: editData.externalLinks.telegram }),
        ...(editData.externalLinks.website && { website: editData.externalLinks.website }),
        ...(editData.externalLinks.other.length > 0 && {
          other: editData.externalLinks.other.filter(link => link.name.trim() && link.url.trim())
        })
      };

      await updateDoc(doc(db, 'groups', params.id as string), {
        rules: cleanRules,
        settings: cleanSettings,
        externalLinks: cleanExternalLinks,
        updatedAt: new Date()
      });

      // Update local state
      setGroup(prev => prev ? {
        ...prev,
        rules: cleanRules,
        settings: cleanSettings,
        externalLinks: cleanExternalLinks,
        updatedAt: new Date()
      } : null);

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating group:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !user || !params.id) return;
    if (group.organizer.uid !== user.uid) {
      setError('Seul le créateur du groupe peut le supprimer');
      return;
    }
    if (deleteConfirmText !== group.name) {
      setError('Le nom du groupe ne correspond pas');
      return;
    }

    setDeleteLoading(true);
    try {
      // Supprimer le document du groupe
      await deleteDoc(doc(db, 'groups', params.id as string));

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Erreur lors de la suppression du groupe');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExternalLinkChange = (field: 'whatsapp' | 'discord' | 'telegram' | 'website', value: string) => {
    setEditData(prev => ({
      ...prev,
      externalLinks: {
        ...prev.externalLinks,
        [field]: value
      }
    }));
  };

  const addEditOtherLink = () => {
    setEditData(prev => ({
      ...prev,
      externalLinks: {
        ...prev.externalLinks,
        other: [...prev.externalLinks.other, { name: '', url: '' }]
      }
    }));
  };

  const updateEditOtherLink = (index: number, field: 'name' | 'url', value: string) => {
    setEditData(prev => ({
      ...prev,
      externalLinks: {
        ...prev.externalLinks,
        other: prev.externalLinks.other.map((link, i) =>
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };

  const removeEditOtherLink = (index: number) => {
    setEditData(prev => ({
      ...prev,
      externalLinks: {
        ...prev.externalLinks,
        other: prev.externalLinks.other.filter((_, i) => i !== index)
      }
    }));
  };

  const handleReport = () => {
    if (!user || !group) return;

    const reasons = [
      'Contenu inapproprié',
      'Harcèlement',
      'Spam',
      'Sécurité des enfants',
      'Autre'
    ];

    const reasonIndex = prompt(`Sélectionnez le motif de signalement :\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nEntrez le numéro (1-5):`);

    if (!reasonIndex || parseInt(reasonIndex) < 1 || parseInt(reasonIndex) > 5) {
      return;
    }

    const selectedReason = reasons[parseInt(reasonIndex) - 1];
    const details = prompt(`Motif: ${selectedReason}\n\nPouvez-vous donner plus de détails (optionnel)?`);

    const subject = `[SIGNALEMENT] Groupe "${group.name}"`;
    const body = `Bonjour,

Je souhaite signaler le groupe "${group.name}" pour le motif suivant :

Motif : ${selectedReason}
Détails : ${details || 'Aucun détail supplémentaire'}

Informations du groupe :
- Nom : ${group.name}
- ID : ${group.id}
- Organisateur : ${group.organizer.name}
- Lien : ${window.location.origin}/groups/${group.id}

Informations du signalement :
- Signalé par : ${user.displayName || user.email?.split('@')[0] || 'Utilisateur'} (${user.email})
- Date : ${new Date().toLocaleString('fr-FR')}

Cordialement,
${user.displayName || user.email?.split('@')[0] || 'Utilisateur'}`;

    const mailtoUrl = `mailto:contact@smaaks.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Ouvre le client mail
    window.location.href = mailtoUrl;

    // En parallèle → affiche un fallback après 2 secondes
    setTimeout(() => {
      setShowFallback(true);
    }, 2000);
  };


  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen smaaks-bg-light flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 smaaks-border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du groupe...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !group) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen smaaks-bg-light">
          <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Groupe introuvable</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="smaaks-btn-primary"
              >
                Retour au dashboard
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }


  return (
    <ProtectedRoute>
      <div className="min-h-screen smaaks-bg-light">
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au dashboard
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'smaaks-border-primary smaaks-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informations
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feed'
                    ? 'smaaks-border-primary smaaks-text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fil d&apos;actualité
              </button>
              {(isOwner || canManageRequests()) && (
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                    activeTab === 'requests'
                      ? 'smaaks-border-primary smaaks-text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Demandes
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'info' ? (
                <>
                  {/* Group Info */}
                  <div className="smaaks-card">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="smaaks-badge-primary">{group.category}</span>
                      {group.location.city && (
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {group.location.city}{group.location.region && `, ${group.location.region}`}
                        </span>
                      )}
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {group.stats.memberCount} membre{group.stats.memberCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isOwner && (
                      <>
                        <span className="smaaks-badge-accent text-xs">Organisateur</span>
                        <button
                          onClick={handleEditToggle}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {isEditing ? 'Annuler' : 'Modifier'}
                        </button>
                        {isEditing && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleSave}
                              disabled={saveLoading}
                              className="text-sm smaaks-btn-primary px-3 py-1 disabled:opacity-50"
                            >
                              {saveLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{group.description}</p>
                </div>

                {group.location.address && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Lieu de rencontre</h4>
                    <p className="text-gray-600">{group.location.address}</p>
                  </div>
                )}
              </div>

              {/* External Links - Join Community */}
              {group.externalLinks && Object.keys(group.externalLinks).some(key =>
                group.externalLinks[key as keyof typeof group.externalLinks]
              ) && (
                <div className="smaaks-card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Rejoindre la communauté</h3>
                  <p className="text-gray-600 mb-6">
                    Ce groupe utilise des plateformes externes pour les discussions et événements.
                    Cliquez sur les liens ci-dessous pour rejoindre :
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.externalLinks.whatsapp && (
                      <a
                        href={group.externalLinks.whatsapp}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="flex items-center justify-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
                        </svg>
                        Rejoindre sur WhatsApp
                      </a>
                    )}

                    {group.externalLinks.discord && (
                      <a
                        href={group.externalLinks.discord}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="flex items-center justify-center p-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                      >
                        <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z"/>
                        </svg>
                        Rejoindre sur Discord
                      </a>
                    )}

                    {group.externalLinks.telegram && (
                      <a
                        href={group.externalLinks.telegram}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="flex items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Rejoindre sur Telegram
                      </a>
                    )}

                    {group.externalLinks.website && (
                      <a
                        href={group.externalLinks.website}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="flex items-center justify-center p-4 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
                      >
                        <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                        </svg>
                        Visiter le site web
                      </a>
                    )}

                    {group.externalLinks.other && group.externalLinks.other.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="flex items-center justify-center p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                      >
                        <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {link.name}
                      </a>
                    ))}
                  </div>

                  {(isMember || isOwner) && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Vous êtes membre :</strong> Ces liens vous donnent accès aux discussions
                        et événements du groupe sur les plateformes externes.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rules */}
              {(group.rules.length > 0 || isEditing) && (
                <div className="smaaks-card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Règles du groupe
                    {isOwner && !isEditing && group.rules.length === 0 && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Aucune règle définie)
                      </span>
                    )}
                  </h3>

                  {!isEditing ? (
                    <ol className="list-decimal list-inside space-y-2">
                      {group.rules.map((rule, index) => (
                        <li key={index} className="text-gray-700">{rule}</li>
                      ))}
                    </ol>
                  ) : (
                    <div className="space-y-3">
                      {editData.rules.map((rule, index) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-sm text-gray-500 mt-2 min-w-[20px]">{index + 1}.</span>
                          <input
                            type="text"
                            value={rule}
                            onChange={(e) => handleRuleChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder={`Règle ${index + 1}`}
                          />
                          <button
                            onClick={() => removeRule(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addRule}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        + Ajouter une règle
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Admission Questions */}
              {group.admissionQuestions.length > 0 && (
                <div className="smaaks-card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions d&apos;admission</h3>
                  <div className="space-y-4">
                    {group.admissionQuestions.map((question, index) => (
                      <div key={question.id} className="border-l-4 border-purple-200 pl-4">
                        <p className="font-medium text-gray-900">
                          {index + 1}. {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Type : {question.type === 'text' ? 'Réponse libre' : question.type === 'choice' ? 'Choix unique' : 'Choix multiple'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links - Edit Mode */}
              {isEditing && isOwner && (
                <div className="smaaks-card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Liens externes</h3>
                  <p className="text-gray-600 mb-6">
                    Ajoutez des liens vers vos plateformes de communication externes
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="url"
                        value={editData.externalLinks.whatsapp}
                        onChange={(e) => handleExternalLinkChange('whatsapp', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://chat.whatsapp.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discord
                      </label>
                      <input
                        type="url"
                        value={editData.externalLinks.discord}
                        onChange={(e) => handleExternalLinkChange('discord', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://discord.gg/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telegram
                      </label>
                      <input
                        type="url"
                        value={editData.externalLinks.telegram}
                        onChange={(e) => handleExternalLinkChange('telegram', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://t.me/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site web
                      </label>
                      <input
                        type="url"
                        value={editData.externalLinks.website}
                        onChange={(e) => handleExternalLinkChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Other Links */}
                  {editData.externalLinks.other.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Autres liens</h5>
                      {editData.externalLinks.other.map((link, index) => (
                        <div key={index} className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => updateEditOtherLink(index, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Nom du lien"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateEditOtherLink(index, 'url', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="https://..."
                          />
                          <button
                            type="button"
                            onClick={() => removeEditOtherLink(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            Suppr.
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addEditOtherLink}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    + Ajouter un autre lien
                  </button>
                </div>
              )}
                </>
              ) : activeTab === 'feed' ? (
                <GroupFeed group={group} />
              ) : (
                // Requests tab content
                <div className="smaaks-card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Demandes d&apos;adhésion en attente</h3>

                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune demande en attente</h4>
                      <p className="text-gray-500">Il n&apos;y a actuellement aucune demande d&apos;adhésion à examiner.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              {request.userInfo.photoURL ? (
                                <img
                                  src={request.userInfo.photoURL}
                                  alt={request.userInfo.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg">
                                  {request.userInfo.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{request.userInfo.name}</h4>
                                <p className="text-gray-600">{request.userInfo.email}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Demande envoyée le {' '}
                                  {request.submittedAt instanceof Date
                                    ? request.submittedAt.toLocaleDateString('fr-FR')
                                    : new Date(request.submittedAt).toLocaleDateString('fr-FR')
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {request.answers.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-base font-semibold text-gray-900 mb-4">Réponses aux questions d&apos;admission :</h5>
                              <div className="space-y-4">
                                {request.answers.map((answer) => {
                                  const question = group.admissionQuestions.find(q => q.id === answer.questionId);
                                  return (
                                    <div key={answer.questionId} className="bg-gray-50 rounded-lg p-4">
                                      <p className="font-medium text-gray-900 mb-2">{question?.question}</p>
                                      <p className="text-gray-700">
                                        {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleRequestAction(request.id, 'approve')}
                              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Raison du refus (optionnel) :');
                                handleRequestAction(request.id, 'reject', reason || 'Demande refusée');
                              }}
                              className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Organizer Info - Only on info tab */}
              {activeTab === 'info' && (
                <div className="smaaks-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organisateur</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 smaaks-bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {group.organizer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{group.organizer.name}</p>
                      <p className="text-sm text-gray-500">Créateur du groupe</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Group Stats - Only on info tab */}
              {activeTab === 'info' && (
                <div className="smaaks-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membres</span>
                      <span className="font-semibold text-gray-900">{group.stats.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membres actifs</span>
                      <span className="font-semibold text-gray-900">{group.stats.activeMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Événements</span>
                      <span className="font-semibold text-gray-900">{group.stats.totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créé le</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {(() => {
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
                  </div>
                </div>
              )}

              {/* Report Button */}
              <div className="smaaks-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Signaler un problème</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Si vous rencontrez du contenu inapproprié dans ce groupe, vous pouvez le signaler.
                </p>
                <button
                  onClick={handleReport}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Signaler ce groupe
                </button>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="smaaks-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions de l'organisateur</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push(`/groups/${group.id}/chat`)}
                      className="w-full smaaks-btn-primary"
                    >
                      💬 Chat du groupe
                    </button>
                    <button className="w-full smaaks-btn-secondary">
                      Gérer les événements
                    </button>
                  </div>
                </div>
              )}

              {/* Membership Action */}
              {!isOwner && (
                <div className="smaaks-card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {isMember ? 'Membre du groupe' : 'Rejoindre le groupe'}
                  </h3>

                  {isMember ? (
                    <div className="space-y-4">
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-800 font-medium">Vous êtes membre</span>
                      </div>
                      {userMember && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Rôle :</strong> {
                            userMember.role === 'admin' ? 'Administrateur' :
                            userMember.role === 'moderator' ? 'Modérateur' : 'Membre'
                          }</p>
                          <p><strong>Membre depuis :</strong> {
                            (() => {
                              try {
                                if (userMember.joinedAt instanceof Date) {
                                  return userMember.joinedAt.toLocaleDateString('fr-FR');
                                }
                                if (userMember.joinedAt && typeof userMember.joinedAt === 'object' && 'toDate' in userMember.joinedAt) {
                                  return (userMember.joinedAt as { toDate(): Date }).toDate().toLocaleDateString('fr-FR');
                                }
                                if (userMember.joinedAt && typeof userMember.joinedAt === 'object' && 'seconds' in userMember.joinedAt) {
                                  return new Date((userMember.joinedAt as { seconds: number }).seconds * 1000).toLocaleDateString('fr-FR');
                                }
                                return new Date(userMember.joinedAt).toLocaleDateString('fr-FR');
                              } catch (error) {
                                console.error('Error formatting joinedAt date:', error);
                                return 'Date non disponible';
                              }
                            })()
                          }</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <button
                          onClick={() => router.push(`/groups/${group.id}/chat`)}
                          className="w-full smaaks-btn-primary"
                        >
                          💬 Chat du groupe
                        </button>
                        <button className="w-full smaaks-btn-secondary">
                          Voir les événements
                        </button>
                      </div>
                    </div>
                  ) : userRequest ? (
                    <div className="space-y-4">
                      {userRequest.status === 'pending' && (
                        <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                          <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-yellow-800 font-medium">Demande en attente</span>
                        </div>
                      )}
                      {userRequest.status === 'rejected' && (
                        <div className="space-y-3">
                          <div className="flex items-center p-3 bg-red-50 rounded-lg">
                            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-red-800 font-medium">Demande refusée</span>
                          </div>
                          {userRequest.rejectionReason && (
                            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                              <p><strong>Raison :</strong> {userRequest.rejectionReason}</p>
                            </div>
                          )}
                          <button
                            onClick={handleJoinRequest}
                            disabled={joinLoading}
                            className="w-full smaaks-btn-primary disabled:opacity-50"
                          >
                            {joinLoading ? 'Envoi...' : 'Faire une nouvelle demande'}
                          </button>
                        </div>
                      )}
                      {userRequest.status === 'pending' && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Demande envoyée le :</strong> {
                            userRequest.submittedAt instanceof Date
                              ? userRequest.submittedAt.toLocaleDateString('fr-FR')
                              : new Date(userRequest.submittedAt).toLocaleDateString('fr-FR')
                          }</p>
                          <p className="mt-2 text-gray-500">
                            Votre demande sera examinée par l&apos;organisateur du groupe.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={handleJoinRequest}
                        disabled={joinLoading}
                        className="w-full smaaks-btn-primary disabled:opacity-50"
                      >
                        {joinLoading ? 'Envoi...' : 'Demander à rejoindre'}
                      </button>
                      {group.settings.requiresApproval && (
                        <p className="text-sm text-gray-500">
                          Ce groupe nécessite une approbation de l&apos;organisateur.
                        </p>
                      )}
                      {group.admissionQuestions.length > 0 && (
                        <p className="text-sm text-gray-500">
                          {group.admissionQuestions.length} question{group.admissionQuestions.length > 1 ? 's' : ''} à compléter.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Membership Requests Management */}
              {canManageRequests() && pendingRequests.length > 0 && (
                <div className="smaaks-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Demandes d&apos;adhésion
                    </h3>
                    <span className="smaaks-badge-primary text-xs">
                      {pendingRequests.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {pendingRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.userInfo.name}</h4>
                            <p className="text-sm text-gray-600">{request.userInfo.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Demande envoyée le {
                                request.submittedAt instanceof Date
                                  ? request.submittedAt.toLocaleDateString('fr-FR')
                                  : new Date(request.submittedAt).toLocaleDateString('fr-FR')
                              }
                            </p>
                          </div>
                        </div>

                        {request.answers.length > 0 && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Réponses :</h5>
                            <div className="space-y-2">
                              {request.answers.map((answer) => {
                                const question = group.admissionQuestions.find(q => q.id === answer.questionId);
                                return (
                                  <div key={answer.questionId} className="text-sm">
                                    <p className="text-gray-700 font-medium">{question?.question}</p>
                                    <p className="text-gray-600">{Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => handleRequestAction(request.id, 'reject', 'Demande refusée')}
                            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    ))}

                    {pendingRequests.length > 3 && (
                      <button
                        onClick={() => setShowMembershipRequests(true)}
                        className="w-full text-center text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Voir toutes les demandes ({pendingRequests.length})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="smaaks-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Membres ({group.stats.memberCount})</h3>
                <div className="space-y-3">
                  {/* Organizer */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {group.organizer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{group.organizer.name}</p>
                      <p className="text-sm text-purple-600">Organisateur</p>
                    </div>
                  </div>

                  {/* Other Members */}
                  {group.members.filter(m => m.uid !== group.organizer.uid && m.status === 'active').slice(0, 4).map((member) => (
                    <div key={member.uid} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        ?
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Membre</p>
                        <p className="text-sm text-gray-600">
                          {member.role === 'admin' ? 'Administrateur' :
                           member.role === 'moderator' ? 'Modérateur' : 'Membre'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {group.stats.memberCount > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{group.stats.memberCount - 5} autres membres
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Rejoindre &quot;{group.name}&quot;
                  </h3>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">À propos de ce groupe</h4>
                    <p className="text-blue-800 text-sm mb-2">{group.description}</p>
                    {group.settings.requiresApproval && (
                      <p className="text-blue-700 text-sm">
                        ⚠️ Ce groupe nécessite une approbation. Votre demande sera examinée par l&apos;organisateur.
                      </p>
                    )}
                  </div>

                  {group.admissionQuestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Questions d&apos;admission</h4>
                      <div className="space-y-4">
                        {group.admissionQuestions.map((question) => (
                          <div key={question.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {question.question}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {question.type === 'text' ? (
                              <textarea
                                value={requestAnswers[question.id] as string || ''}
                                onChange={(e) => setRequestAnswers(prev => ({
                                  ...prev,
                                  [question.id]: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                rows={3}
                                placeholder="Votre réponse..."
                              />
                            ) : question.type === 'choice' ? (
                              <select
                                value={requestAnswers[question.id] as string || ''}
                                onChange={(e) => setRequestAnswers(prev => ({
                                  ...prev,
                                  [question.id]: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              >
                                <option value="">Sélectionnez une option</option>
                                {question.options?.map((option, index) => (
                                  <option key={index} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="space-y-2">
                                {question.options?.map((option, index) => (
                                  <label key={index} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={(requestAnswers[question.id] as string[] || []).includes(option)}
                                      onChange={(e) => {
                                        const currentAnswers = requestAnswers[question.id] as string[] || [];
                                        if (e.target.checked) {
                                          setRequestAnswers(prev => ({
                                            ...prev,
                                            [question.id]: [...currentAnswers, option]
                                          }));
                                        } else {
                                          setRequestAnswers(prev => ({
                                            ...prev,
                                            [question.id]: currentAnswers.filter(a => a !== option)
                                          }));
                                        }
                                      }}
                                      className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1 smaaks-btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        const answers = group.admissionQuestions.map(q => ({
                          questionId: q.id,
                          answer: requestAnswers[q.id] || (q.type === 'multipleChoice' ? [] : '')
                        }));
                        submitJoinRequest(answers);
                      }}
                      disabled={joinLoading}
                      className="flex-1 smaaks-btn-primary disabled:opacity-50"
                    >
                      {joinLoading ? 'Envoi...' : 'Envoyer la demande'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />

        {/* Delete Group Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                ⚠️ Supprimer le groupe
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Attention :</strong> Cette action est irréversible. Toutes les données du groupe seront définitivement supprimées.
                </p>

                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    • Tous les membres seront supprimés<br/>
                    • Toutes les données seront perdues<br/>
                    • Cette action ne peut pas être annulée
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pour confirmer, tapez le nom du groupe : <strong>{group?.name}</strong>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={group?.name}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteGroup}
                    disabled={deleteLoading || deleteConfirmText !== group?.name}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback modal pour le signalement */}
        {showFallback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vous n&apos;arrivez pas à envoyer l&apos;email ?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Si votre client mail ne s&apos;est pas ouvert automatiquement, vous
                pouvez nous contacter manuellement :
              </p>

              <div className="p-3 bg-gray-100 rounded-md mb-4">
                <p className="font-medium text-gray-800">contact@smaaks.fr</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("contact@smaaks.fr");
                    alert("Adresse copiée !");
                  }}
                  className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-md text-xs hover:bg-purple-700"
                >
                  Copier l&apos;adresse
                </button>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowFallback(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}