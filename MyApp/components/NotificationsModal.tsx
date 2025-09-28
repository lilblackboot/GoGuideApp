// components/NotificationsModal.tsx - Glassmorphism Notifications
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  timeAgo,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 9,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      default:
        return 'notifications';
    }
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onNotificationPress(item);
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.notificationItem,
            !item.read && styles.unreadNotification,
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.notificationIcon}>
            <Ionicons
              name={getNotificationIcon(item.type)}
              size={24}
              color="#FF7A00"
            />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationText}>{item.message}</Text>
            <Text style={styles.notificationTime}>
              {timeAgo(item.timestamp)}
            </Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            flex: 1,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <Animated.View
              style={[
                styles.notificationModal,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* Glassmorphism Background */}
              <LinearGradient
                colors={['rgba(20, 20, 20, 0.98)', 'rgba(10, 10, 10, 0.98)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderTopLeftRadius: 32,
                  borderTopRightRadius: 32,
                }}
              />

              {/* Handle */}
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>Notifications</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="rgba(255, 255, 255, 0.9)" />
                </TouchableOpacity>
              </View>

              {/* Notifications List */}
              <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                    <Ionicons
                      name="notifications-outline"
                      size={64}
                      color="rgba(255, 255, 255, 0.2)"
                    />
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 16,
                        marginTop: 16,
                        textAlign: 'center',
                      }}
                    >
                      No notifications yet
                    </Text>
                  </View>
                )}
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};