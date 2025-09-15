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
  onDeletePost, // Add this new prop
  slideAnim,
  fadeAnim,
  scaleAnim,
  currentUserId,
  timeAgo,
  onNotificationsPress,
  unreadCount
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
      {/* Search and Notifications */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View
          style={[
            styles.searchContainer as any,
            { flex: 1, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Ionicons name="search-outline" size={20} color="#4B5563" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food posts..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#4B5563" />
            </TouchableOpacity>
          ) : null}
        </Animated.View>

        <TouchableOpacity
          onPress={onNotificationsPress}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight:10,
            marginLeft: 5,
            padding:5,
            marginBottom:10,
          }}
        >
          <Ionicons name="notifications-outline" size={20} color="#4B5563" />
          {unreadCount && unreadCount > 0 ? (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#FF3D71',
              borderRadius: 8,
              width: 20,
              height: 20,
              padding:10,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#FFFFFF',
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

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