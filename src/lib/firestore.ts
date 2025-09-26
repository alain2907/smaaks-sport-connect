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
import { db, auth } from './firebase';
import { Event, CreateEventData, ParticipantRequest } from '@/types/event';
import { User, PublicUserProfile } from '@/types/user';
import { EventMessage, CreateMessageData, MessageReport } from '@/types/message';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  PARTICIPATIONS: 'participations',
  MESSAGES: 'messages',
  EVENT_MESSAGES: 'event_messages'
} as const;

// Utilitaire pour convertir les timestamps Firestore
function convertTimestamp(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as { toDate: () => Date }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp instanceof Date) return timestamp;
  return new Date(String(timestamp));
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
        participantIds: [creatorId], // Creator is automatically approved
        participantRequests: [], // Start with empty requests
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
          // Ensure compatibility with old events and convert timestamps
          participantRequests: (data.participantRequests || []).map((req: Record<string, unknown>) => ({
            ...req,
            requestedAt: convertTimestamp(req.requestedAt),
            respondedAt: req.respondedAt ? convertTimestamp(req.respondedAt) : undefined
          })),
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
        // Ensure compatibility with old events and convert timestamps
        participantRequests: (data.participantRequests || []).map((req: Record<string, unknown>) => ({
          ...req,
          requestedAt: convertTimestamp(req.requestedAt),
          respondedAt: req.respondedAt ? convertTimestamp(req.respondedAt) : undefined
        })) as ParticipantRequest[],
        date: convertTimestamp(data.date),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Event;
    }

    return null;
  }

  static async requestToJoinEvent(eventId: string, userId: string): Promise<void> {
    if (!db || !auth?.currentUser) throw new Error('Firestore or Auth not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const currentRequests: ParticipantRequest[] = eventData.participantRequests || [];
      const user = auth.currentUser;

      // Check if user already has a request
      const existingRequest = currentRequests.find(req => req.userId === userId);
      if (existingRequest) {
        throw new Error('Demande déjà envoyée');
      }

      // Check if user is already approved
      if (eventData.participantIds?.includes(userId)) {
        throw new Error('Vous participez déjà à cet événement');
      }

      // Get user data to get username
      const userData = await UsersService.getUserById(userId);

      // Create new request
      const newRequest: ParticipantRequest = {
        userId,
        userName: userData?.username || userData?.displayName || user.displayName || 'Utilisateur',
        userEmail: user.email || '',
        status: 'pending',
        requestedAt: new Date()
      };

      const updatedRequests = [...currentRequests, newRequest];
      await updateDoc(eventRef, {
        participantRequests: updatedRequests,
        updatedAt: serverTimestamp()
      });
    }
  }

  static async joinEvent(eventId: string, userId: string): Promise<void> {
    // Keep this method for backward compatibility - now it creates a request
    await this.requestToJoinEvent(eventId, userId);
  }

  static async leaveEvent(eventId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const currentParticipants = eventData.participantIds || [];
      const currentRequests: ParticipantRequest[] = eventData.participantRequests || [];

      // Remove from participants list
      const updatedParticipants = currentParticipants.filter((id: string) => id !== userId);

      // Remove from requests list
      const updatedRequests = currentRequests.filter(req => req.userId !== userId);

      await updateDoc(eventRef, {
        participantIds: updatedParticipants,
        participantRequests: updatedRequests,
        updatedAt: serverTimestamp()
      });
    }
  }

  // New methods for managing participant requests
  static async approveParticipantRequest(eventId: string, userId: string, organizerId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();

      // Check if user is the organizer
      if (eventData.creatorId !== organizerId) {
        throw new Error('Seul l\'organisateur peut approuver les demandes');
      }

      const currentRequests: ParticipantRequest[] = eventData.participantRequests || [];
      const currentParticipants = eventData.participantIds || [];

      // Check if event is full
      if (currentParticipants.length >= eventData.maxParticipants) {
        throw new Error('L\'événement est complet');
      }

      // Find and update the request
      const updatedRequests = currentRequests.map(req => {
        if (req.userId === userId) {
          return { ...req, status: 'approved' as const, respondedAt: new Date() };
        }
        return req;
      });

      // Add user to participants if not already there
      const updatedParticipants = currentParticipants.includes(userId)
        ? currentParticipants
        : [...currentParticipants, userId];

      await updateDoc(eventRef, {
        participantIds: updatedParticipants,
        participantRequests: updatedRequests,
        updatedAt: serverTimestamp()
      });
    }
  }

  static async rejectParticipantRequest(eventId: string, userId: string, organizerId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();

      // Check if user is the organizer
      if (eventData.creatorId !== organizerId) {
        throw new Error('Seul l\'organisateur peut rejeter les demandes');
      }

      const currentRequests: ParticipantRequest[] = eventData.participantRequests || [];

      // Find and update the request
      const updatedRequests = currentRequests.map(req => {
        if (req.userId === userId) {
          return { ...req, status: 'rejected' as const, respondedAt: new Date() };
        }
        return req;
      });

      await updateDoc(eventRef, {
        participantRequests: updatedRequests,
        updatedAt: serverTimestamp()
      });
    }
  }

  static async updateEvent(eventId: string, updates: Partial<Omit<Event, 'id' | 'creatorId' | 'participantIds' | 'status' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);

    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
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
          // Ensure compatibility with old events and convert timestamps
          participantRequests: (data.participantRequests || []).map((req: Record<string, unknown>) => ({
            ...req,
            requestedAt: convertTimestamp(req.requestedAt),
            respondedAt: req.respondedAt ? convertTimestamp(req.respondedAt) : undefined
          })),
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

  static async getUserEvents(userId: string): Promise<{ created: Event[]; participating: Event[]; pending: Event[]; past: Event[] }> {
    if (!db) throw new Error('Firestore not initialized');

    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const querySnapshot = await getDocs(eventsRef);

    const created: Event[] = [];
    const participating: Event[] = [];
    const pending: Event[] = [];
    const past: Event[] = [];
    const now = new Date();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event = {
        id: doc.id,
        ...data,
        // Ensure compatibility with old events and convert timestamps
        participantRequests: (data.participantRequests || []).map((req: Record<string, unknown>) => ({
          ...req,
          requestedAt: convertTimestamp(req.requestedAt),
          respondedAt: req.respondedAt ? convertTimestamp(req.respondedAt) : undefined
        })),
        date: convertTimestamp(data.date),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as Event;

      const eventDate = new Date(event.date);
      const isPastEvent = eventDate < now;

      // Événements créés par l'utilisateur
      if (event.creatorId === userId) {
        if (isPastEvent) {
          past.push(event);
        } else if (event.status === 'active') {
          created.push(event);
        }
      }
      // Événements où l'utilisateur participe (approuvé) - seulement actifs
      else if (event.status === 'active' && !isPastEvent && event.participantIds && event.participantIds.includes(userId)) {
        participating.push(event);
      }
      // Événements où l'utilisateur a une demande en attente - seulement actifs
      else if (event.status === 'active' && !isPastEvent && event.participantRequests) {
        const userRequest = event.participantRequests.find(req => req.userId === userId && req.status === 'pending');
        if (userRequest) {
          pending.push(event);
        }
      }
    });

    // Trier par date de création (plus récents d'abord)
    created.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    participating.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    pending.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    past.sort((a, b) => b.date.getTime() - a.date.getTime());

    return { created, participating, pending, past };
  }

  static async cancelParticipationRequest(eventId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Événement introuvable');
    }

    const eventData = eventDoc.data();
    const participantRequests = eventData.participantRequests || [];

    // Filtrer pour supprimer la demande de l'utilisateur
    const updatedRequests = participantRequests.filter((req: ParticipantRequest) => req.userId !== userId);

    await updateDoc(eventRef, {
      participantRequests: updatedRequests,
      updatedAt: serverTimestamp()
    });
  }


  static async deleteEvent(eventId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Événement introuvable');
    }

    const eventData = eventDoc.data();

    // Vérifier que l'utilisateur est bien le créateur
    if (eventData.creatorId !== userId) {
      throw new Error('Seul le créateur peut supprimer cet événement');
    }

    // Supprimer l'événement
    await deleteDoc(eventRef);
  }

  static async rescheduleEvent(eventId: string, userId: string, newDate: Date, newLocation?: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      throw new Error('Événement introuvable');
    }

    const eventData = eventDoc.data();

    // Vérifier que l'utilisateur est bien le créateur
    if (eventData.creatorId !== userId) {
      throw new Error('Seul le créateur peut reprogrammer cet événement');
    }

    // Vérifier que l'événement est passé ou annulé
    const eventDate = new Date(eventData.date.seconds * 1000);
    const now = new Date();

    if (eventDate > now && eventData.status === 'active') {
      throw new Error('Seuls les événements passés ou annulés peuvent être reprogrammés');
    }

    // Mettre à jour l'événement avec la nouvelle date et réactiver
    const updateData: Record<string, unknown> = {
      date: newDate,
      status: 'active',
      updatedAt: serverTimestamp()
    };

    // Mettre à jour la localisation si fournie
    if (newLocation) {
      updateData.location = newLocation;
    }

    await updateDoc(eventRef, updateData);
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
      // Generate username if not provided
      const username = userData.username || await this.generateUniqueUsername(userData.email || userId);

      await updateDoc(userRef, {
        ...userData,
        username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
          matchesPlayed: 0,
          sportsPlayed: 0,
          averageRating: 0
        },
        preferences: {
          notifications: true,
          publicProfile: true,
          showLocation: false,
          maxDistance: 10,
          ...userData.preferences
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

  static async getPublicUserProfile(userId: string): Promise<PublicUserProfile | null> {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Only return public profile if user allows it
      if (data.preferences?.publicProfile === false) {
        return null;
      }

      return {
        id: docSnap.id,
        username: data.username,
        displayName: data.displayName,
        avatar: data.avatar,
        bio: data.bio,
        location: data.preferences?.showLocation ? data.location : undefined,
        favoriteSports: data.favoriteSports,
        skillLevels: data.skillLevels,
        stats: data.stats || { matchesPlayed: 0, sportsPlayed: 0, averageRating: 0 },
        preferences: {
          showLocation: data.preferences?.showLocation || false
        }
      };
    }

    return null;
  }

  static async getPublicUserProfileByUsername(username: string): Promise<PublicUserProfile | null> {
    if (!db) throw new Error('Firestore not initialized');

    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await getDocs(usersRef);

    // Find user by username (we would use a proper query with an index in production)
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.username === username) {
        // Check if profile is public
        if (data.preferences?.publicProfile === false) {
          return null;
        }

        return {
          id: docSnap.id,
          username: data.username,
          displayName: data.displayName,
          avatar: data.avatar,
          bio: data.bio,
          location: data.preferences?.showLocation ? data.location : undefined,
          favoriteSports: data.favoriteSports,
          skillLevels: data.skillLevels,
          stats: data.stats || { matchesPlayed: 0, sportsPlayed: 0, averageRating: 0 },
          preferences: {
            showLocation: data.preferences?.showLocation || false
          }
        };
      }
    }

    return null;
  }

  static async generateUniqueUsername(email: string): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');

    // Generate base username from email
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let counter = 1;

    // Check if username exists and increment until we find a unique one
    while (await this.isUsernameTaken(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  static async isUsernameTaken(username: string): Promise<boolean> {
    if (!db) throw new Error('Firestore not initialized');

    const usersRef = collection(db, COLLECTIONS.USERS);
    const querySnapshot = await getDocs(usersRef);

    let exists = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.username === username) {
        exists = true;
      }
    });

    return exists;
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

  private static async createDemoEvent(eventData: Record<string, unknown>): Promise<void> {
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

// Messages Service
export class MessagesService {
  static async createMessage(messageData: CreateMessageData, userId: string): Promise<string> {
    if (!db || !auth?.currentUser) throw new Error('Firestore or Auth not initialized');

    try {
      // Get event to check if user is organizer
      const event = await EventsService.getEventById(messageData.eventId);
      if (!event) throw new Error('Événement introuvable');

      // Check if user is participant or organizer
      const isOrganizer = event.creatorId === userId;
      const isParticipant = event.participantIds?.includes(userId);

      if (!isOrganizer && !isParticipant) {
        throw new Error('Seuls les participants peuvent envoyer des messages');
      }

      // Get user data
      const userData = await UsersService.getUserById(userId);

      const message = {
        ...messageData,
        userId,
        userName: userData?.username || userData?.displayName || auth.currentUser.displayName || 'Utilisateur',
        userAvatar: userData?.avatar || auth.currentUser.photoURL || null,
        status: 'visible',
        isOrganizer,
        reports: [],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.EVENT_MESSAGES), message);
      return docRef.id;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async getEventMessages(eventId: string): Promise<EventMessage[]> {
    if (!db) throw new Error('Firestore not initialized');

    try {
      const messagesRef = collection(db, COLLECTIONS.EVENT_MESSAGES);
      const querySnapshot = await getDocs(messagesRef);
      const messages: EventMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.eventId === eventId) {
          messages.push({
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined,
            reports: data.reports || []
          } as EventMessage);
        }
      });

      // Sort by creation date (newest first)
      return messages
        .filter(msg => msg.status !== 'hidden') // Don't show hidden messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async moderateMessage(messageId: string, action: 'hide' | 'show', organizerId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const messageRef = doc(db, COLLECTIONS.EVENT_MESSAGES, messageId);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
      throw new Error('Message introuvable');
    }

    const messageData = messageSnap.data();

    // Get event to verify organizer
    const event = await EventsService.getEventById(messageData.eventId);
    if (!event || event.creatorId !== organizerId) {
      throw new Error('Seul l\'organisateur peut modérer les messages');
    }

    await updateDoc(messageRef, {
      status: action === 'hide' ? 'hidden' : 'visible',
      updatedAt: serverTimestamp()
    });
  }

  static async reportMessage(messageId: string, userId: string, reason: MessageReport['reason'], description?: string): Promise<void> {
    if (!db || !auth?.currentUser) throw new Error('Firestore or Auth not initialized');

    const messageRef = doc(db, COLLECTIONS.EVENT_MESSAGES, messageId);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
      throw new Error('Message introuvable');
    }

    const messageData = messageSnap.data();
    const currentReports: MessageReport[] = messageData.reports || [];

    // Check if user already reported
    if (currentReports.some(report => report.userId === userId)) {
      throw new Error('Vous avez déjà signalé ce message');
    }

    // Get user data
    const userData = await UsersService.getUserById(userId);

    const newReport: MessageReport = {
      userId,
      userName: userData?.username || userData?.displayName || auth.currentUser.displayName || 'Utilisateur',
      reason,
      description: description || '',
      createdAt: new Date()
    };

    const updatedReports = [...currentReports, newReport];

    // Auto-hide if 3 or more reports
    const newStatus = updatedReports.length >= 3 ? 'reported' : messageData.status;

    await updateDoc(messageRef, {
      reports: updatedReports,
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const messageRef = doc(db, COLLECTIONS.EVENT_MESSAGES, messageId);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
      throw new Error('Message introuvable');
    }

    const messageData = messageSnap.data();

    // Only message author or event organizer can delete
    if (messageData.userId !== userId) {
      // Check if user is the event organizer
      const event = await EventsService.getEventById(messageData.eventId);
      if (!event || event.creatorId !== userId) {
        throw new Error('Seul l\'auteur ou l\'organisateur peut supprimer ce message');
      }
    }

    await deleteDoc(messageRef);
  }

  static subscribeToEventMessages(
    eventId: string,
    callback: (messages: EventMessage[]) => void
  ): () => void {
    if (!db) throw new Error('Firestore not initialized');

    const messagesRef = collection(db, COLLECTIONS.EVENT_MESSAGES);

    return onSnapshot(messagesRef, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const messages: EventMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.eventId === eventId) {
          messages.push({
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined,
            reports: data.reports || []
          } as EventMessage);
        }
      });

      // Retourner TOUS les messages - le filtrage se fait côté composant
      const sortedMessages = messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      callback(sortedMessages);
    });
  }
}