import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { EventMessage, CreateMessageData, MessageReport } from '../types/message';

// Configuration à personnaliser selon votre projet
export const COLLECTIONS = {
  EVENT_MESSAGES: 'event_messages',
  EVENTS: 'events',
  USERS: 'users'
};

// Variables à configurer selon votre projet
let db: any = null;
let auth: any = null;

// Fonction d'initialisation à appeler depuis votre projet
export function initializeFirestore(firestore: any, firebaseAuth: any) {
  db = firestore;
  auth = firebaseAuth;
}

// Utilitaire de conversion des timestamps
function convertTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}

// Service utilisateur - à adapter selon votre implémentation
class UsersService {
  static async getUserById(userId: string): Promise<any> {
    if (!db) throw new Error('Firestore not initialized');

    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}

// Service événement - à adapter selon votre implémentation
class EventsService {
  static async getEventById(eventId: string): Promise<any> {
    if (!db) throw new Error('Firestore not initialized');

    try {
      const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        const data = eventSnap.data();
        return {
          id: eventSnap.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }
}

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