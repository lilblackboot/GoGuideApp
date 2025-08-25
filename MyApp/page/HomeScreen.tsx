// HomeScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Modal,
  Alert,
  Animated,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { styles, colors } from './FoodPostingStyles';
import { firebaseService, FoodPost } from '../Services/FirebaseService';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<'explore' | 'post'>('explore');
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Post Creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUri, setMediaUri] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [focusedInput, setFocusedInput] = useState<string>('');

  // Categories
  const categories = [
    'All', 'Pizza', 'Burgers', 'Sushi', 'Desserts', 'Healthy', 
    'Street Food', 'Fine Dining', 'Breakfast', 'Beverages'
  ];

  // Initialize component
  useEffect(() => {
    initializeApp();
    animateIn();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      await firebaseService.initAuth();
      console.log('App initialized successfully');
      await loadPosts();
    } catch (error) {
      console.error('Initialize error:', error);
      // Don't show alert for auth errors, just continue with demo mode
      console.log('Continuing in demo mode');
      setLoading(false);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Load posts from Firebase
  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await firebaseService.getPosts(20);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Load posts error:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  // Filter posts based on search and category
  const getFilteredPosts = () => {
    let filtered = posts;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => 
        post.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Handle media selection
  const selectMedia = async (type: 'image' | 'video') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' ? [ImagePicker.MediaType.Images] : [ImagePicker.MediaType.Videos],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setMediaUri(result.assets[0].uri);
        setMediaType(type);
      }
    } catch (error) {
      console.error('Media selection error:', error);
      Alert.alert('Error', 'Failed to select media');
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address[0]) {
        setLocation({
          name: `${address[0].city}, ${address[0].region}`,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle like toggle
  const handleLike = async (postId: string) => {
    try {
      const userId = firebaseService.getCurrentUserId();
      await firebaseService.toggleLike(postId, userId);
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(userId);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter(id => id !== userId)
                : [...post.likes, userId]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  // Submit post
  const handleSubmitPost = async () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields');
      return;
    }

    try {
      setIsPosting(true);
      const user = firebaseService.getCurrentUser();
      const userId = firebaseService.getCurrentUserId();

      let mediaUrl = '';
      if (mediaUri && mediaType) {
        try {
          mediaUrl = await firebaseService.uploadMedia(mediaUri, mediaType);
        } catch (uploadError) {
          console.log('Media upload failed, continuing without media:', uploadError);
          // Continue without media if upload fails
        }
      }

      const postData = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: mediaType === 'image' ? mediaUrl : '',
        videoUrl: mediaType === 'video' ? mediaUrl : '',
        location: location || { name: 'Unknown', latitude: 0, longitude: 0 },
        userId: userId,
        username: user?.displayName || 'GoGuide User',
        category: category.trim(),
        tags: tags,
      };

      await firebaseService.createPost(postData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setMediaUri('');
      setMediaType(null);
      setLocation(null);
      setTags([]);
      setTagInput('');
      setCategory('');
      
      // Switch to explore tab and refresh posts
      setActiveTab('explore');
      await loadPosts();
      
      Alert.alert('Success', 'Your food post has been shared!');
    } catch (error) {
      console.error('Submit post error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Render post card
  const renderPostCard = ({ item }: { item: FoodPost }) => {
    const userId = firebaseService.getCurrentUserId();
    const isLiked = userId && item.likes.includes(userId);
    
    return (
      <Animated.View 
        style={[
          styles.postCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.postHeader}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={colors.text} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.location}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              {' '}{item.location.name}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Media Display */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.postMedia} />
        ) : item.videoUrl ? (
          <View style={[styles.postMedia, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceVariant }]}>
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Ionicons name="play-circle" size={60} color={colors.primary} />
              <Text style={{ color: colors.textSecondary, marginTop: 10, fontSize: 14 }}>
                Video Available
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginHorizontal: 20 }}>
                Tap to view in external player
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.postMedia, { alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image-outline" size={60} color={colors.textSecondary} />
          </View>
        )}

        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postDescription}>{item.description}</Text>
          
          {/* Tags */}
          <View style={styles.postTags}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.postActions}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, isLiked && styles.likedButton]}
                onPress={() => handleLike(item.id!)}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? colors.error : colors.textSecondary}
                />
                <Text style={[styles.actionText, isLiked && styles.likedText]}>
                  {item.likes.length}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
                <Text style={styles.actionText}>{item.comments.length}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Render explore tab
  const renderExploreTab = () => (
    <View style={styles.exploreContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search delicious food..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryItem,
                selectedCategory === cat && styles.activeCategoryItem
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.activeCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading delicious posts...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredPosts()}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id!}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={getFilteredPosts().length === 0 ? styles.emptyContainer : {}}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={80} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No posts found{'\n'}Be the first to share something delicious!
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );

  // Render post creation tab
  const renderPostTab = () => (
    <ScrollView style={styles.createContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.createForm}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={[
              styles.textInput,
              focusedInput === 'title' && styles.focusedInput
            ]}
            placeholder="What's the dish called?"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedInput('title')}
            onBlur={() => setFocusedInput('')}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              focusedInput === 'description' && styles.focusedInput
            ]}
            placeholder="Tell us about this amazing food..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            onFocus={() => setFocusedInput('description')}
            onBlur={() => setFocusedInput('')}
          />
        </View>

        {/* Category Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category *</Text>
          <TextInput
            style={[
              styles.textInput,
              focusedInput === 'category' && styles.focusedInput
            ]}
            placeholder="e.g., Pizza, Dessert, Street Food..."
            placeholderTextColor={colors.textSecondary}
            value={category}
            onChangeText={setCategory}
            onFocus={() => setFocusedInput('category')}
            onBlur={() => setFocusedInput('')}
          />
        </View>

        {/* Media Selection */}
        <View style={styles.mediaSection}>
          <Text style={styles.inputLabel}>Add Photo or Video</Text>
          <View style={styles.mediaButtons}>
            <TouchableOpacity
              style={[
                styles.mediaButton,
                mediaType === 'image' && styles.activeMediaButton
              ]}
              onPress={() => selectMedia('image')}
            >
              <Ionicons
                name="image-outline"
                size={24}
                color={mediaType === 'image' ? colors.text : colors.textSecondary}
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
            >
              <Ionicons
                name="videocam-outline"
                size={24}
                color={mediaType === 'video' ? colors.text : colors.textSecondary}
              />
              <Text style={[
                styles.mediaButtonText,
                mediaType === 'video' && styles.activeMediaButtonText
              ]}>
                Video
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Media Preview */}
          {mediaUri && (
            <View style={styles.mediaPreview}>
              {mediaType === 'image' ? (
                <Image source={{ uri: mediaUri }} style={styles.mediaPreviewImage} />
              ) : (
                <View style={[styles.mediaPreviewImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceVariant }]}>
                  <Ionicons name="videocam" size={40} color={colors.primary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 10, fontSize: 14 }}>
                    Video Selected
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginHorizontal: 20 }}>
                    Ready to upload
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location</Text>
          <TouchableOpacity
            style={[
              styles.locationButton,
              location && styles.selectedLocationButton
            ]}
            onPress={getCurrentLocation}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color={location ? colors.accent : colors.textSecondary}
            />
            <Text style={[
              styles.locationText,
              location && styles.selectedLocationText
            ]}>
              {location ? location.name : 'Add location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags</Text>
          <View style={styles.tagsInput}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeTag(tag)}
              >
                <Text style={styles.tagText}>#{tag} ×</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.tagInputField}
              placeholder="Add tags..."
              placeholderTextColor={colors.textSecondary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title.trim() || !description.trim() || !category.trim() || isPosting) && styles.disabledButton
          ]}
          onPress={handleSubmitPost}
          disabled={!title.trim() || !description.trim() || !category.trim() || isPosting}
        >
          {isPosting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.submitButtonText}>Share Your Food</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradient.orange}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>GoGuide</Text>
        
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'explore' && styles.activeTabText
          ]}>
            Explore
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'post' && styles.activeTab]}
          onPress={() => setActiveTab('post')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'post' && styles.activeTabText
          ]}>
            Post Food
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'explore' ? renderExploreTab() : renderPostTab()}
    </Animated.View>
  );
};

export default HomeScreen;