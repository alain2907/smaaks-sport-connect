import { SportLevel } from './sport';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: {
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  favoriteSports: string[]; // Sport IDs
  sportLevels: Record<string, SportLevel>; // Sport ID -> Level
  createdAt: string;
  lastActive: string;
  stats: {
    eventsCreated: number;
    eventsJoined: number;
    rating: number;
    reviewCount: number;
  };
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    showLocation: boolean;
    maxDistance: number; // km for suggestions
  };
}

export type CreateUserProfile = Omit<UserProfile, 'id' | 'createdAt' | 'lastActive' | 'stats'>;