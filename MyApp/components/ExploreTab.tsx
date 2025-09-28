// components/ExploreTab.tsx - Animated Glassmorphism Design
import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FoodPost } from '../Services/FirebaseService';
import { PostCard } from './PostCard';
import { styles } from '../styles/HomeStyles';
import { NotificationService } from '../Services/NotificationService';

interface ExploreTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredPosts: FoodPost[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onLike: (postId: string) => void;
  onComment: (post: FoodPost) => void;
  onDeletePost: (postId: string, post: FoodPost) => void;
  slideAnim: Animated.Value;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  currentUserId: string | null;
  timeAgo: (date: Date) => string;
  onNotificationsPress?: () => void;
  unreadCount?: number;
}

const categories = [
  'All', 'Pizza', 'Burgers', 'Sushi', 'Desserts', 'Healthy', 
  'Street Food', 'Fine Dining', 'Breakfast', 'Beverages'
];

export const ExploreTab: React.FC<ExploreTabProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredPosts,
  loading,
  refreshing,
  onRefresh,
  onLike,
  onComment,
  onDeletePost,
  slideAnim,
  fadeAnim,
  scaleAnim,
  currentUserId,
  timeAgo,
  onNotificationsPress,
  unreadCount
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const categoryAnimations = useRef(categories.map(() => new Animated.Value(1))).current;

  const handleCategoryPress = (cat: string, index: number) => {
    setSelectedCategory(cat);
    NotificationService.provideHapticFeedback('selection');
    
    // Animate category selection
    Animated.sequence([
      Animated.timing(categoryAnimations[index], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(categoryAnimations[index], {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderPostCard = ({ item, index }: { item: FoodPost; index: number }) => {
    return (
      <PostCard
        item={item}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        scaleAnim={scaleAnim}
        currentUserId={currentUserId}
        onLike={onLike}
        onComment={onComment}
        onDeletePost={onDeletePost}
        timeAgo={timeAgo}
      />
    );
  };

  return (
    <View style={styles.exploreContainer}>
      {/* Animated Gradient Background */}
      <LinearGradient
        colors={['rgba(255, 122, 0, 0.15)', 'transparent']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Search and Notifications with Glass Effect */}
      <Animated.View 
        style={[
          styles.searchWrapper,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { 
                scale: scrollY.interpolate({
                  inputRange: [-100, 0, 100],
                  outputRange: [1.05, 1, 0.98],
                  extrapolate: 'clamp',
                })
              }
            ]
          }
        ]}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={22} color="rgba(255, 255, 255, 0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search delicious food..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={onNotificationsPress}
          style={styles.notificationButton}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={24} color="rgba(255, 255, 255, 0.9)" />
          {unreadCount && unreadCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </Animated.View>

      {/* Animated Categories with Glass Effect */}
      <Animated.View 
        style={[
          styles.categoryContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {categories.map((cat, index) => (
            <Animated.View
              key={index}
              style={{
                transform: [{ scale: categoryAnimations[index] }]
              }}
            >
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategory === cat && styles.activeCategoryItem
                ]}
                onPress={() => handleCategoryPress(cat, index)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.activeCategoryText
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Posts Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text style={styles.loadingText}>Loading delicious posts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id!}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={
            filteredPosts.length === 0 
              ? styles.emptyContainer 
              : { paddingBottom: 100, paddingTop: 8 }
          }
          ListEmptyComponent={() => (
            <Animated.View 
              style={[
                styles.emptyContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Ionicons 
                name="restaurant-outline" 
                size={80} 
                color="rgba(255, 255, 255, 0.2)" 
              />
              <Text style={styles.emptyText}>
                No posts found{'\n'}Be the first to share something delicious!
              </Text>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
};