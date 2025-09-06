import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../AuthContext';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styles from '../styles/EventsStyle';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  price: string;
  maxAttendees: string;
  imageUrl: string; // Changed from imageBase64 to imageUrl
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  attendees?: string[];
}

const categories: string[] = ['All', 'Music', 'Food', 'Art', 'Tech', 'Sports'];

const EventsScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<string[]>([]);
  
  const profileEmoji: string = currentUser?.photoURL || '😎';

  useEffect(() => {
    fetchEvents();
    fetchUserBookings();
  }, [currentUser]);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchQuery]);

  const fetchEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const eventsList: Event[] = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        // Handle both old imageBase64 and new imageUrl fields for backward compatibility
        eventsList.push({ 
          id: doc.id, 
          ...eventData,
          imageUrl: eventData.imageUrl || eventData.imageBase64 || ''
        } as Event);
      });
      
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (): Promise<void> => {
    if (!currentUser || currentUser.uid === 'admin_user') return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserBookings(userData.bookedEvents || []);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  const filterEvents = (): void => {
    let filtered = events;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredEvents(filtered);
  };

  const handleEventPress = (event: Event): void => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleBookEvent = async (): Promise<void> => {
    if (!currentUser || currentUser.uid === 'admin_user') {
      Alert.alert('Error', 'Please login as a student to book events');
      return;
    }

    if (!selectedEvent) return;

    try {
      const isBooked = userBookings.includes(selectedEvent.id);
      const userRef = doc(db, 'users', currentUser.uid);
      const eventRef = doc(db, 'events', selectedEvent.id);

      if (isBooked) {
        // Remove booking
        await updateDoc(userRef, {
          bookedEvents: arrayRemove(selectedEvent.id)
        });
        await updateDoc(eventRef, {
          attendees: arrayRemove(currentUser.uid)
        });
        
        setUserBookings(prev => prev.filter(id => id !== selectedEvent.id));
        Alert.alert('Success', 'Event booking cancelled');
      } else {
        // Add booking
        await updateDoc(userRef, {
          bookedEvents: arrayUnion(selectedEvent.id)
        });
        await updateDoc(eventRef, {
          attendees: arrayUnion(currentUser.uid)
        });
        
        setUserBookings(prev => [...prev, selectedEvent.id]);
        Alert.alert('Success', 'Event booked successfully!');
      }
    } catch (error) {
      console.error('Error booking event:', error);
      Alert.alert('Error', 'Failed to book event');
    }
  };

  const isEventBooked = (eventId: string): boolean => {
    return userBookings.includes(eventId);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#18181b', '#23232b', '#111113']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, styles.centered]}
      >
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </LinearGradient>
    );
  }

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
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.profileCircle}>
            <Text style={styles.profileEmoji}>{profileEmoji}</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
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
          </ScrollView>
        </View>

        {/* Event Cards */}
        <View style={styles.section}>
          {filteredEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>
                {searchQuery ? 'No events match your search' : 'No events available'}
              </Text>
              <Text style={styles.noEventsSubtext}>
                {searchQuery ? 'Try different keywords' : 'Check back later for new events!'}
              </Text>
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                onPress={() => handleEventPress(event)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366f1', '#a21caf', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.youtubeCard}>
                    {event.imageUrl ? (
                      <Image
                        source={{ uri: event.imageUrl }}
                        style={styles.youtubeCardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>🎉</Text>
                        <Text style={styles.placeholderCategory}>{event.category}</Text>
                      </View>
                    )}
                    <View style={styles.youtubeCardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.youtubeCardTitle} numberOfLines={1}>
                          {event.title}
                        </Text>
                        {isEventBooked(event.id) && (
                          <View style={styles.bookedBadge}>
                            <Text style={styles.bookedBadgeText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.descRow}>
                        <Text style={styles.youtubeCardDesc} numberOfLines={2}>
                          {event.description}
                        </Text>
                      </View>
                      
                      {/* Event Details */}
                      <View style={styles.eventDetails}>
                        {event.location && (
                          <Text style={styles.eventDetailText}>📍 {event.location}</Text>
                        )}
                        {event.date && (
                          <Text style={styles.eventDetailText}>📅 {event.date}</Text>
                        )}
                        {event.price && (
                          <Text style={styles.eventDetailText}>💰 {event.price}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Event Details Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Event Details</Text>
              <View style={{ width: 20 }} />
            </View>

            {selectedEvent && (
              <ScrollView style={styles.modalContent}>
                {selectedEvent.imageUrl && (
                  <Image
                    source={{ uri: selectedEvent.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.modalEventContent}>
                  <View style={styles.modalEventHeader}>
                    <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>
                    <View style={styles.modalEventCategory}>
                      <Text style={styles.modalEventCategoryText}>{selectedEvent.category}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.modalEventDescription}>{selectedEvent.description}</Text>
                  
                  <View style={styles.modalEventDetails}>
                    {selectedEvent.location && (
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailIcon}>📍</Text>
                        <Text style={styles.modalDetailText}>{selectedEvent.location}</Text>
                      </View>
                    )}
                    {selectedEvent.date && (
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailIcon}>📅</Text>
                        <Text style={styles.modalDetailText}>{selectedEvent.date}</Text>
                      </View>
                    )}
                    {selectedEvent.time && (
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailIcon}>🕒</Text>
                        <Text style={styles.modalDetailText}>{selectedEvent.time}</Text>
                      </View>
                    )}
                    {selectedEvent.price && (
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailIcon}>💰</Text>
                        <Text style={styles.modalDetailText}>{selectedEvent.price}</Text>
                      </View>
                    )}
                    {selectedEvent.maxAttendees && (
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailIcon}>👥</Text>
                        <Text style={styles.modalDetailText}>Max {selectedEvent.maxAttendees} attendees</Text>
                      </View>
                    )}
                  </View>
                  
                  {currentUser?.uid !== 'admin_user' && (
                    <TouchableOpacity
                      style={[
                        styles.bookButton,
                        isEventBooked(selectedEvent.id) && styles.bookedButton
                      ]}
                      onPress={handleBookEvent}
                    >
                      <Text style={styles.bookButtonText}>
                        {isEventBooked(selectedEvent.id) ? '✓ Booked - Tap to Cancel' : '🎫 Book Event'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

export default EventsScreen;