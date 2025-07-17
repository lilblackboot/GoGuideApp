import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { useAuth } from '../AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  ProfileData: undefined;
  // Add other screens here as needed
};

export default function HomeScreen() {
  const { currentUser, logout } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [menuVisible, setMenuVisible] = useState(false);

  // Get displayName and photoURL (emoji) from Firebase Auth user
  const displayName = currentUser?.displayName || 'Guest';
  const profileEmoji = currentUser?.photoURL || '😎';

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login'); // Redirect to login page after logout
    } catch (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message)
        : String(error);
      Alert.alert('Error', errorMessage);
    }
  };

  const quickActions = [
    { title: 'New additions', emoji: '🍕', color: '#f97316' },
    { title: 'Taste list', emoji: '❤️', color: '#ec4899' },
    { title: 'Around you', emoji: '📍', color: '#3b82f6' },
    { title: 'Offers', emoji: '🎁', color: '#10b981' },
  ];

  const handleAroundYou = async () => {
    try {
      // Ask for location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to show places around you.');
        return;
      }
      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      Alert.alert(
        'Your Location',
        `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`
      );
      // You can use location.coords.latitude & location.coords.longitude as needed
    } catch (error) {
      Alert.alert('Error', 'Could not get location.');
    }
  };

  return (
    <LinearGradient
      colors={['#fb923c', '#ef4444', '#ec4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            {/* Show emoji instead of logo image */}
            <Text style={styles.profileEmoji}>{profileEmoji}</Text>
          </View>
          <Text style={styles.appTitle}>Hi, {displayName}!</Text>
          <Text style={styles.subtitle}>Let's go food hunting!!!</Text>
          {/* 3 dots menu */}
          <TouchableOpacity
            style={styles.menuIcon}
            onPress={() => setMenuVisible(!menuVisible)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 28, color: '#fff' }}>⋮</Text>
          </TouchableOpacity>
          {menuVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('ProfileData');
                }}
              >
                <Text style={styles.dropdownText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={async () => {
                  setMenuVisible(false);
                  await handleLogout();
                }}
              >
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food, places, or offers..."
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          <View style={styles.actions}>
            {quickActions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.actionCard, { backgroundColor: item.color }]}
                onPress={
                  item.title === 'Around you'
                    ? handleAroundYou
                    : undefined
                }
              >
                <Text style={styles.actionEmoji}>{item.emoji}</Text>
                <Text style={styles.actionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Dishes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>

          {[
            { icon: '🍔', title: 'Premium Burgers', price: '$12.99', color: '#f97316' },
            { icon: '🍕', title: 'Wood-Fired Pizza', price: '$15.99', color: '#ef4444' },
            { icon: '🍜', title: 'Fresh Ramen', price: '$9.99', color: '#facc15' },
          ].map((item, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardEmoji}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>Starting from {item.price}</Text>
                </View>
                <TouchableOpacity style={[styles.orderBtn, { backgroundColor: item.color }]}>
                  <Text style={styles.orderText}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 96,
    height: 96,
    backgroundColor: 'white',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffe4c4',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    fontSize: 18,
    color: '#1f2937',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardSubtitle: {
    color: '#6b7280',
  },
  orderBtn: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    marginBottom: 48,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  profileEmoji: {
    fontSize: 56,
    textAlign: 'center',
  },
  menuIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    zIndex: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1f2937',
  },
});
