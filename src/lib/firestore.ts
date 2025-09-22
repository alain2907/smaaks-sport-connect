import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Event, CreateEventData } from '@/types/event';
import { User } from '@/types/user';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  PARTICIPATIONS: 'participations',
  MESSAGES: 'messages'
} as const;

// Utilitaire pour convertir les timestamps Firestore
function convertTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
}

// Events Service
export class EventsService {
  static async createEvent(eventData: CreateEventData, creatorId: string): Promise<string> {
    if (!db) {
      console.error('Firestore not initialized');
      throw new Error('Firestore not initialized');
    }

    try {
      const event = {
        ...eventData,
        creatorId,
        participantIds: [creatorId],
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Creating event:', event);
      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), event);
      console.log('Event created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async getEvents(filters?: {
    sport?: string;
    location?: string;
    date?: Date;
    limit?: number;
  }): Promise<Event[]> {
    if (!db) {
      console.error('Firestore not initialized');
      throw new Error('Firestore not initialized');
    }

    try {
      // Requête la plus simple possible pour éviter tout index
      const eventsRef = collection(db, COLLECTIONS.EVENTS);

      console.log('Fetching events...');
      const querySnapshot = await getDocs(eventsRef);
      const events: Event[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Event);
      });

      // Trier et filtrer côté client
      let filteredEvents = events
        .filter(event => event.status === 'active')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      if (filters?.sport) {
        filteredEvents = filteredEvents.filter(event => event.sport === filters.sport);
      }

      if (filters?.location) {
        filteredEvents = filteredEvents.filter(event =>
          event.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.limit) {
        filteredEvents = filteredEvents.slice(0, filters.limit);
      }

      console.log('Events fetched:', filteredEvents.length);
      return filteredEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        date: convertTimestamp(data.date),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Event;
    }

    return null;
  }

  static async joinEvent(eventId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const currentParticipants = eventData.participantIds || [];

      if (!currentParticipants.includes(userId)) {
        const updatedParticipants = [...currentParticipants, userId];
        await updateDoc(eventRef, {
          participantIds: updatedParticipants,
          updatedAt: serverTimestamp()
        });
      }
    }
  }

  static async leaveEvent(eventId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const currentParticipants = eventData.participantIds || [];
      const updatedParticipants = currentParticipants.filter((id: string) => id !== userId);

      await updateDoc(eventRef, {
        participantIds: updatedParticipants,
        updatedAt: serverTimestamp()
      });
    }
  }

  static subscribeToEvents(
    callback: (events: Event[]) => void,
    filters?: { sport?: string; location?: string; limit?: number }
  ): () => void {
    if (!db) throw new Error('Firestore not initialized');

    // Requête la plus simple possible
    const eventsRef = collection(db, COLLECTIONS.EVENTS);

    return onSnapshot(eventsRef, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          date: convertTimestamp(data.date),
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt)
        } as Event);
      });

      // Trier et filtrer côté client
      let filteredEvents = events
        .filter(event => event.status === 'active')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      if (filters?.sport) {
        filteredEvents = filteredEvents.filter(event => event.sport === filters.sport);
      }

      if (filters?.location) {
        filteredEvents = filteredEvents.filter(event =>
          event.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.limit) {
        filteredEvents = filteredEvents.slice(0, filters.limit);
      }

      callback(filteredEvents);
    });
  }
}

// Users Service
export class UsersService {
  static async createOrUpdateUser(userId: string, userData: Partial<User>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          matchesPlayed: 0,
          sportsPlayed: 0,
          averageRating: 0
        }
      });
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as User;
    }

    return null;
  }

  static async updateUserStats(userId: string, stats: Partial<User['stats']>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      stats,
      updatedAt: serverTimestamp()
    });
  }
}

// Demo Data Creation
export class DemoDataService {
  static async createDemoEvents(): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const demoEvents = [
      {
        title: 'Football 5v5 - Terrain synthétique',
        sport: 'football',
        description: 'Match amical, niveau intermédiaire. Ambiance décontractée !',
        location: 'Stade Municipal, Paris 15e',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        maxParticipants: 10,
        skillLevel: 'intermediate',
        equipment: 'Crampons recommandés',
        creatorId: 'demo-user-1'
      },
      {
        title: 'Basket 3v3 - Playground',
        sport: 'basketball',
        description: 'Streetball, tous niveaux bienvenus. Venez avec de la motivation !',
        location: 'Terrain Javel, Paris 15e',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Demain
        maxParticipants: 6,
        skillLevel: 'all',
        equipment: 'Ballon fourni',
        creatorId: 'demo-user-2'
      },
      {
        title: 'Tennis - Simple messieurs',
        sport: 'tennis',
        description: 'Cherche partenaire niveau 15/1. Court en terre battue.',
        location: 'Tennis Club de Boulogne',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        maxParticipants: 2,
        skillLevel: 'advanced',
        equipment: 'Raquette et balles',
        creatorId: 'demo-user-3'
      },
      {
        title: 'Course à pied - 10km',
        sport: 'running',
        description: 'Run matinal au Bois de Vincennes. Rythme 5min/km.',
        location: 'Bois de Vincennes, entrée Château',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 1 semaine
        maxParticipants: 8,
        skillLevel: 'intermediate',
        equipment: 'Tenue de sport',
        creatorId: 'demo-user-4'
      },
      {
        title: 'Badminton - Double mixte',
        sport: 'badminton',
        description: 'Session badminton en salle. Cherche 2 joueurs pour double mixte.',
        location: 'Gymnase Jean Moulin, Paris 14e',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
        maxParticipants: 4,
        skillLevel: 'intermediate',
        equipment: 'Raquettes et volants fournis',
        creatorId: 'demo-user-1'
      }
    ];

    for (const eventData of demoEvents) {
      await this.createDemoEvent(eventData);
    }
  }

  private static async createDemoEvent(eventData: any): Promise<void> {
    const event = {
      ...eventData,
      participantIds: [eventData.creatorId],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db!, COLLECTIONS.EVENTS), event);
  }

  static async createDemoUser(userId: string, userData: Partial<User>): Promise<void> {
    await UsersService.createOrUpdateUser(userId, userData);
  }
}