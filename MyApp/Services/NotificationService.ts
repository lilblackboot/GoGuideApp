// NotificationService.ts
import { Platform, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Notification } from '../types/NotificationTypes';
import { firebaseService } from './FirebaseService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async setupNotifications(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF3B30',
        });
      }

      console.log('Notifications setup complete');
      return true;
    } catch (error) {
      console.error('Notification setup error:', error);
      return false;
    }
  }

  static async sendNotification(
    notification: Omit<Notification, 'id' | 'timestamp'>,
    unreadCount: number,
    onNotificationAdded: (notification: Notification) => void
  ): Promise<void> {
    try {
      const currentUserId = firebaseService.getCurrentUserId();
      const currentUser = firebaseService.getCurrentUser();

      // Create the notification object
      const newNotification: Notification = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ...notification,
      };

      // Save to Firebase for the target user (the one who should receive the notification)
      await firebaseService.addNotification({
        type: notification.type,
        message: notification.message,
        read: notification.read,
        postId: notification.postId,
        userId: notification.userId, // The user who should receive the notification
        fromUserId: currentUserId, // The user who triggered the action
        fromUsername: currentUser?.displayName || 'GoGuide User',
      });

      console.log(`Notification sent to user ${notification.userId} from user ${currentUserId}`);

      // Only add to local state and show push notification if it's for the current user
      // This handles the case where the current user is the recipient
      if (notification.userId === currentUserId) {
        onNotificationAdded(newNotification);

        // Send push notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'GoGuide',
            body: notification.message,
            sound: true,
            badge: unreadCount + 1,
          },
          trigger: null, // Show immediately
        });

        // Haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Vibration.vibrate([0, 100, 50, 100]);
        }
      }
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }

  static async sendLikeNotification(
    postId: string,
    postTitle: string,
    postOwnerId: string,
    liker: { id: string; username: string }
  ): Promise<void> {
    try {
      // Don't send notification if user liked their own post
      if (postOwnerId === liker.id) {
        return;
      }

      const notification = {
        type: 'like' as const,
        message: `${liker.username} liked your "${postTitle}" post`,
        read: false,
        postId: postId,
        userId: postOwnerId, // The post owner should receive the notification
        fromUsername: liker.username,
      };

      // Save to Firebase
      await firebaseService.addNotification({
        ...notification,
        fromUserId: liker.id,
      });

      console.log(`Like notification sent to user ${postOwnerId} from ${liker.username}`);
    } catch (error) {
      console.error('Send like notification error:', error);
    }
  }

  static async sendCommentNotification(
    postId: string,
    postTitle: string,
    postOwnerId: string,
    commenter: { id: string; username: string }
  ): Promise<void> {
    try {
      // Don't send notification if user commented on their own post
      if (postOwnerId === commenter.id) {
        return;
      }

      const notification = {
        type: 'comment' as const,
        message: `${commenter.username} commented on your "${postTitle}" post`,
        read: false,
        postId: postId,
        userId: postOwnerId, // The post owner should receive the notification
        fromUsername: commenter.username,
      };

      // Save to Firebase
      await firebaseService.addNotification({
        ...notification,
        fromUserId: commenter.id,
      });

      console.log(`Comment notification sent to user ${postOwnerId} from ${commenter.username}`);
    } catch (error) {
      console.error('Send comment notification error:', error);
    }
  }

  static provideHapticFeedback(type: 'selection' | 'impact' | 'success' | 'error' = 'selection'): void {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'selection':
          Haptics.selectionAsync();
          break;
        case 'impact':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } else {
      const patterns = {
        selection: 50,
        impact: [0, 100],
        success: [0, 100, 50, 100],
        error: [0, 150, 50, 150, 50, 150],
      };
      Vibration.vibrate(patterns[type]);
    }
  }
}