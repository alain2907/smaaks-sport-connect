'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UsersService } from '@/lib/firestore';
import { User } from '@/types/user';

export function useUserProfile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser) {
        setUserProfile(null);
        setHasUsername(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await UsersService.getUserById(authUser.uid);
        setUserProfile(profile);
        setHasUsername(!!profile?.username);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
        setHasUsername(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadUserProfile();
    }
  }, [authUser, authLoading]);

  const refreshProfile = async () => {
    if (!authUser) return;

    try {
      const profile = await UsersService.getUserById(authUser.uid);
      setUserProfile(profile);
      setHasUsername(!!profile?.username);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return {
    userProfile,
    hasUsername,
    loading: loading || authLoading,
    refreshProfile
  };
}