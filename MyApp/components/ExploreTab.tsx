// components/ExploreTab.tsx - Updated with delete functionality
import React from 'react';
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
  onDeletePost: (postId: string, post: FoodPost) => void; // Add this new prop
  slideAnim: Animated.Value;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  currentUserId: string | null;
  timeAgo: (date: Date) => string;
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
  onDeletePost, // Add this new prop
  slideAnim,
  fadeAnim,
  scaleAnim,
  currentUserId,
  timeAgo
}) => {
  const renderPostCard = ({ item }: { item: FoodPost }) => (
    <PostCard
      item={item}
      fadeAnim={fadeAnim}
      slideAnim={slideAnim}
      scaleAnim={scaleAnim}
      currentUserId={currentUserId}
      onLike={onLike}
      onComment={onComment}
      onDeletePost={onDeletePost} // Pass the delete handler to PostCard
      timeAgo={timeAgo}
    />
  );

  return (
    <View style={styles.exploreContainer}>
      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.7)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search food posts..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
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
              onPress={() => {
                setSelectedCategory(cat);
                NotificationService.provideHapticFeedback('selection');
              }}
              activeOpacity={0.8}
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
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id!}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={filteredPosts.length === 0 ? styles.emptyContainer : { paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={80} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>
                No posts found{'\n'}Be the first to share something!
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};