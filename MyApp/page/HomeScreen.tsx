// HomeScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StatusBar,
  SafeAreaView,
  Keyboard,
  Alert,
  Platform,
  Text,
} from 'react-native';
import { firebaseService, FoodPost, Comment } from '../Services/FirebaseService';
import { NotificationService } from '../Services/NotificationService';
import { Notification } from '../types/NotificationTypes';
import { styles } from '../styles/HomeStyles';
import { timeAgo } from '../utils/utils';
import { Header } from '../components/Header';
import { ExploreTab } from '../components/ExploreTab';
import { CreatePostTab } from '../components/CreatePostTab';
import { CommentsModal } from '../components/CommentsModal';
import { NotificationsModal } from '../components/NotificationsModal';

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
  const [focusedInput, setFocusedInput] = useState<string>('');
  
  // Comments with keyboard handling
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FoodPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Initialize component
  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#000000', true);
    }
    
    initializeApp();
    animateIn();
    setupKeyboardListeners();
    
    return () => {
      cleanupKeyboardListeners();
    };
  }, []);

  const setupKeyboardListeners = () => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  };

  const cleanupKeyboardListeners = () => {
    Keyboard.removeAllListeners('keyboardWillShow');
    Keyboard.removeAllListeners('keyboardWillHide');
    Keyboard.removeAllListeners('keyboardDidShow');
    Keyboard.removeAllListeners('keyboardDidHide');
  };

  const initializeApp = async () => {
    try {
      setLoading(true);
      await NotificationService.setupNotifications();
      await firebaseService.initAuth();
      await loadPosts();
      await loadNotifications();
    } catch (error) {
      console.error('Initialize error:', error);
      setLoading(false);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadNotifications = async () => {
    try {
      const userId = firebaseService.getCurrentUserId();
      if (!userId) return;
      
      // Load notifications from Firebase for current user
      const userNotifications = await firebaseService.getNotifications(userId);
      
      // Convert Firebase notifications to local notification format
      const localNotifications: Notification[] = userNotifications.map(fn => ({
        id: fn.id,
        type: fn.type,
        message: fn.message,
        read: fn.read,
        postId: fn.postId,
        userId: fn.userId,
        fromUsername: fn.fromUsername,
        timestamp: fn.timestamp
      }));
      
      setNotifications(localNotifications);
      setUnreadCount(localNotifications.filter(n => !n.read).length);
      
      console.log(`Loaded ${localNotifications.length} notifications, ${localNotifications.filter(n => !n.read).length} unread`);
    } catch (error) {
      console.error('Load notifications error:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await firebaseService.getPosts(20);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    await loadNotifications();
    setRefreshing(false);
  };

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

  const handleLike = async (postId: string) => {
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
      console.error('Like error:', error);
    }
  };

  const openComments = (post: FoodPost) => {
    setSelectedPost(post);
    setPostComments(post.comments);
    setShowComments(true);
    NotificationService.provideHapticFeedback('selection');
  };

  const closeComments = () => {
    setShowComments(false);
    setSelectedPost(null);
    setNewComment('');
    setPostComments([]);
    Keyboard.dismiss();
    NotificationService.provideHapticFeedback('selection');
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const userId = firebaseService.getCurrentUserId();
      const currentUser = firebaseService.getCurrentUser();
      
      if (!userId || !currentUser) return;
      
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        userId: userId,
        username: currentUser.displayName || 'GoGuide User',
        timestamp: new Date()
      };

      // Add to local state immediately
      setPostComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Update Firebase
      await firebaseService.addComment(selectedPost.id!, comment);
      
      // Update posts state
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.id === selectedPost.id) {
            return {
              ...p,
              comments: [...p.comments, comment]
            };
          }
          return p;
        })
      );
      
      // Send notification if commenting on someone else's post
      if (selectedPost.userId !== userId) {
        await NotificationService.sendCommentNotification(
          selectedPost.id!,
          selectedPost.title,
          selectedPost.userId,
          {
            id: userId,
            username: currentUser.displayName || 'GoGuide User'
          }
        );
        
        console.log(`Comment notification sent from ${currentUser.displayName} to post owner ${selectedPost.userId}`);
      }
      
      NotificationService.provideHapticFeedback('success');
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const openNotifications = async () => {
    setShowNotifications(true);
    
    // Mark all notifications as read after opening
    const userId = firebaseService.getCurrentUserId();
    if (userId) {
      // Update local state immediately
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Update Firebase after a delay
      setTimeout(async () => {
        try {
          await firebaseService.markAllNotificationsAsRead(userId);
        } catch (error) {
          console.error('Error marking notifications as read:', error);
        }
      }, 1000);
    }
    
    NotificationService.provideHapticFeedback('selection');
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark specific notification as read
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      
      // Update in Firebase
      await firebaseService.markNotificationAsRead(notification.id);
      
      setShowNotifications(false);
      
      // Navigate to the post if it exists
      if (notification.postId) {
        const post = posts.find(p => p.id === notification.postId);
        if (post) {
          openComments(post);
        }
      }
    } catch (error) {
      console.error('Handle notification press error:', error);
    }
  };

  const handleSubmitPost = async () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      Alert.alert('Missing Information', 'Please fill in title, description, and category');
      return;
    }

    try {
      setIsPosting(true);
      
      NotificationService.provideHapticFeedback('impact');

      const user = firebaseService.getCurrentUser();
      const userId = firebaseService.getCurrentUserId();

      if (!user || !userId) {
        Alert.alert('Error', 'Please sign in to post');
        return;
      }

      let mediaUrl = '';
      if (mediaUri && mediaType) {
        try {
          mediaUrl = await firebaseService.uploadMedia(mediaUri, mediaType);
        } catch (uploadError) {
          console.log('Media upload failed:', uploadError);
        }
      }

      const postData = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: mediaType === 'image' ? mediaUrl : '',
        videoUrl: mediaType === 'video' ? mediaUrl : '',
        location: location || { name: 'Unknown', latitude: 0, longitude: 0 },
        userId: userId,
        username: user.displayName || 'GoGuide User',
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
      
      // Switch to explore and refresh
      setActiveTab('explore');
      await loadPosts();
      
      NotificationService.provideHapticFeedback('success');
      Alert.alert('Success', 'Your post has been shared!');
    } catch (error) {
      console.error('Submit post error:', error);
      Alert.alert('Error', 'Failed to create post');
      NotificationService.provideHapticFeedback('error');
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
          <Video
            source={item.videoUrl}
            style={styles.postMedia}
            shouldPlay={false}
            isLooping={false}
            useNativeControls={true}
          />
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
                <Video
                  source={mediaUri}
                  style={styles.mediaPreviewImage}
                  shouldPlay={false}
                  isLooping={false}
                  useNativeControls={true}
                />
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

      {/* Comments Modal */}
      <CommentsModal
        visible={showComments}
        onClose={closeComments}
        post={selectedPost}
        comments={postComments}
        newComment={newComment}
        setNewComment={setNewComment}
        onAddComment={addComment}
        keyboardHeight={keyboardHeight}
        timeAgo={timeAgo}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onNotificationPress={handleNotificationPress}
        timeAgo={timeAgo}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;