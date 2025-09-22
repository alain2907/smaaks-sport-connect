import { SportLevel } from './sport';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  favoriteSports?: string[];
  skillLevels?: Record<string, SportLevel>;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    matchesPlayed: number;
    sportsPlayed: number;
    averageRating: number;
  };
  preferences?: {
    notifications: boolean;
    publicProfile: boolean;
    showLocation: boolean;
    maxDistance: number;
  };
}

// Keeping the old interface for backward compatibility
export type UserProfile = User;

export type CreateUserProfile = Omit<UserProfile, 'id' | 'createdAt' | 'lastActive' | 'stats'>;