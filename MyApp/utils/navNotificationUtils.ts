// Utility to map notification types to nav bar pages
import type { Notification } from '../types/NotificationTypes';

type NavNotifications = {
  home: boolean;
  food: boolean;
  event: boolean;
  calculator: boolean;
  assistant: boolean;
};

export function getNavNotificationCounts(notifications: Notification[]): NavNotifications {
  const result: NavNotifications = {
    home: false,
    food: false,
    event: false,
    calculator: false,
    assistant: false,
  };
  notifications.forEach((n) => {
    if (!n.read) {
      // Show red dot on food icon for like or comment notifications
      if (n.type === 'like' || n.type === 'comment') {
        result.food = true;
      }
      // Optionally, keep original logic for other icons
      if (n.type === 'like' || n.type === 'follow') {
        result.home = true;
      }
      if (n.type === 'comment') {
        result.event = true;
      }
     
    }
  });
  return result;
}
