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
  sport: string;
  date: Date;
  location: string; // Simplified for demo
  maxParticipants: number;
  participantIds: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
  equipment?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
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

export type CreateEventData = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'participantIds' | 'status'>;