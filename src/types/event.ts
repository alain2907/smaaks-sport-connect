import { SportLevel } from './sport';

export interface Location {
  address: string;
  city: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  sport: string; // Sport ID
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format
  location: Location;
  maxPlayers: number;
  currentPlayers: number;
  level?: SportLevel;
  price?: number;
  equipment?: string[];
  createdBy: string; // User ID
  createdAt: string;
  participants: string[]; // User IDs
  status: 'active' | 'cancelled' | 'completed' | 'full';
}

export interface EventFilters {
  sport?: string;
  date?: string;
  location?: string;
  level?: SportLevel;
  maxDistance?: number; // km
  availableOnly?: boolean;
}

export type CreateEventData = Omit<Event, 'id' | 'createdAt' | 'currentPlayers' | 'participants' | 'status'>;