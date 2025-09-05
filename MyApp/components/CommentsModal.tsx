// components/CommentsModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  timeAgo
}) => {
  const handleClose = () => {
    onClose();
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.commentModal}>
            <TouchableOpacity 
              style={styles.modalHandle} 
              onPress={handleClose}
            />
            
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>
                Comments ({comments.length})
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.commentsList}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {comments.map((comment, index) => (
                <View key={index} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                      {comment.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{comment.username}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <Text style={styles.commentTime}>
                      {timeAgo(new Date(comment.timestamp?.seconds * 1000 || Date.now()))}
                    </Text>
                  </View>
                </View>
              ))}
              
              {comments.length === 0 && (
                <View style={[styles.emptyContainer, { paddingTop: 60 }]}>
                  <Ionicons name="chatbubble-outline" size={60} color="rgba(255,255,255,0.2)" />
                  <Text style={styles.emptyText}>No comments yet{'\n'}Be the first to comment!</Text>
                </View>
              )}
            </ScrollView>
            
            <View 
              style={[
                styles.commentInputContainer,
                { paddingBottom: Math.max(20, keyboardHeight > 0 ? 20 : 34) }
              ]}
            >
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={onAddComment}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !newComment.trim() && styles.disabledSendButton
                ]}
                onPress={onAddComment}
                disabled={!newComment.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={20} color={!newComment.trim() ? "rgba(255,255,255,0.5)" : "#000000"} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};