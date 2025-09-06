// firebaseService.ts - Updated to use Cloudinary
import { collection, addDoc, getDocs, getDoc, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, where, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { CloudinaryService } from './CloudinaryService';

export interface WeeklySlots {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface UserSchedule {
  weeklySlots: WeeklySlots;
  lastUpdated: any;
  userId: string;
}

export interface FoodPost {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  userId: string;
  username: string;
  timestamp: any;
  likes: string[];
  comments: Comment[];
  category: string;
  tags: string[];
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: any;
}

export interface FirebaseNotification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  message: string;
  read: boolean;
  postId?: string;
  userId: string;
  fromUserId: string;
  fromUsername: string;
  timestamp: any;
}

const COLLECTION_NAME = 'userSchedules';

// Weekly slots functions
export const saveWeeklySlots = async (userId: string, slots: WeeklySlots): Promise<void> => {
  try {
    const userScheduleRef = doc(db, COLLECTION_NAME, userId);
    const scheduleData: UserSchedule = {
      weeklySlots: slots,
      lastUpdated: serverTimestamp(),
      userId: userId
    };
    await setDoc(userScheduleRef, scheduleData, { merge: true });
    console.log('Weekly slots saved successfully');
  } catch (error) {
    console.error('Error saving weekly slots:', error);
    throw new Error('Failed to save weekly slots');
  }
};

export const loadWeeklySlots = async (userId: string): Promise<WeeklySlots | null> => {
  try {
    const userScheduleRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(userScheduleRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserSchedule;
      console.log('Weekly slots loaded successfully');
      return data.weeklySlots;
    } else {
      console.log('No saved weekly slots found');
      return null;
    }
  } catch (error) {
    console.error('Error loading weekly slots:', error);
    throw new Error('Failed to load weekly slots');
  }
};

export const updateDaySlots = async (userId: string, day: keyof WeeklySlots, slots: number): Promise<void> => {
  try {
    const userScheduleRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userScheduleRef, {
      [`weeklySlots.${day}`]: slots,
      lastUpdated: serverTimestamp()
    });
    console.log(`${day} slots updated successfully`);
  } catch (error) {
    console.error(`Error updating ${day} slots:`, error);
    throw new Error(`Failed to update ${day} slots`);
  }
};

