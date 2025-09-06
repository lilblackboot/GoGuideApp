import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';
import styles from '../styles/AdminEventsScreenStyle';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

// Cloudinary configuration - replace with your actual values
// const CLOUDINARY_CLOUD_NAME = 'dogoeyzeu'; // Replace with your Cloudinary cloud name
// const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset'; // Replace with your unsigned upload preset

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

interface EventForm {
  title: string;
  description: string;
  category: string;
  date: Date;
  time: Date;
  location: string;
  price: string;
  maxAttendees: string;
  image: ImagePicker.ImagePickerAsset | null;
  imageUrl: string; // Changed from imageBase64 to imageUrl
}

interface AdminCredentials {
  username: string;
  password: string;
  newUsername: string;
  newPassword: string;
}

const categories = ['Music', 'Food', 'Art', 'Tech', 'Sports'];

const AdminEventsScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  
  // Date and time picker states
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  
  const [eventForm, setEventForm] = useState<EventForm>({
    title: '',
    description: '',
    category: 'Music',
    date: new Date(),
    time: new Date(),
    location: '',
    price: '',
    maxAttendees: '',
    image: null,
    imageUrl: '' // Changed from imageBase64 to imageUrl
  });

  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    username: '',
    password: '',
    newUsername: '',
    newPassword: ''
  });
  const [showCredentialsModal, setShowCredentialsModal] = useState<boolean>(false);

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const filterEvents = (): void => {
    let filtered = events;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredEvents(filtered);
  };

  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    try {
      setUploadingImage(true);
      
      // Validate that we have a valid image URI
      if (!imageUri) {
        throw new Error('No image selected');
      }

      // Create form data for Cloudinary upload
      const formData = new FormData();
      
      // Add the image file
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `event_${Date.now()}.jpg`,
      } as any);
      
      // Add upload preset and other parameters
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'image'); // Ensure only images are uploaded
      formData.append('folder', 'events'); // Organize images in a folder
      
      // Cloudinary upload URL
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Return the secure URL of the uploaded image
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8, // Good quality for upload
      });

      if (!result.canceled && result.assets[0]) {
        setProcessing(true);
        
        try {
          // Upload image to Cloudinary
          const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
          
          setEventForm(prev => ({
            ...prev,
            image: result.assets[0],
            imageUrl: imageUrl
          }));
          
          Alert.alert('Success', 'Image uploaded successfully!');
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload image';
          Alert.alert('Upload Error', errorMessage);
        }
        
        setProcessing(false);
      }
    } catch (error) {
      setProcessing(false);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date();
  };

  const parseTime = (timeString: string): Date => {
    if (!timeString) return new Date();
    const today = new Date();
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (period && period.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period && period.toLowerCase() === 'am' && hour === 12) {
      hour = 0;
    }
    
    today.setHours(hour, parseInt(minutes), 0, 0);
    return today;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventForm(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEventForm(prev => ({ ...prev, time: selectedTime }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (!eventForm.title || !eventForm.description || !eventForm.location) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        date: formatDate(eventForm.date),
        time: formatTime(eventForm.time),
        location: eventForm.location,
        price: eventForm.price,
        maxAttendees: eventForm.maxAttendees,
        imageUrl: eventForm.imageUrl, // Store Cloudinary URL
        updatedAt: Timestamp.now()
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        const newEventData = {
          ...eventData,
          createdAt: Timestamp.now(),
          createdBy: currentUser?.uid || 'admin',
          attendees: []
        };
        await addDoc(collection(db, 'events'), newEventData);
        Alert.alert('Success', 'Event created successfully');
      }

      resetForm();
      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event): void => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date ? parseDate(event.date) : new Date(),
      time: event.time ? parseTime(event.time) : new Date(),
      location: event.location || '',
      price: event.price || '',
      maxAttendees: event.maxAttendees || '',
      image: null,
      imageUrl: event.imageUrl || '' // Use imageUrl instead of imageBase64
    });
    setModalVisible(true);
  };

  const handleDelete = (event: Event): void => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', event.id));
              Alert.alert('Success', 'Event deleted successfully');
              fetchEvents();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  const resetForm = (): void => {
    setEventForm({
      title: '',
      description: '',
      category: 'Music',
      date: new Date(),
      time: new Date(),
      location: '',
      price: '',
      maxAttendees: '',
      image: null,
      imageUrl: '' // Reset imageUrl instead of imageBase64
    });
    setEditingEvent(null);
  };

  const updateAdminCredentials = async (): Promise<void> => {
    try {
      if (!adminCredentials.newUsername || !adminCredentials.newPassword) {
        Alert.alert('Error', 'Please fill in both new username and password');
        return;
      }

      await updateDoc(doc(db, 'admin', 'credentials'), {
        username: adminCredentials.newUsername,
        password: adminCredentials.newPassword,
        updatedAt: Timestamp.now()
      });

      Alert.alert('Success', 'Admin credentials updated successfully');
      setShowCredentialsModal(false);
      setAdminCredentials({
        username: '',
        password: '',
        newUsername: '',
        newPassword: ''
      });
    } catch (error) {
      console.error('Error updating credentials:', error);
      Alert.alert('Error', 'Failed to update credentials');
    }
  };

  if (loading && events.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
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
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowCredentialsModal(true)}
            >
              <Text style={styles.headerButtonText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.headerButtonText}>➕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsRow}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                selectedCategory === 'All' && styles.tabSelected,
              ]}
              onPress={() => setSelectedCategory('All')}
            >
              <Text style={[
                styles.tabText,
                selectedCategory === 'All' && styles.tabTextSelected
              ]}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tab,
                  selectedCategory === cat && styles.tabSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.tabText,
                  selectedCategory === cat && styles.tabTextSelected
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Events List */}
        <View style={styles.section}>
          {filteredEvents.length === 0 ? (
            <Text style={styles.noEventsText}>
              {searchQuery ? 'No events match your search' : 'No events found'}
            </Text>
          ) : (
            filteredEvents.map((event) => (
              <LinearGradient
                key={event.id}
                colors={['#6366f1', '#a21caf', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.eventCard}>
                  {event.imageUrl ? (
                    <Image
                      source={{ uri: event.imageUrl }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderIcon}>🎉</Text>
                    </View>
                  )}
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventCategory}>{event.category}</Text>
                    </View>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                    {event.location && (
                      <Text style={styles.eventDetail}>📍 {event.location}</Text>
                    )}
                    {event.date && (
                      <Text style={styles.eventDetail}>📅 {event.date}</Text>
                    )}
                    {event.time && (
                      <Text style={styles.eventDetail}>🕒 {event.time}</Text>
                    )}
                    {event.price && (
                      <Text style={styles.eventDetail}>💰 {event.price}</Text>
                    )}
                    
                    <View style={styles.eventActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEdit(event)}
                      >
                        <Text style={styles.actionButtonText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(event)}
                      >
                        <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            ))
          )}
        </View>

        {/* Add/Edit Event Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </Text>
              <View style={{ width: 20 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={eventForm.title}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, title: text }))}
                  placeholder="Event title"
                  placeholderTextColor="#a1a1aa"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={eventForm.description}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
                  placeholder="Event description"
                  placeholderTextColor="#a1a1aa"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryPicker}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        eventForm.category === cat && styles.categoryOptionSelected
                      ]}
                      onPress={() => setEventForm(prev => ({ ...prev, category: cat }))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        eventForm.category === cat && styles.categoryOptionTextSelected
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Location *</Text>
                <TextInput
                  style={styles.input}
                  value={eventForm.location}
                  onChangeText={(text) => setEventForm(prev => ({ ...prev, location: text }))}
                  placeholder="Event location"
                  placeholderTextColor="#a1a1aa"
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateTimeButtonText}>
                      📅 {formatDate(eventForm.date)}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={eventForm.date}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Time</Text>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.dateTimeButtonText}>
                      🕒 {formatTime(eventForm.time)}
                    </Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={eventForm.time}
                      mode="time"
                      display="default"
                      onChange={onTimeChange}
                    />
                  )}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    value={eventForm.price}
                    onChangeText={(text) => setEventForm(prev => ({ ...prev, price: text }))}
                    placeholder="Free or ₹100"
                    placeholderTextColor="#a1a1aa"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.label}>Max Attendees</Text>
                  <TextInput
                    style={styles.input}
                    value={eventForm.maxAttendees}
                    onChangeText={(text) => setEventForm(prev => ({ ...prev, maxAttendees: text }))}
                    placeholder="100"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Event Image</Text>
                <TouchableOpacity 
                  style={styles.imagePicker} 
                  onPress={pickImage}
                  disabled={processing || uploadingImage}
                >
                  {(processing || uploadingImage) ? (
                    <View style={styles.imagePickerPlaceholder}>
                      <ActivityIndicator size="small" color="#ec4899" />
                      <Text style={styles.imagePickerText}>
                        {uploadingImage ? 'Uploading to cloud...' : 'Processing image...'}
                      </Text>
                    </View>
                  ) : (eventForm.image || eventForm.imageUrl) ? (
                    <Image
                      source={{ uri: eventForm.image?.uri || eventForm.imageUrl }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Text style={styles.imagePickerText}>📷 Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, (loading || processing || uploadingImage) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading || processing || uploadingImage}
              >
                <Text style={styles.submitButtonText}>
                  {uploadingImage ? 'Uploading Image...' :
                   processing ? 'Processing...' : 
                   loading ? 'Saving...' : 
                   editingEvent ? 'Update Event' : 'Create Event'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Admin Credentials Modal */}
        <Modal
          visible={showCredentialsModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCredentialsModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Admin Settings</Text>
              <View style={{ width: 20 }} />
            </View>

            <View style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>New Username</Text>
                <TextInput
                  style={styles.input}
                  value={adminCredentials.newUsername}
                  onChangeText={(text) => setAdminCredentials(prev => ({ ...prev, newUsername: text }))}
                  placeholder="Enter new username"
                  placeholderTextColor="#a1a1aa"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={adminCredentials.newPassword}
                  onChangeText={(text) => setAdminCredentials(prev => ({ ...prev, newPassword: text }))}
                  placeholder="Enter new password"
                  placeholderTextColor="#a1a1aa"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={updateAdminCredentials}
              >
                <Text style={styles.submitButtonText}>Update Credentials</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

export default AdminEventsScreen;