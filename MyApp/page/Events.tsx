import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';

const categories = ['Music', 'Food', 'Art', 'Tech', 'Sports'];

const events = [
  {
    title: 'Summer Beats Festival',
    description: 'Enjoy live music from top artists in an open-air venue.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  },
  {
    title: 'Gourmet Food Expo',
    description: 'Taste dishes from the best chefs in town.',
    image: 'https://images.unsplash.com/photo-1519864600265-abb23843b6c1',
  },
  {
    title: 'Art & Craft Fair',
    description: 'Discover unique handmade art and crafts.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
  },
];

export default function EventsScreen() {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const profileEmoji = currentUser?.photoURL || '😎';

  return (
    <LinearGradient
      colors={['#18181b', '#23232b', '#111113']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topSpacer} />
        {/* Search Bar with Profile Emoji */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search events"
              placeholderTextColor="#a1a1aa"
            />
          </View>
          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>{profileEmoji}</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.tab,
                selectedCategory === cat && styles.tabSelected,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              {selectedCategory === cat ? (
                <LinearGradient
                  colors={['#6366f1', '#a21caf', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tabGradient}
                >
                  <Text style={styles.tabTextSelected}>{cat}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>{cat}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Event Cards */}
        <View style={styles.section}>
          {events
            .filter((e) => selectedCategory === 'Music' || selectedCategory === 'Food' || selectedCategory === 'Art' || selectedCategory === 'Tech' || selectedCategory === 'Sports') // Replace with real filter logic
            .map((event, idx) => (
              <LinearGradient
                key={idx}
                colors={['#6366f1', '#a21caf', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.youtubeCard}>
                  <Image
                    source={{ uri: event.image }}
                    style={styles.youtubeCardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.youtubeCardContent}>
                    <Text style={styles.youtubeCardTitle}>{event.title}</Text>
                    <View style={styles.descRow}>
                      <Text style={styles.youtubeCardDesc}>{event.description}</Text>
                      <TouchableOpacity style={styles.arrowCircle} activeOpacity={0.7}>
                        <LinearGradient
                          colors={['#6366f1', '#a21caf', '#ec4899']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.arrowGradientCircle}
                        >
                          <Text style={styles.arrowText}>➔</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  topSpacer: {
    height: 36,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#23232b',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#2d2d34',
  },
  searchInput: {
    fontSize: 18,
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileCircle: {
    width: 48,
    height: 48,
    backgroundColor: '#23232b',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  profileEmoji: {
    fontSize: 32,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: '#6366f1',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 28,
    justifyContent: 'space-between',
  },
  tab: {
    borderRadius: 18,
    marginRight: 8,
    overflow: 'hidden',
    minWidth: 70,
    backgroundColor: '#23232b',
    borderWidth: 1,
    borderColor: '#2d2d34',
  },
  tabGradient: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    // handled by tabGradient
  },
  tabText: {
    color: '#e5e7eb',
    fontWeight: 'bold',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tabTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: '#6366f1',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  cardGradient: {
    borderRadius: 18,
    marginBottom: 28,
    shadowColor: '#6366f1',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  youtubeCard: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  youtubeCardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#23232b',
  },
  youtubeCardContent: {
    padding: 16,
  },
  youtubeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: '#6366f1',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  youtubeCardDesc: {
    color: '#e5e7eb',
    fontSize: 14,
    opacity: 0.85,
    flex: 1,
    marginRight: 12,
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGradientCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#ec4899',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});