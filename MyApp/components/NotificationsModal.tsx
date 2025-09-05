// components/NotificationsModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types/NotificationTypes';
import { styles } from '../styles/HomeStyles';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationPress: (notification: Notification) => void;
  timeAgo: (date: Date) => string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  notifications,
  onNotificationPress,
  timeAgo
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notificationModal}>
          <TouchableOpacity 
            style={styles.modalHandle} 
            onPress={onClose}
          />
          
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.notificationsList}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => onNotificationPress(notification)}
                activeOpacity={0.8}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons
                    name={
                      notification.type === 'like'
                        ? 'heart'
                        : notification.type === 'comment'
                        ? 'chatbubble'
                        : 'person-add'
                    }
                    size={20}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {timeAgo(notification.timestamp)} • {notification.fromUsername}
                  </Text>
                </View>
                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))}
            
            {notifications.length === 0 && (
              <View style={[styles.emptyContainer, { paddingTop: 80 }]}>
                <Ionicons name="notifications-outline" size={60} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>No notifications yet{'\n'}We'll notify you of new activity!</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};