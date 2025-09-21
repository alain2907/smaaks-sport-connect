// Mode permissif temporaire pour permettre la migration progressive

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  externalLinks?: {
    whatsapp?: string;
    discord?: string;
    telegram?: string;
    website?: string;
    other?: { name: string; url: string }[];
  };
  location?: {
    city: string;
    region: string;
    country: string;
    [key: string]: any;
  };
  settings?: {
    isPrivate: boolean;
    requiresApproval: boolean;
    maxMembers?: number;
    [key: string]: any;
  };
  organizer?: {
    uid: string;
    name: string;
    email: string;
    [key: string]: any;
  };
  members?: any[];
  stats?: {
    memberCount: number;
    [key: string]: any;
  };
  [key: string]: any; // Permissif temporaire
}

export interface MembershipRequest {
  id: string;
  groupId: string;
  userId: string;
  userInfo?: {
    name: string;
    email: string;
    photoURL?: string;
    [key: string]: any;
  };
  status?: 'pending' | 'approved' | 'rejected';
  [key: string]: any; // Permissif temporaire
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  joinedGroups?: string[];
  preferences?: {
    notifications: boolean;
    language: string;
    [key: string]: any;
  };
  [key: string]: any; // Permissif temporaire
}

export type UserMode = 'normal' | 'matching' | 'groups';