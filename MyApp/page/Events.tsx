// Events.tsx - Enhanced Event listing with Instagram-style cards (Fixed)
import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
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

const { width, height } = Dimensions.get('window');

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
  imageUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  attendees?: string[];
}

type RootStackParamList = {
  Events: undefined;
  Sections: undefined;
  Chatbot: undefined;
  Calculator: undefined;
  HomeScreen: undefined;
  Login: undefined;
  ProfileData: undefined;
};

const categories: string[] = ['All', 'Music', 'Food', 'Art', 'Tech', 'Sports'];

// Enhanced floating shapes with more variety
const FloatingShape: React.FC<{ index: number }> = ({ index }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  
  const [randomProps] = useState({
    size: Math.random() * 8 + 4,
    startX: Math.random() * width,
    endX: Math.random() * width,
    duration: Math.random() * 30000 + 25000,
    delay: Math.random() * 15000,
    shape: Math.floor(Math.random() * 4),
    color: Math.floor(Math.random() * 5),
  });

  const colors = [
    'rgba(99, 102, 241, 0.06)',
    'rgba(236, 72, 153, 0.06)', 
    'rgba(34, 197, 94, 0.06)',
    'rgba(249, 115, 22, 0.06)',
    'rgba(168, 85, 247, 0.06)'
  ];

  useEffect(() => {
    const animate = () => {
      animValue.setValue(0);
      rotateValue.setValue(0);
      scaleValue.setValue(1);

      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: randomProps.duration,
          delay: randomProps.delay,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.loop(
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.3,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start(() => animate());
    };
    animate();
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 50, -100],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [
      randomProps.startX, 
      randomProps.startX + 30, 
      randomProps.endX - 30, 
      randomProps.endX
    ],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.6, 0.6, 0],
  });

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getShapeStyle = () => {
    const baseStyle = {
      width: randomProps.size,
      height: randomProps.size,
      backgroundColor: colors[randomProps.color],
      borderWidth: 0.8,
      borderColor: colors[randomProps.color].replace('0.06', '0.15'),
    };

    switch (randomProps.shape) {
      case 0: // Circle
        return { ...baseStyle, borderRadius: randomProps.size / 2 };
      case 1: // Square
        return { ...baseStyle, borderRadius: 2 };
      case 2: // Diamond
        return { 
          ...baseStyle, 
          borderRadius: 2,
          transform: [{ rotate: '45deg' }]
        };
      case 3: // Triangle (using transform)
        return {
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: randomProps.size / 2,
          borderRightWidth: randomProps.size / 2,
          borderBottomWidth: randomProps.size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: colors[randomProps.color],
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        zIndex: 1,
        transform: [
          { translateY },
          { translateX },
          { rotate },
          { scale: scaleValue },
        ],
        opacity,
      }}
    >
      <View style={getShapeStyle()} />
    </Animated.View>
  );
};

