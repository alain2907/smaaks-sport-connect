import { SportLevel } from './sport';

export interface User {
  id: string;
  email: string;
  username: string; // Unique username for public display
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

// Public profile interface (excludes sensitive information)
export interface PublicUserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  favoriteSports?: string[];
  skillLevels?: Record<string, SportLevel>;
  stats: {
    matchesPlayed: number;
    sportsPlayed: number;
    averageRating: number;
  };
  preferences?: {
    showLocation: boolean;
  };
}

// Keeping the old interface for backward compatibility
export type UserProfile = User;

export type CreateUserProfile = Omit<UserProfile, 'id' | 'createdAt' | 'lastActive' | 'stats'>;