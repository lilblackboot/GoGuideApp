// components/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { styles } from '../styles/HomeStyles';

interface HeaderProps {
  fadeAnim: Animated.Value;
  unreadCount: number;
  onNotificationsPress: () => void;
  onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fadeAnim,
  unreadCount,
  onNotificationsPress,
  onMenuPress
}) => {
  return (
    <View style={styles.header}>
      <BlurView intensity={80} style={styles.headerBlur} />
      <TouchableOpacity style={styles.headerIcon} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      
      <Animated.Text 
        style={[
          styles.headerTitle,
          { opacity: fadeAnim }
        ]}
      >
        GoGuide
      </Animated.Text>
      
      <TouchableOpacity 
        style={styles.headerIcon}
        onPress={onNotificationsPress}
      >
        <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};