// components/CommentsModal.tsx - Glassmorphism Comments
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FoodPost, Comment } from '../Services/FirebaseService';
import { styles } from '../styles/HomeStyles';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  post: FoodPost | null;
  comments: Comment[];
  newComment: string;
  setNewComment: (text: string) => void;
  onAddComment: () => void;
  keyboardHeight: number;
  timeAgo: (date: Date) => string;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  post,
  comments,
  newComment,
  setNewComment,
  onAddComment,
  keyboardHeight,
  timeAgo,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 9,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const renderComment = ({ item, index }: { item: Comment; index: number }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Ionicons name="person" size={20} color="rgba(255, 255, 255, 0.8)" />
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTime}>{timeAgo(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            flex: 1,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <Animated.View
              style={[
                styles.commentModal,
                {
                  transform: [{ translateY }],
                  paddingBottom: keyboardHeight,
                },
              ]}
            >
              {/* Glassmorphism Background */}
              <LinearGradient
                colors={['rgba(20, 20, 20, 0.98)', 'rgba(10, 10, 10, 0.98)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderTopLeftRadius: 32,
                  borderTopRightRadius: 32,
                }}
              />

              {/* Handle */}
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.commentHeader}>
                <Text style={styles.commentTitle}>
                  Comments ({comments.length})
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="rgba(255, 255, 255, 0.9)" />
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                style={styles.commentsList}
                contentContainerStyle={{ paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={64}
                      color="rgba(255, 255, 255, 0.2)"
                    />
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 16,
                        marginTop: 16,
                      }}
                    >
                      No comments yet. Be the first!
                    </Text>
                  </View>
                )}
              />

              {/* Input Container */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
              >
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      !newComment.trim() && styles.disabledSendButton,
                    ]}
                    onPress={onAddComment}
                    disabled={!newComment.trim()}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        newComment.trim()
                          ? ['#FF7A00', '#FF3D71']
                          : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sendButton}
                    >
                      <Ionicons
                        name="send"
                        size={20}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};