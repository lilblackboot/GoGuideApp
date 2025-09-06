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
// Add this function to your HomeScreen.tsx component, after your other handlers

  const handleLike = async (postId: string) => {
    try {
      // Animation feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const userId = firebaseService.getCurrentUserId();
      const currentUser = firebaseService.getCurrentUser();
      const post = posts.find(p => p.id === postId);
      const isLiked = post?.likes.includes(userId);
      
      if (!post || !userId || !currentUser) return;
      
      // Update local state immediately
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes: isLiked
                ? p.likes.filter(id => id !== userId)
                : [...p.likes, userId]
            };
          }
          return p;
        })
      );

      NotificationService.provideHapticFeedback('impact');

      // Update Firebase
      await firebaseService.toggleLike(postId, userId);
      
      // Send notification if liking someone else's post (not unliking)
      if (!isLiked && post.userId !== userId) {
        await NotificationService.sendLikeNotification(
          postId,
          post.title,
          post.userId,
          {
            id: userId,
            username: currentUser.displayName || 'GoGuide User'
          }
        );
        
        console.log(`Like notification sent from ${currentUser.displayName} to post owner ${post.userId}`);
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
const handleDeletePost = async (postId: string, post: FoodPost) => {
  try {
    // Show confirmation alert
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Provide haptic feedback
              NotificationService.provideHapticFeedback('impact');
              
              // Delete post from Firebase
              await firebaseService.deletePost(postId);
              
              // Update local state immediately
              setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
              
              // Show success feedback
              NotificationService.provideHapticFeedback('success');
              Alert.alert('Success', 'Post deleted successfully!');
              
            } catch (error) {
              console.error('Delete post error:', error);
              NotificationService.provideHapticFeedback('error');
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          }
        }
      ]
    );
  } catch (error) {
    console.error('Delete post confirmation error:', error);
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
  

  // Updated handleSubmitPost function for HomeScreen.tsx
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
    
    // Handle media upload if present
    if (mediaUri && mediaType) {
      try {
        console.log('Uploading media to Cloudinary...');
        mediaUrl = await firebaseService.uploadMedia(mediaUri, mediaType);
        console.log('Media upload successful:', mediaUrl);
        
        // Verify the URL is a Cloudinary URL (basic check)
        if (!mediaUrl.includes('cloudinary.com') && !mediaUrl.startsWith('file://')) {
          console.warn('Unexpected media URL format:', mediaUrl);
        }
        
      } catch (uploadError) {
        console.error('Media upload failed:', uploadError);
        
        // Show user-friendly error message
        Alert.alert(
          'Upload Failed', 
          'Failed to upload media. Would you like to post without media or try again?',
          [
            { text: 'Post without media', onPress: () => { mediaUrl = ''; } },
            { text: 'Try again', style: 'cancel', onPress: () => setIsPosting(false) }
          ]
        );
        return;
      }
    }

    // Create post data
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

    // Create post in Firebase
    console.log('Creating post in Firebase...');
    await firebaseService.createPost(postData);
    console.log('Post created successfully');
    
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
    
    // More specific error messages
    let errorMessage = 'Failed to create post';
    
    if (error instanceof Error) {
      if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please check your account permissions.';
      } else if (error.message.includes('storage')) {
        errorMessage = 'Storage error. Please try uploading a smaller file.';
      }
    }
    
    Alert.alert('Error', errorMessage);
    NotificationService.provideHapticFeedback('error');
    
  } finally {
    setIsPosting(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      
      {/* Floating Header */}
      <Header
        fadeAnim={fadeAnim}
        unreadCount={unreadCount}
        onNotificationsPress={openNotifications}
        onMenuPress={() => NotificationService.provideHapticFeedback('selection')}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Tab Navigation */}
        <Animated.View 
          style={[
            styles.tabContainer,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
            onPress={() => {
              setActiveTab('explore');
              NotificationService.provideHapticFeedback('selection');
            }}
            activeOpacity={0.8}
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
            onPress={() => {
              setActiveTab('post');
              NotificationService.provideHapticFeedback('selection');
            }}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'post' && styles.activeTabText
            ]}>
              Create Post
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tab Content */}
        {activeTab === 'explore' ? (
          <ExploreTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filteredPosts={getFilteredPosts()}
            loading={loading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onLike={handleLike}
            onComment={openComments}
            onDeletePost={handleDeletePost} 
            slideAnim={slideAnim}
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
            currentUserId={firebaseService.getCurrentUserId()}
            timeAgo={timeAgo}
          />
        ) : (
          <CreatePostTab
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            mediaUri={mediaUri}
            setMediaUri={setMediaUri}
            mediaType={mediaType}
            setMediaType={setMediaType}
            location={location}
            setLocation={setLocation}
            tags={tags}
            setTags={setTags}
            tagInput={tagInput}
            setTagInput={setTagInput}
            focusedInput={focusedInput}
            setFocusedInput={setFocusedInput}
            isPosting={isPosting}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            onSubmit={handleSubmitPost}
          />
        )}
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