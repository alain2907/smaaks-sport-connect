export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  authorInfo: {
    name: string;
    photoURL?: string;
    role: 'member' | 'moderator' | 'admin' | 'owner';
  };
  content: {
    text?: string;
    images?: string[];
  };
  isPinned: boolean;
  reactions: {
    [key: string]: {
      type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
      userId: string;
      userName: string;
      createdAt: Date;
    }[];
  };
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

export interface GroupComment {
  id: string;
  postId: string;
  groupId: string;
  authorId: string;
  authorInfo: {
    name: string;
    photoURL?: string;
    role: 'member' | 'moderator' | 'admin' | 'owner';
  };
  content: {
    text: string;
    images?: string[];
  };
  reactions: {
    [key: string]: {
      type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
      userId: string;
      userName: string;
      createdAt: Date;
    }[];
  };
  parentCommentId?: string; // For replies
  repliesCount?: number;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface ReactionSummary {
  type: ReactionType;
  count: number;
  userReacted: boolean;
  emoji: string;
}