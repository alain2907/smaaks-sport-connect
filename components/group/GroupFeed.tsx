'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Group } from '@/types/models';
import { GroupPost, GroupComment, ReactionType, ReactionSummary } from '@/types/posts';

// Type pour le rôle de l'auteur
type AuthorRole = GroupPost['authorInfo']['role'];

interface GroupFeedProps {
  group: Group;
}

export default function GroupFeed({ group }: GroupFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<{ [postId: string]: GroupComment[] }>({});
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [commentLoading, setCommentLoading] = useState<{ [postId: string]: boolean }>({});

  // Check if user can post
  const isMember = group.members.some(member => member.uid === user?.uid && member.status === 'active');
  const isOwner = user?.uid === group.organizer.uid;
  const canPost = isMember || isOwner;

  // Get user role
  const getUserRole = (): AuthorRole => {
    if (isOwner) return 'owner';

    const r = group.members.find(m => m.uid === user?.uid)?.role;

    // On "narrow" explicitement vers l'union attendue
    switch (r) {
      case 'admin':
      case 'moderator':
      case 'member':
        return r;
      default:
        return 'member';
    }
  };

  // Helper for moderation permissions
  const canModerate = (role: AuthorRole) =>
    role === 'owner' || role === 'admin' || role === 'moderator';

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!group.id) return;

      try {
        const postsQuery = query(
          collection(db, 'groupPosts'),
          where('groupId', '==', group.id),
          orderBy('isPinned', 'desc'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts: GroupPost[] = [];

        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as GroupPost);
        });

        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [group.id]);

  // Create post
  const handleCreatePost = async () => {
    if (!user || (!newPostContent.trim() && !newPostImageUrl.trim())) return;

    setCreateLoading(true);
    try {
      const postData = {
        groupId: group.id,
        authorId: user.uid,
        authorInfo: {
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          photoURL: user.photoURL || undefined,
          role: getUserRole()
        },
        content: {
          ...(newPostContent.trim() && { text: newPostContent.trim() }),
          ...(newPostImageUrl.trim() && { images: [newPostImageUrl.trim()] })
        },
        isPinned: false,
        reactions: {},
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'groupPosts'), postData);

      // Add to local state
      const newPost: GroupPost = {
        id: docRef.id,
        ...postData
      };
      setPosts(prev => [newPost, ...prev]);

      // Envoyer notification push aux membres du groupe
      try {
        await fetch('/api/sendTopicNotification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `group_${group.id}`,
            title: "📢 Nouveau post dans votre groupe",
            body: `${postData.authorInfo.name} a publié quelque chose`
          }),
        });
      } catch (notificationError) {
        console.error('Erreur envoi notification:', notificationError);
      }

      setNewPostContent('');
      setNewPostImageUrl('');
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  // Toggle reaction
  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'groupPosts', postId);
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const userReactions = post.reactions[reactionType] || [];
      const hasReacted = userReactions.some(r => r.userId === user.uid);

      if (hasReacted) {
        // Remove reaction
        const updatedReactions = userReactions.filter(r => r.userId !== user.uid);
        await updateDoc(postRef, {
          [`reactions.${reactionType}`]: updatedReactions
        });
      } else {
        // Add reaction (remove any existing reaction first)
        const newReaction = {
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          createdAt: new Date()
        };

        // Remove user from all other reaction types
        const updates: Record<string, unknown> = {};
        Object.keys(post.reactions).forEach(type => {
          if (type !== reactionType) {
            const filtered = post.reactions[type].filter(r => r.userId !== user.uid);
            updates[`reactions.${type}`] = filtered;
          }
        });

        // Add new reaction
        updates[`reactions.${reactionType}`] = arrayUnion(newReaction);

        await updateDoc(postRef, updates);
      }

      // Update local state
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const newReactions = { ...p.reactions };

          // Remove user from all reaction types
          Object.keys(newReactions).forEach(type => {
            newReactions[type] = newReactions[type].filter(r => r.userId !== user.uid);
          });

          // Add new reaction if not removing
          if (!hasReacted) {
            if (!newReactions[reactionType]) newReactions[reactionType] = [];
            newReactions[reactionType].push({
              type: reactionType,
              userId: user.uid,
              userName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
              createdAt: new Date()
            });
          }

          return { ...p, reactions: newReactions };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // Pin/Unpin post
  const handlePinPost = async (postId: string) => {
    if (!user || !canModerate(getUserRole())) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const postRef = doc(db, 'groupPosts', postId);
      await updateDoc(postRef, {
        isPinned: !post.isPinned,
        updatedAt: new Date()
      });

      // Update local state
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, isPinned: !p.isPinned } : p
      ).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const commentsQuery = query(
        collection(db, 'groupComments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(commentsQuery);
      const fetchedComments: GroupComment[] = [];

      querySnapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() } as GroupComment);
      });

      setComments(prev => ({ ...prev, [postId]: fetchedComments }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add comment
  const handleAddComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const commentData = {
        postId,
        groupId: group.id,
        authorId: user.uid,
        authorInfo: {
          name: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
          photoURL: user.photoURL || undefined,
          role: getUserRole()
        },
        content: {
          text: newComment[postId].trim()
        },
        reactions: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'groupComments'), commentData);

      // Update post comments count
      await updateDoc(doc(db, 'groupPosts', postId), {
        commentsCount: increment(1)
      });

      // Add to local state
      const newCommentDoc: GroupComment = {
        id: docRef.id,
        ...commentData
      };

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentDoc]
      }));

      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ));

      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (expandedComments.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
    setExpandedComments(newExpanded);
  };

  // Get reaction summary
  const getReactionSummary = (post: GroupPost): ReactionSummary[] => {
    const reactionEmojis: { [key in ReactionType]: string } = {
      like: '👍',
      love: '❤️',
      laugh: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😠'
    };

    return Object.entries(post.reactions)
      .filter(([_, reactions]) => reactions.length > 0)
      .map(([type, reactions]) => ({
        type: type as ReactionType,
        count: reactions.length,
        userReacted: reactions.some(r => r.userId === user?.uid),
        emoji: reactionEmojis[type as ReactionType]
      }))
      .sort((a, b) => b.count - a.count);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="smaaks-card animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {canPost && (
        <div className="smaaks-card">
          {!showCreatePost ? (
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-gray-500 flex-1">Partagez quelque chose avec le groupe...</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="space-y-3">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Partagez vos pensées avec le groupe..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <input
                      type="url"
                      value={newPostImageUrl}
                      onChange={(e) => setNewPostImageUrl(e.target.value)}
                      placeholder="URL d'une image (optionnel) - Ex: https://example.com/image.jpg"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {newPostImageUrl.trim() && (
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">Aperçu de l&apos;image :</p>
                        <img
                          src={newPostImageUrl}
                          alt="Aperçu"
                          className="max-h-32 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-red-500 text-sm p-2';
                            errorDiv.textContent = 'URL d\'image invalide';
                            target.parentNode?.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-500">
                  <span className="text-sm">
                    <svg className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Collez l&apos;URL d&apos;une image
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPostContent('');
                      setNewPostImageUrl('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={(!newPostContent.trim() && !newPostImageUrl.trim()) || createLoading}
                    className="smaaks-btn-primary px-6 py-2 disabled:opacity-50"
                  >
                    {createLoading ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="smaaks-card text-center py-12">
            <div className="smaaks-icon-circle secondary mx-auto mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune publication</h3>
            <p className="text-gray-600">
              {canPost
                ? "Soyez le premier à partager quelque chose avec le groupe !"
                : "Les membres du groupe n'ont encore rien partagé."
              }
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={`smaaks-card ${post.isPinned ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}`}>
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {post.authorInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{post.authorInfo.name}</h4>
                      {post.authorInfo.role === 'owner' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          Organisateur
                        </span>
                      )}
                      {post.authorInfo.role === 'admin' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                      {post.authorInfo.role === 'moderator' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Modérateur
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {post.createdAt instanceof Date
                        ? post.createdAt.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : new Date(post.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                      }
                      {post.isPinned && (
                        <span className="ml-2 text-yellow-600">📌 Épinglé</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Post Actions */}
                {(user?.uid === post.authorId || canModerate(getUserRole())) && (
                  <div className="flex items-center space-x-2">
                    {canModerate(getUserRole()) && (
                      <button
                        onClick={() => handlePinPost(post.id)}
                        className={`p-2 rounded-full hover:bg-gray-100 ${
                          post.isPinned ? 'text-yellow-600' : 'text-gray-400'
                        }`}
                        title={post.isPinned ? 'Désépingler' : 'Épingler'}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v1.816a2 2 0 00.586 1.414l2.828 2.828A2 2 0 006.828 12H9v4a1 1 0 102 0v-4h2.172a2 2 0 001.414-.586l2.828-2.828A2 2 0 0018 7.816V6a2 2 0 00-2-2H4z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Post Content */}
              {post.content.text && (
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {post.content.text}
                  </p>
                </div>
              )}

              {/* Post Images */}
              {post.content.images && post.content.images.length > 0 && (
                <div className="mb-4">
                  <div className="grid gap-2 max-w-lg">
                    {post.content.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1} du post`}
                          className="w-full rounded-lg shadow-sm border border-gray-200 object-cover max-h-96"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'bg-gray-100 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm';
                            errorDiv.innerHTML = '📷 Image non disponible<br><span class="text-xs">' + imageUrl + '</span>';
                            target.parentNode?.appendChild(errorDiv);
                          }}
                          onClick={() => {
                            // Ouvrir en modal ou nouvel onglet
                            window.open(imageUrl, '_blank');
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions & Comments Summary */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  {getReactionSummary(post).length > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {getReactionSummary(post).slice(0, 3).map((reaction) => (
                          <span key={reaction.type} className="text-lg">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                      <span>{getReactionSummary(post).reduce((sum, r) => sum + r.count, 0)}</span>
                    </div>
                  )}
                  {post.commentsCount > 0 && (
                    <span>{post.commentsCount} commentaire{post.commentsCount > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-around border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-1">
                  {(['like', 'love', 'laugh'] as ReactionType[]).map((reactionType) => {
                    const emojis: Record<ReactionType, string> = {
                      like: '👍',
                      love: '❤️',
                      laugh: '😂',
                      wow: '😮',
                      sad: '😢',
                      angry: '😡'
                    };
                    const userReacted = post.reactions[reactionType]?.some(r => r.userId === user?.uid);

                    return (
                      <button
                        key={reactionType}
                        onClick={() => handleReaction(post.id, reactionType)}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                          userReacted ? 'bg-purple-100 text-purple-600' : 'text-gray-600'
                        }`}
                      >
                        <span className="text-lg">{emojis[reactionType]}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm text-gray-600">Commenter</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {/* Existing Comments */}
                  {comments[post.id] && comments[post.id].length > 0 && (
                    <div className="space-y-4 mb-4">
                      {comments[post.id].map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {comment.authorInfo.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-semibold text-sm text-gray-900">{comment.authorInfo.name}</h5>
                                {comment.authorInfo.role === 'owner' && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    Organisateur
                                  </span>
                                )}
                                {comment.authorInfo.role === 'admin' && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    Admin
                                  </span>
                                )}
                                {comment.authorInfo.role === 'moderator' && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Mod
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-800">{comment.content.text}</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>
                                {comment.createdAt instanceof Date
                                  ? comment.createdAt.toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                }
                              </span>
                              <button className="hover:text-purple-600 font-medium">
                                J&apos;aime
                              </button>
                              <button className="hover:text-purple-600 font-medium">
                                Répondre
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  {canPost && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <textarea
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Écrivez un commentaire..."
                            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                            rows={2}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment[post.id]?.trim() || commentLoading[post.id]}
                            className="absolute bottom-2 right-2 p-1 text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {commentLoading[post.id] ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Appuyez sur Entrée pour envoyer</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}