// firebaseService.ts
import { collection, addDoc, getDocs, getDoc, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, where, serverTimestamp, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebaseConfig'; // Import your existing Firebase config
import app from '../firebaseConfig'; // Import your existing Firebase app

// Initialize Firebase Storage using your existing app
const storage = getStorage(app);



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

const COLLECTION_NAME = 'userSchedules';

// Save weekly slots to Firestore
export const saveWeeklySlots = async (
  userId: string, 
  slots: WeeklySlots
): Promise<void> => {
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

// Load weekly slots from Firestore
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

// Update specific day slots
export const updateDaySlots = async (
  userId: string, 
  day: keyof WeeklySlots, 
  slots: number
): Promise<void> => {
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

// Check if user has saved schedule
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
  userId: string; // The user who should RECEIVE this notification
  fromUserId: string; // The user who triggered this notification
  fromUsername: string;
  timestamp: any;
}

class FirebaseService {
  private currentUserId: string = '';
  private isInitialized: boolean = false;

  constructor() {
    this.generateDemoUser();
    this.initializeAuth();
  }

  private generateDemoUser() {
    // Generate a consistent demo user ID for this session
    this.currentUserId = 'demo_user_' + Math.random().toString(36).substring(7);
    console.log('Generated demo user ID:', this.currentUserId);
  }

  private async initializeAuth() {
    try {
      // Listen to auth state changes
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentUserId = user.uid;
          this.isInitialized = true;
          console.log('Firebase user authenticated:', user.uid);
        } else {
          console.log('No Firebase user, using demo user');
        }
      });

      // Try to sign in anonymously if not already signed in
      if (!auth.currentUser) {
        await signInAnonymously(auth);
        console.log('Anonymous sign-in successful');
      }
    } catch (error: any) {
      console.log('Firebase auth not available, continuing with demo user');
      this.isInitialized = true;
    }
  }

  // Initialize authentication (public method for components to call)
  async initAuth() {
    try {
      // If already initialized, return current state
      if (this.isInitialized) {
        return this.getCurrentUser();
      }

      // Wait a bit for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user is already signed in
      if (auth.currentUser) {
        this.currentUserId = auth.currentUser.uid;
        this.isInitialized = true;
        return auth.currentUser;
      }

      // Try anonymous authentication
      const userCredential = await signInAnonymously(auth);
      this.currentUserId = userCredential.user.uid;
      this.isInitialized = true;
      console.log('Auth initialized with user:', this.currentUserId);
      return userCredential.user;
    } catch (error: any) {
      console.log('Using demo authentication mode');
      this.isInitialized = true;
      
      // Return a mock user object
      return {
        uid: this.currentUserId,
        displayName: 'GoGuide User',
        isAnonymous: true
      };
    }
  }

  // Upload image/video to Firebase Storage
  async uploadMedia(uri: string, type: 'image' | 'video'): Promise<string> {
    try {
      // Create a proper blob from the URI
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Create a unique filename with proper extension
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const extension = type === 'image' ? 'jpg' : 'mp4';
      const filename = `${type}s/${timestamp}_${randomId}.${extension}`;
      
      console.log('Uploading to:', filename);
      
      const storageRef = ref(storage, filename);
      
      // Upload with metadata
      const metadata = {
        contentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
        customMetadata: {
          'uploadedBy': this.getCurrentUserId(),
          'uploadedAt': new Date().toISOString()
        }
      };
      
      const uploadTask = await uploadBytes(storageRef, blob, metadata);
      console.log('Upload completed:', uploadTask.metadata.fullPath);
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadURL);
      
      return downloadURL;
    } catch (error: any) {
      console.error('Upload error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check if it's a storage permission issue
      if (error.code === 'storage/unauthorized') {
        console.log('Storage unauthorized - check Firebase Storage rules');
      } else if (error.code === 'storage/unknown') {
        console.log('Storage unknown error - possibly network or server issue');
      }
      
      // For demo purposes, return the original URI if upload fails
      console.log('Using local URI as fallback');
      return uri;
    }
  }

  // Create a new food post
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

  // Get all food posts
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
      // Return empty array if there's an error
      return [];
    }
  }

  // Like/Unlike a post
  async toggleLike(postId: string, userId?: string): Promise<void> {
    try {
      const userIdToUse = userId || this.currentUserId || 'anonymous';
      const postRef = doc(db, 'posts', postId);
      
      // First, get the current post to check if user already liked
      const posts = await this.getPosts(100);
      const post = posts.find(p => p.id === postId);
      
      if (post && post.likes.includes(userIdToUse)) {
        // Unlike
        await updateDoc(postRef, {
          likes: arrayRemove(userIdToUse)
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likes: arrayUnion(userIdToUse)
        });
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  }

  // Add comment to a post
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

  // Save notification to Firebase
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

  // Get notifications for a specific user
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

  // Mark notification as read
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

  // Mark all notifications as read for a user
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

  // Search posts by category or tags
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

  // Get current user
  getCurrentUser() {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    
    // Return mock user if no authenticated user
    return {
      uid: this.currentUserId,
      displayName: 'GoGuide User',
      email: null,
      isAnonymous: true
    };
  }

  // Get current user ID
  getCurrentUserId(): string {
    return this.currentUserId || auth.currentUser?.uid || 'demo_user';
  }

  // Check if user is authenticated
  isUserAuthenticated(): boolean {
    return this.isInitialized && (!!auth.currentUser || !!this.currentUserId);
  }
}

export const firebaseService = new FirebaseService();