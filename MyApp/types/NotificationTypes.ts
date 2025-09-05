// types/NotificationTypes.ts

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  message: string;
  timestamp: Date;
  read: boolean;
  postId?: string;
  userId: string;
  fromUsername: string;
}