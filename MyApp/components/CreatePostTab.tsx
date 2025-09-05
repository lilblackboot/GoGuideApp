// components/CreatePostTab.tsx
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { styles } from '../styles/HomeStyles';
import { NotificationService } from '../Services/NotificationService';

interface CreatePostTabProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  category: string;
  setCategory: (category: string) => void;
  mediaUri: string;
  setMediaUri: (uri: string) => void;
  mediaType: 'image' | 'video' | null;
  setMediaType: (type: 'image' | 'video' | null) => void;
  location: any;
  setLocation: (location: any) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
  focusedInput: string;
  setFocusedInput: (input: string) => void;
  isPosting: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onSubmit: () => void;
}

export const CreatePostTab: React.FC<CreatePostTabProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  mediaUri,
  setMediaUri,
  mediaType,
  setMediaType,
  location,
  setLocation,
  tags,
  setTags,
  tagInput,
  setTagInput,
  focusedInput,
  setFocusedInput,
  isPosting,
  fadeAnim,
  slideAnim,
  onSubmit
}) => {
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      NotificationService.provideHapticFeedback('selection');
    }
  };

  // Duplicate removeTag function removed to fix redeclaration error.

  const selectMedia = async (type: 'image' | 'video') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission to upload media');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' ? [ImagePicker.MediaType.Images] : [ImagePicker.MediaType.Videos],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType(type);
        NotificationService.provideHapticFeedback('selection');
      }
    } catch (error) {
      console.error('Media selection error:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant location permission');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address[0]) {
        setLocation({
          name: `${address[0].city || 'Unknown'}, ${address[0].region || 'Unknown'}`,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        NotificationService.provideHapticFeedback('success');
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    NotificationService.provideHapticFeedback('selection');
  };

  return (
    <ScrollView 
      style={styles.createContainer} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Animated.View 
        style={[
          styles.createForm,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={[
              styles.textInput,
              focusedInput === 'title' && styles.focusedInput
            ]}
            placeholder="What's the dish called?"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedInput('title')}
            onBlur={() => setFocusedInput('')}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              focusedInput === 'description' && styles.focusedInput
            ]}
            placeholder="Tell us about this amazing food..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={description}
            onChangeText={setDescription}
            multiline
            onFocus={() => setFocusedInput('description')}
            onBlur={() => setFocusedInput('')}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category *</Text>
          <TextInput
            style={[
              styles.textInput,
              focusedInput === 'category' && styles.focusedInput
            ]}
            placeholder="e.g., Pizza, Dessert, Street Food..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={category}
            onChangeText={setCategory}
            onFocus={() => setFocusedInput('category')}
            onBlur={() => setFocusedInput('')}
          />
        </View>

        <View style={styles.mediaSection}>
          <Text style={styles.inputLabel}>Add Media</Text>
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={[
                styles.mediaButton,
                mediaType === 'image' && styles.activeMediaButton
              ]}
              onPress={() => selectMedia('image')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="image-outline"
                size={24}
                color={mediaType === 'image' ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
              />
              <Text style={[
                styles.mediaButtonText,
                mediaType === 'image' && styles.activeMediaButtonText
              ]}>
                Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.mediaButton,
                mediaType === 'video' && styles.activeMediaButton
              ]}
              onPress={() => selectMedia('video')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="videocam-outline"
                size={24}
                color={mediaType === 'video' ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
              />
              <Text style={[
                styles.mediaButtonText,
                mediaType === 'video' && styles.activeMediaButtonText
              ]}>
                Video
              </Text>
            </TouchableOpacity>
          </View>
          
          {mediaUri && (
            <Animated.View 
              style={[
                styles.mediaPreview,
                { opacity: fadeAnim }
              ]}
            >
              {mediaType === 'image' ? (
                <Image source={{ uri: mediaUri }} style={styles.mediaPreviewImage} />
              ) : (
                <Video
                  source={{ uri: mediaUri }}
                  style={styles.mediaPreviewImage}
                  shouldPlay={false}
                  isLooping={false}
                  useNativeControls={true}
                  resizeMode="cover"
                />
              )}
            </Animated.View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location</Text>
          <TouchableOpacity
            style={[
              styles.locationButton,
              location && styles.selectedLocationButton
            ]}
            onPress={getCurrentLocation}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color={location ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
            />
            <Text style={[
              styles.locationText,
              location && styles.selectedLocationText
            ]}>
              {location ? location.name : 'Add location'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags</Text>
          <View style={styles.tagsInput}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeTag(tag)}
                activeOpacity={0.8}
              >
                <Text style={styles.tagText}>#{tag} ×</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.tagInputField}
              placeholder="Add tags..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title.trim() || !description.trim() || !category.trim() || isPosting) && styles.disabledButton
          ]}
          onPress={onSubmit}
          disabled={!title.trim() || !description.trim() || !category.trim() || isPosting}
          activeOpacity={0.8}
        >
          {isPosting ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.submitButtonText}>Share Post</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};