// Instagram-style Event Card Component - FIXED VERSION
const EventCard: React.FC<{
  event: Event;
  index: number;
  onPress: () => void;
  isBooked: boolean;
}> = ({ event, index, onPress, isBooked }) => {
  const cardScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        delay: index * 150,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        delay: index * 150,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: cardScale }],
        opacity: cardOpacity,
        marginBottom: 24,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.95}
        style={styles.eventCard}
      >
        {/* Card Container with Glassmorphism Effect */}
        <View style={styles.eventCardContainer}>
          {/* Image Section - Instagram Style */}
          <View style={styles.eventImageContainer}>
            {event.imageUrl ? (
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.eventImagePlaceholder}
              >
                <MaterialCommunityIcons name="calendar-star" size={64} color="rgba(255,255,255,0.9)" />
                <Text style={styles.placeholderText}>{event.category}</Text>
              </LinearGradient>
            )}
            
            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                style={styles.categoryBadgeGradient}
              >
                <Text style={styles.categoryBadgeText}>{event.category}</Text>
              </LinearGradient>
            </View>

            {/* Booking Status Badge */}
            {isBooked && (
              <View style={styles.bookingBadge}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.bookingBadgeGradient}
                >
                  <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                  <Text style={styles.bookingBadgeText}>Booked</Text>
                </LinearGradient>
              </View>
            )}

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.eventImageOverlay}
            />
          </View>

          {/* Content Section */}
          <View style={styles.eventContent}>
            {/* Title and Action */}
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <TouchableOpacity style={styles.favoriteButton}>
                <MaterialCommunityIcons 
                  name={isBooked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isBooked ? "#ef4444" : "#6b7280"} 
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>
            
            {/* Event Meta with Icons */}
            <View style={styles.eventMetaContainer}>
              {event.date && (
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#6366f1" />
                  </View>
                  <Text style={styles.eventMetaText}>{event.date}</Text>
                </View>
              )}
              
              {event.location && (
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#ec4899" />
                  </View>
                  <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
                </View>
              )}
              
              {event.price && (
                <View style={styles.eventMetaItem}>
                  <View style={styles.eventMetaIcon}>
                    <MaterialCommunityIcons name="currency-usd" size={16} color="#10b981" />
                  </View>
                  <Text style={styles.eventMetaText}>{event.price}</Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.eventActions}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="share-variant" size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="bookmark-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <Text style={styles.eventTime}>{event.time || '12:00 PM'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EventsScreen: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<string[]>([]);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const menuSlide = useRef(new Animated.Value(-width * 0.8)).current;
  const chatbotPulse = useRef(new Animated.Value(1)).current;

  const profileEmoji: string = currentUser?.photoURL || '😎';

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Chatbot pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(chatbotPulse, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(chatbotPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Header scroll animation
    const listener = scrollY.addListener(({ value }) => {
      const opacity = Math.max(0, Math.min(1, 1 - value / 100));
      const translateY = Math.min(0, -value / 2);
      
      headerOpacity.setValue(opacity);
      headerTranslateY.setValue(translateY);
    });

    fetchEvents();
    fetchUserBookings();

    return () => scrollY.removeListener(listener);
  }, [currentUser]);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchQuery]);

  useEffect(() => {
    Animated.timing(menuSlide, {
      toValue: menuVisible ? 0 : -width * 0.8,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.bezier(0.25, 0.8, 0.25, 1),
    }).start();
  }, [menuVisible]);

  const fetchEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const eventsList: Event[] = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
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
        await updateDoc(userRef, {
          bookedEvents: arrayRemove(selectedEvent.id)
        });
        await updateDoc(eventRef, {
          attendees: arrayRemove(currentUser.uid)
        });
        
        setUserBookings(prev => prev.filter(id => id !== selectedEvent.id));
        Alert.alert('Success', 'Event booking cancelled');
      } else {
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

  const handleNavigation = (screen: keyof RootStackParamList) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
        style={{ flex: 1 }}
      >
        {/* Background Elements */}
        {Array.from({ length: 8 }).map((_, i) => (
          <FloatingShape key={i} index={i} />
        ))}

        {/* Animated Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
            }
          ]}
        >
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="menu" size={24} color="#374151" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>events</Text>

              <View style={{ width: 36 }} />
            </View>

            {/* Compact Search */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <MaterialCommunityIcons name="magnify" size={18} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Compact Categories */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  {selectedCategory === cat ? (
                    <LinearGradient
                      colors={['#6366f1', '#8b5cf6']}
                      style={styles.categoryChipGradient}
                    >
                      <Text style={styles.categoryTextActive}>{cat}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.categoryText}>{cat}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>

        {/* Events List */}
        <Animated.ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.eventsContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No events found' : 'No events available'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'Check back later for new events'}
              </Text>
            </View>
          ) : (
            filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onPress={() => handleEventPress(event)}
                isBooked={isEventBooked(event.id)}
              />
            ))
          )}
        </Animated.ScrollView>

        {/* Enhanced Chatbot FAB */}
        <Animated.View
          style={[
            styles.chatbotFAB,
            { transform: [{ scale: chatbotPulse }] }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleNavigation('Chatbot')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.chatbotButton}
            >
              <MaterialCommunityIcons name="robot-excited" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Side Menu */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          onRequestClose={() => setMenuVisible(false)}
        >
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuBackdrop}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
            <Animated.View
              style={[
                styles.sideMenu,
                { transform: [{ translateX: menuSlide }] }
              ]}
            >
              <View style={styles.sideMenuContainer}>
                <View style={styles.menuHeader}>
                  <View style={styles.userInfoContainer}>
                    <View style={styles.userAvatar}>
                      <LinearGradient
                        colors={['#6366f1', '#8b5cf6']}
                        style={styles.userAvatarGradient}
                      >
                        <Text style={styles.userAvatarEmoji}>{profileEmoji}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userDisplayName}>
                        {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                      </Text>
                      <Text style={styles.userEmail} numberOfLines={1}>
                        {currentUser?.email}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setMenuVisible(false)}
                    style={styles.closeButton}
                  >
                    <MaterialCommunityIcons name="close" size={26} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.menuItems}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigation('HomeScreen')}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                      <MaterialCommunityIcons name="food" size={24} color="#f59e0b" />
                    </View>
                    <Text style={styles.menuItemText}>Food</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigation('Calculator')}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                      <MaterialCommunityIcons name="calculator-variant" size={24} color="#8b5cf6" />
                    </View>
                    <Text style={styles.menuItemText}>Calculator</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity>

                  {/* <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigation('Sections')}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                      <MaterialCommunityIcons name="home-variant" size={24} color="#06b6d4" />
                    </View>
                    <Text style={styles.menuItemText}>Home</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity> */}
                </View>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={() => {
                    setMenuVisible(false);
                    logout();
                    navigation.navigate('Login');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
                  </View>
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Profile Modal */}
        <Modal
          visible={profileModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.profileModal}>
              <View style={styles.profileModalContainer}>
                <View style={styles.profileModalHeader}>
                  <View style={styles.profileModalAvatar}>
                    <Text style={styles.profileModalEmoji}>{profileEmoji}</Text>
                  </View>
                  <Text style={styles.profileModalName}>
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text style={styles.profileModalEmail}>{currentUser?.email}</Text>
                </View>

                <View style={styles.profileModalActions}>
                  <TouchableOpacity
                    style={styles.profileModalAction}
                    onPress={() => {
                      setProfileModalVisible(false);
                      handleNavigation('ProfileData');
                    }}
                  >
                    <MaterialCommunityIcons name="account-edit" size={20} color="#6366f1" />
                    <Text style={styles.profileModalActionText}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.profileModalClose}
                  onPress={() => setProfileModalVisible(false)}
                >
                  <Text style={styles.profileModalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Event Details Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.eventModalContainer}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.eventModalHeader}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.eventModalClose}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.eventModalTitle}>Event Details</Text>
                <View style={{ width: 40 }} />
              </View>

              {selectedEvent && (
                <ScrollView style={{ flex: 1 }}>
                  {selectedEvent.imageUrl && (
                    <Image
                      source={{ uri: selectedEvent.imageUrl }}
                      style={styles.eventModalImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.eventModalContent}>
                    <View style={styles.eventModalTitleContainer}>
                      <Text style={styles.eventModalEventTitle}>{selectedEvent.title}</Text>
                      <View style={styles.eventModalCategory}>
                        <Text style={styles.eventModalCategoryText}>{selectedEvent.category}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.eventModalDescription}>{selectedEvent.description}</Text>
                    
                    <View style={styles.eventModalDetails}>
                      {selectedEvent.location && (
                        <View style={styles.eventModalDetail}>
                          <MaterialCommunityIcons name="map-marker" size={20} color="#6b7280" />
                          <Text style={styles.eventModalDetailText}>{selectedEvent.location}</Text>
                        </View>
                      )}
                      {selectedEvent.date && (
                        <View style={styles.eventModalDetail}>
                          <MaterialCommunityIcons name="calendar" size={20} color="#6b7280" />
                          <Text style={styles.eventModalDetailText}>{selectedEvent.date}</Text>
                        </View>
                      )}
                      {selectedEvent.time && (
                        <View style={styles.eventModalDetail}>
                          <MaterialCommunityIcons name="clock" size={20} color="#6b7280" />
                          <Text style={styles.eventModalDetailText}>{selectedEvent.time}</Text>
                        </View>
                      )}
                      {selectedEvent.price && (
                        <View style={styles.eventModalDetail}>
                          <MaterialCommunityIcons name="currency-usd" size={20} color="#6b7280" />
                          <Text style={styles.eventModalDetailText}>{selectedEvent.price}</Text>
                        </View>
                      )}
                    </View>
                    
                    {currentUser?.uid !== 'admin_user' && (
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={handleBookEvent}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={isEventBooked(selectedEvent.id) 
                            ? ['#ef4444', '#dc2626'] 
                            : ['#6366f1', '#8b5cf6']
                          }
                          style={styles.bookButtonGradient}
                        >
                          <MaterialCommunityIcons 
                            name={isEventBooked(selectedEvent.id) ? "calendar-remove" : "calendar-plus"}
                            size={20} 
                            color="#fff" 
                          />
                          <Text style={styles.bookButtonText}>
                            {isEventBooked(selectedEvent.id) ? 'Cancel Booking' : 'Book Event'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              )}
            </SafeAreaView>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    color: '#374151',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  headerContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    fontFamily: 'Poppins_700Bold',
    color: '#1f2937',
<<<<<<< HEAD
    textAlign: 'center' as const,
    marginBottom: 8,
=======
    textTransform: 'lowercase' as const,
    letterSpacing: -0.5,
>>>>>>> parent of cf14868 (event page ui changes)
  },
  profileButton: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
<<<<<<< HEAD
=======
  profileGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  profileEmoji: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
>>>>>>> parent of cf14868 (event page ui changes)
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500' as const,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 8,
  },
<<<<<<< HEAD
=======
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryChipActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0.15,
  },
  categoryChipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6b7280',
    textTransform: 'capitalize' as const,
    paddingTop:5,
  },
  categoryTextActive: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
    textTransform: 'capitalize' as const,
  },
  eventsContainer: {
    paddingTop: 200, // Space for fixed header
    paddingHorizontal: 0,
    paddingBottom: 120,
  },
