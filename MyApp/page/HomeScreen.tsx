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
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';

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
    { title: 'additions', emoji: '🍕' },
    { title: 'Taste list', emoji: '❤️' },
    { title: 'Around you', emoji: '📍' },
    { title: 'Offers', emoji: '🎁' },
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
      colors={['#18181b', '#23232b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/*
          <View style={styles.logoCircle}>
            {/* Show emoji instead of logo image */}
            {/* <Text style={styles.profileEmoji}>{profileEmoji}</Text> */}
          {/* </View> */}
          {/* <Text style={styles.appTitle}>Hi, {displayName}!</Text> */}
          {/* <Text style={styles.subtitle}>Let's go food hunting!!!</Text> */}
          {/* 3 dots menu */}
          {/*
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
          */}
        </View>

        {/* User Info */}
        <View style={styles.searchBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="search" size={22} color="#f97316" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for foods and stores"
              placeholderTextColor="#71717a"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          <View style={styles.actions}>
            {quickActions.map((item, idx) => {
              // Assign a unique gradient to each card
              const gradients: [string, string][] = [
                ['#ec4899', '#f97316'], // pink to orange
                ['#f97316', '#ec4899'], // orange to pink
                ['#ec4899', '#f97316'], // pink to orange
                ['#f97316', '#ec4899'], // orange to pink
              ];
              return (
                <LinearGradient
                  key={idx}
                  colors={gradients[idx % gradients.length]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionCard}
                >
                  <TouchableOpacity
                    style={{ alignItems: 'center' }}
                    onPress={
                      item.title === 'Around you'
                        ? handleAroundYou
                        : undefined
                    }
                  >
                    <Text style={[styles.actionEmoji, { color: '#fff' }]}>{item.emoji}</Text>
                    <Text style={[styles.actionText, { color: '#fff', textShadowColor: 'rgba(0,0,0,0.12)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>{item.title}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })}
          </View>
        </View>

        {/* Featured Dishes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          {[
            { icon: '🍔', title: 'Premium Burgers', price: '$12.99', gradient: ['#ec4899', '#f97316'] as [string, string] },
            { icon: '🍕', title: 'Wood-Fired Pizza', price: '$15.99', gradient: ['#f97316', '#ec4899'] as [string, string] },
            { icon: '🍜', title: 'Fresh Ramen', price: '$9.99', gradient: ['#ec4899', '#f97316'] as [string, string] },
          ].map((item, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardEmoji}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>Starting from {item.price}</Text>
                </View>
                <LinearGradient colors={item.gradient as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.orderBtn}>
                  <TouchableOpacity>
                    <Text style={styles.orderText}>➔</Text>
                  </TouchableOpacity>
                </LinearGradient>
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
    backgroundColor: '#18181b',
  },
  container: {
    padding: 24,
    backgroundColor: 'transparent',
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
    backgroundColor: '#23232b',
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
    color: '#fafafa',
  },
  section: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fafafa',
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
    overflow: 'hidden',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: '#fafafa',
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    backgroundColor: '#23232b',
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
    color: '#fafafa',
  },
  cardSubtitle: {
    color: '#a1a1aa',
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
