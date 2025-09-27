export interface EventMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  status: 'visible' | 'hidden' | 'reported';
  reports?: MessageReport[];
  isOrganizer: boolean;
}

export interface MessageReport {
  userId: string;
  userName: string;
  reason: 'spam' | 'inappropriate' | 'offensive' | 'other';
  description?: string;
  createdAt: Date;
}

export interface CreateMessageData {
  eventId: string;
  content: string;
}