>>>>>>> parent of cf14868 (event page ui changes)
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#6b7280',
    textAlign: 'center' as const,
    fontWeight: '500' as const,
  },
  // Enhanced Event Card Styles - FIXED FOR INSTAGRAM-STYLE
  eventCard: {
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  eventCardContainer: {
    backgroundColor: '#fff',
 
    overflow: 'hidden' as const,
  },
 // Replace these styles in your existing styles object:

eventImageContainer: {
  position: 'relative' as const,
  width: width,
  height: Math.round(width / 1.6),
},
eventImage: {
  width: width,
  height: Math.round(width / 1.6),
  backgroundColor: '#f3f4f6',
},
eventImagePlaceholder: {
  width: width,
  height: Math.round(width / 1.6),
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
},
  placeholderText: {
    fontSize: 20,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 16,
    textTransform: 'capitalize' as const,
  },
  eventImageOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  categoryBadge: {
    position: 'absolute' as const,
    top: 16,
    left: 16,
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  categoryBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  bookingBadge: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  bookingBadgeGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bookingBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    textTransform: 'uppercase' as const,
  },
  eventContent: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    fontFamily: 'Poppins_700Bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
    lineHeight: 26,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  eventDescription: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400' as const,
  },
  eventMetaContainer: {
    marginBottom: 16,
    gap: 8,
  },
  eventMetaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  eventMetaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  eventMetaText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
    flex: 1,
    fontWeight: '500' as const,
  },
  eventActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    color: '#6b7280',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chatbotFAB: {
    position: 'absolute' as const,
    bottom: 30,
    right: 20,
    zIndex: 1000,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  chatbotButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  menuOverlay: {
    flex: 1,
    flexDirection: 'row' as const,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sideMenu: {
    width: width * 0.8,
    height: height,
    position: 'absolute' as const,
    left: 0,
    top: 0,
  },
  sideMenuContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  menuHeader: {
    position: 'relative' as const,
    alignItems: 'left' as const,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  userInfoContainer: {
    flexDirection: 'column' as const,
    alignItems: 'left' as const,
    paddingBottom: 20,
  },
  userAvatar: {
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  userAvatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  userAvatarEmoji: {
    fontSize: 28,
  },
  userDetails: {
    alignItems: 'left' as const,
    minHeight: 60,
    justifyContent: 'left' as const,
  },
  userDisplayName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.3,
    textAlign: 'left' as const,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#6b7280',
    opacity: 0.8,
    textAlign: 'left' as const,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    padding: 8,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  menuItems: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#374151',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    marginTop: 20,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#ef4444',
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  profileModal: {
    width: width * 0.85,
    maxWidth: 350,
    borderRadius: 24,
    overflow: 'hidden' as const,
    backgroundColor: '#fff',
  },
  profileModalContainer: {
    padding: 24,
    alignItems: 'center' as const,
  },
  profileModalHeader: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  profileModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  profileModalEmoji: {
    fontSize: 32,
  },
  profileModalName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  profileModalEmail: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500' as const,
  },
  profileModalActions: {
    width: '100%',
    gap: 12,
  },
  profileModalAction: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  profileModalActionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
  },
  profileModalClose: {
    marginTop: 16,
    paddingVertical: 12,
  },
  profileModalCloseText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6366f1',
    textAlign: 'center' as const,
  },
  eventModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  eventModalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
  },
  eventModalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  eventModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  eventModalImage: {
    width: '100%',
    height: 250,
  },
  eventModalContent: {
    padding: 20,
  },
  eventModalTitleContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
  },
  eventModalEventTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#1f2937',
    flex: 1,
    marginRight: 16,
    lineHeight: 32,
  },
  eventModalCategory: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  eventModalCategoryText: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    color: '#6366f1',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  eventModalDescription: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  eventModalDetails: {
    gap: 16,
    marginBottom: 32,
  },
  eventModalDetail: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 4,
  },
  eventModalDetailText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#374151',
    flex: 1,
    fontWeight: '500' as const,
  },
  bookButton: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  bookButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 18,
    gap: 12,
  },
  bookButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
};

export default EventsScreen;