export const hasUserSchedule = async (userId: string): Promise<boolean> => {
  try {
    const userScheduleRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(userScheduleRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking user schedule:', error);
    return false;
  }
};

class FirebaseService {
  private currentUserId: string = '';
  private isInitialized: boolean = false;

  constructor() {
    this.generateDemoUser();
    this.initializeAuth();
  }

  async deletePost(postId: string): Promise<void> {
  try {
    // Delete the post document from Firestore
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    
    // Optional: Delete related notifications for this post
    await this.deletePostNotifications(postId);
    
    console.log('Post deleted successfully:', postId);
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
}

// Helper method to delete notifications related to a post
private async deletePostNotifications(postId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('postId', '==', postId)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises: Promise<void>[] = [];
    
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    console.log('Related notifications deleted for post:', postId);
  } catch (error) {
    console.error('Error deleting post notifications:', error);
    // Don't throw here as the post deletion is more important
  }
}

// Optional: Method to delete media from Cloudinary
async deleteMediaFromCloudinary(mediaUrl: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    const publicId = this.extractPublicIdFromUrl(mediaUrl);
    if (publicId) {
      await CloudinaryService.deleteMedia(publicId);
      console.log('Media deleted from Cloudinary:', publicId);
    }
  } catch (error) {
    console.error('Error deleting media from Cloudinary:', error);
    // Don't throw here as it's not critical
  }
}

private extractPublicIdFromUrl(url: string): string | null {
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/[cloud]/[resource_type]/[type]/[version]/[public_id].[format]
    const matches = url.match(/\/v\d+\/([^\.]+)/);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}
  private generateDemoUser() {
    this.currentUserId = 'demo_user_' + Math.random().toString(36).substring(7);
    console.log('Generated demo user ID:', this.currentUserId);
  }

  private async initializeAuth() {
    try {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentUserId = user.uid;
          this.isInitialized = true;
          console.log('Firebase user authenticated:', user.uid);
        } else {
          console.log('No Firebase user, using demo user');
        }
      });

      if (!auth.currentUser) {
        await signInAnonymously(auth);
        console.log('Anonymous sign-in successful');
      }
    } catch (error: any) {
      console.log('Firebase auth not available, continuing with demo user');
      this.isInitialized = true;
    }
  }

  async initAuth() {
    try {
      if (this.isInitialized) {
        return this.getCurrentUser();
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (auth.currentUser) {
        this.currentUserId = auth.currentUser.uid;
        this.isInitialized = true;
        return auth.currentUser;
      }

      const userCredential = await signInAnonymously(auth);
      this.currentUserId = userCredential.user.uid;
      this.isInitialized = true;
      console.log('Auth initialized with user:', this.currentUserId);
      return userCredential.user;
    } catch (error: any) {
      console.log('Using demo authentication mode');
      this.isInitialized = true;
      
      return {
        uid: this.currentUserId,
        displayName: 'GoGuide User',
        isAnonymous: true
      };
    }
  }

  // Updated uploadMedia method to use Cloudinary
  async uploadMedia(uri: string, type: 'image' | 'video'): Promise<string> {
    try {
      console.log('Starting Cloudinary upload...');
      
      // Use Cloudinary service to upload media
      const cloudinaryUrl = await CloudinaryService.uploadMedia(
        uri, 
        type, 
        'food_posts' // Optional folder name in Cloudinary
      );
      
      console.log('Media uploaded to Cloudinary successfully:', cloudinaryUrl);
      return cloudinaryUrl;
      
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      
      // Log more details about the error
      if (error.message) {
        console.error('Error message:', error.message);
      }
      
      // For demo purposes, you might want to return the original URI
      // Remove this in production
      console.log('Using local URI as fallback for demo');
      return uri;
    }
  }

  // Alternative method for multiple media uploads
  async uploadMultipleMedia(files: Array<{uri: string, type: 'image' | 'video'}>): Promise<string[]> {
    try {
      return await CloudinaryService.uploadMultipleMedia(files, 'food_posts');
    } catch (error) {
      console.error('Multiple media upload error:', error);
      throw error;
    }
  }

  async createPost(post: Omit<FoodPost, 'id' | 'timestamp' | 'likes' | 'comments'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        timestamp: new Date(),
        likes: [],
        comments: []
      });
      return docRef.id;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  async getPosts(limitCount: number = 20): Promise<FoodPost[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const posts: FoodPost[] = [];
      
      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data()
        } as FoodPost);
      });
      
      return posts;
    } catch (error) {
      console.error('Get posts error:', error);
      return [];
    }
  }

  async toggleLike(postId: string, userId?: string): Promise<void> {
    try {
      const userIdToUse = userId || this.currentUserId || 'anonymous';
      const postRef = doc(db, 'posts', postId);
      
      const posts = await this.getPosts(100);
      const post = posts.find(p => p.id === postId);
      
      if (post && post.likes.includes(userIdToUse)) {
        await updateDoc(postRef, {
          likes: arrayRemove(userIdToUse)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userIdToUse)
        });
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  }

  async addComment(postId: string, comment: Omit<Comment, 'timestamp'>): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      const newComment = {
        ...comment,
        timestamp: new Date()
      };
      
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  }

  async addNotification(notification: Omit<FirebaseNotification, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date()
      });
      console.log('Notification saved to Firebase for user:', notification.userId);
    } catch (error) {
      console.error('Add notification error:', error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<FirebaseNotification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const notifications: FirebaseNotification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          type: data.type,
          message: data.message,
          read: data.read,
          postId: data.postId,
          userId: data.userId,
          fromUserId: data.fromUserId,
          fromUsername: data.fromUsername,
          timestamp: data.timestamp
        });
      });
      
      console.log(`Loaded ${notifications.length} notifications for user:`, userId);
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications(userId);
      const updatePromises = notifications
        .filter(n => !n.read)
        .map(n => this.markNotificationAsRead(n.id));
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  async searchPosts(category?: string, tags?: string[]): Promise<FoodPost[]> {
    try {
      const allPosts = await this.getPosts(100);
      
      let filteredPosts = allPosts;
      
      if (category) {
        filteredPosts = filteredPosts.filter(post => 
          post.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      if (tags && tags.length > 0) {
        filteredPosts = filteredPosts.filter(post =>
          tags.some(tag => 
            post.tags.some(postTag => 
              postTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }
      
      return filteredPosts;
    } catch (error) {
      console.error('Search posts error:', error);
      return [];
    }
  }

  getCurrentUser() {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    
    return {
      uid: this.currentUserId,
      displayName: 'GoGuide User',
      email: null,
      isAnonymous: true
    };
  }

  getCurrentUserId(): string {
    return this.currentUserId || auth.currentUser?.uid || 'demo_user';
  }

  isUserAuthenticated(): boolean {
    return this.isInitialized && (!!auth.currentUser || !!this.currentUserId);
  }
}

export const firebaseService = new FirebaseService();