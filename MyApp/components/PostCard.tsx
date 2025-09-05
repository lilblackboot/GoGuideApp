// components/PostCard.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import { FoodPost } from '../Services/FirebaseService';
import { styles } from '../styles/HomeStyles';
import { NotificationService } from '../Services/NotificationService';

interface PostCardProps {
  item: FoodPost;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  scaleAnim: Animated.Value;
  currentUserId: string | null;
  onLike: (postId: string) => void;
  onComment: (post: FoodPost) => void;
  timeAgo: (date: Date) => string;
}

export const PostCard: React.FC<PostCardProps> = ({
  item,
  fadeAnim,
  slideAnim,
  scaleAnim,
  currentUserId,
  onLike,
  onComment,
  timeAgo
}) => {
  const isLiked = currentUserId && item.likes.includes(currentUserId);

  const handleShare = () => {
    NotificationService.provideHapticFeedback('selection');
    // Implement share functionality
  };

  const handleBookmark = () => {
    NotificationService.provideHapticFeedback('selection');
    // Implement bookmark functionality
  };

  return (
    <Animated.View 
      style={[
        styles.postCard,
        { 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.postHeader}>
        <View style={styles.userAvatar}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.location}>
              {' '}{item.location.name} • {timeAgo(new Date(item.timestamp?.seconds * 1000 || Date.now()))}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* Full-width Media */}
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.postMedia}
          resizeMode="cover"
        />
      ) : item.videoUrl ? (
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.postMedia}
          shouldPlay={false}
          isLooping={false}
          useNativeControls={true}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={[styles.postMedia, { alignItems: 'center', justifyContent: 'center' }]}
        >
          <Ionicons name="image-outline" size={60} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
      )}

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription}>{item.description}</Text>
        
        {item.tags.length > 0 && (
          <View style={styles.postTags}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, isLiked && styles.likedButton]}
              onPress={() => onLike(item.id!)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={22}
                  color={isLiked ? "#FF3B30" : "rgba(255,255,255,0.7)"}
                />
              </Animated.View>
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {item.likes.length}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onComment(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.actionText}>{item.comments.length}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={handleBookmark}
          >
            <Ionicons name="bookmark-outline" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};