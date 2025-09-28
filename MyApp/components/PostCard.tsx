// components/PostCard.tsx - Glassmorphism Post Card with Animations
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FoodPost } from '../Services/FirebaseService';
import { styles } from '../styles/HomeStyles';

interface PostCardProps {
  item: FoodPost;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  scaleAnim: Animated.Value;
  currentUserId: string | null;
  onLike: (postId: string) => void;
  onComment: (post: FoodPost) => void;
  onDeletePost: (postId: string, post: FoodPost) => void;
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
  onDeletePost,
  timeAgo,
}) => {
  const cardScale = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const commentScale = useRef(new Animated.Value(1)).current;
  const mediaOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;

  const isLiked = item.likes.includes(currentUserId || '');
  const isOwner = item.userId === currentUserId;

  useEffect(() => {
    // Animate card entry
    Animated.parallel([
      Animated.timing(mediaOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(contentSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLikePress = () => {
    // Animate like button
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onLike(item.id!);
  };

  const handleCommentPress = () => {
    // Animate comment button
    Animated.sequence([
      Animated.timing(commentScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(commentScale, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onComment(item);
  };

  const handleCardPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.postCard,
        {
          transform: [{ scale: cardScale }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Glass Card Background Effect */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 24,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color="rgba(255, 255, 255, 0.8)" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="location-outline"
              size={14}
              color="rgba(255, 255, 255, 0.6)"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.location}>{item.location.name}</Text>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeletePost(item.id!, item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {/* Post Media with Fade Animation */}
      <Animated.View style={{ opacity: mediaOpacity }}>
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
            useNativeControls
            resizeMode="cover"
            isLooping={false}
          />
        ) : null}
      </Animated.View>

      {/* Post Content with Slide Animation */}
      <Animated.View
        style={[
          styles.postContent,
          { transform: [{ translateY: contentSlide }] },
        ]}
      >
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={styles.postTags}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.postActions}>
          <View style={styles.actionButtons}>
            {/* Like Button */}
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isLiked && styles.likedButton,
                ]}
                onPress={handleLikePress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isLiked ? '#FF3B30' : 'rgba(255, 255, 255, 0.8)'}
                />
                <Text style={[styles.actionText, isLiked && styles.likedText]}>
                  {item.likes.length}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Comment Button */}
            <Animated.View style={{ transform: [{ scale: commentScale }] }}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCommentPress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color="rgba(255, 255, 255, 0.8)"
                />
                <Text style={styles.actionText}>{item.comments.length}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Timestamp */}
          <Text style={styles.postTime}>{timeAgo(item.timestamp)}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};