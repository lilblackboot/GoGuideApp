// components/CreatePostTab.tsx - Updated with better error handling for Cloudinary
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

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    NotificationService.provideHapticFeedback('selection');
  };

  // Fixed selectMedia function for CreatePostTab.tsx
const selectMedia = async (type: 'image' | 'video') => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permission to upload media');
      return;
    }

    // Configure options based on the correct API
    const options = {
      mediaTypes: type === 'image' 
        ? ImagePicker.MediaTypeOptions.Images 
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3] as [number, number],
      quality: 0.8,
      // Add video-specific options
      ...(type === 'video' && { 
        videoMaxDuration: 60, // 60 seconds max
        videoQuality: ImagePicker.VideoQuality.Medium 
      })
    };

    console.log('Launching image picker with options:', options);

    const result = await ImagePicker.launchImageLibraryAsync(options);

    console.log('Image picker result:', result);

    if (!result.canceled && result.assets && result.assets[0]) {
      const selectedAsset = result.assets[0];
      
      console.log('Selected asset:', {
        uri: selectedAsset.uri,
        type: selectedAsset.type,
        width: selectedAsset.width,
        height: selectedAsset.height,
        fileSize: selectedAsset.fileSize
      });

      // Check file size if available (optional)
      if (selectedAsset.fileSize) {
        const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
        if (selectedAsset.fileSize > maxSize) {
          Alert.alert(
            'File Too Large', 
            `Please select a ${type} smaller than ${type === 'image' ? '10MB' : '100MB'}`
          );
          return;
        }
      }
      
      setMediaUri(selectedAsset.uri);
      setMediaType(type);
      NotificationService.provideHapticFeedback('selection');
      
      console.log(`Successfully selected ${type}: ${selectedAsset.uri}`);
    } else {
      console.log('Media selection cancelled or failed:', result);
    }

  } catch (error) {
    console.error('Media selection error details:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        Alert.alert('Permission Error', 'Please grant media library permissions in device settings');
      } else if (error.message.includes('cancelled')) {
        console.log('User cancelled media selection');
      } else {
        Alert.alert('Error', `Failed to select media: ${error.message}`);
      }
    } else {
      Alert.alert('Error', 'Failed to select media. Please try again.');
    }
  }
};

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant location permission');
        return;
      }

      // Show loading state
      const loadingLocation = {
        name: 'Getting location...',
        latitude: 0,
        longitude: 0
      };
      setLocation(loadingLocation);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address[0]) {
        const locationData = {
          name: `${address[0].city || 'Unknown'}, ${address[0].region || 'Unknown'}`,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        
        setLocation(locationData);
        NotificationService.provideHapticFeedback('success');
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocation(null); // Reset loading state
      Alert.alert('Location Error', 'Failed to get current location. Please try again or add location manually.');
    }
  };

  const removeMedia = () => {
    setMediaUri('');
    setMediaType(null);
    NotificationService.provideHapticFeedback('selection');
  };

  return (
    <ScrollView 
      style={styles.createContainer} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
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
            maxLength={100}
          />
          {title.length > 80 && (
            <Text style={styles.characterCount}>{title.length}/100</Text>
          )}
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
            maxLength={500}
          />
          {description.length > 400 && (
            <Text style={styles.characterCount}>{description.length}/500</Text>
          )}
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
            maxLength={50}
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
              <TouchableOpacity 
                style={styles.removeMediaButton}
                onPress={removeMedia}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={24} color="#FF4444" />
              </TouchableOpacity>
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
          {location && location.name !== 'Getting location...' && (
            <TouchableOpacity
              style={styles.removeLocationButton}
              onPress={() => setLocation(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.removeLocationText}>Remove location</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags (Optional)</Text>
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
            {tags.length < 5 && (
              <TextInput
                style={styles.tagInputField}
                placeholder={tags.length === 0 ? "Add tags (e.g., spicy, homemade)..." : "Add more..."}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                returnKeyType="done"
                maxLength={20}
              />
            )}
          </View>
          {tags.length >= 5 && (
            <Text style={styles.tagLimitText}>Maximum 5 tags allowed</Text>
          )}
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
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#000000" size="small" />
              <Text style={styles.loadingText}>
                {mediaUri ? 'Uploading media...' : 'Creating post...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Share Post</Text>
          )}
        </TouchableOpacity>

        {/* Upload Progress Indicator */}
        {isPosting && mediaUri && (
          <View style={styles.uploadProgress}>
            <Text style={styles.uploadProgressText}>
              📤 Uploading to Cloudinary...
            </Text>
            <Text style={styles.uploadHelpText}>
              This may take a moment depending on file size
            </Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};