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

export interface ParticipantRequest {
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  sport: string;
  date: Date;
  location: string; // Simplified for demo
  maxParticipants: number;
  participantIds: string[]; // Keep for compatibility - approved participants only
  participantRequests: ParticipantRequest[]; // New: all requests with status
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

export type CreateEventData = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'participantIds' | 'participantRequests' | 'status'>;