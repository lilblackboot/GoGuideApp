// FoodPostingStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  accent: '#4ECDC4',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  overlay: 'rgba(0,0,0,0.7)',
  gradient: {
    orange: ['#FF6B35', '#F7931E'],
    teal: ['#4ECDC4', '#44A08D'],
    purple: ['#667eea', '#764ba2'],
    pink: ['#f093fb', '#f5576c'],
  }
};

export const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  
  headerIcon: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: colors.surfaceVariant,
  },
  
  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  
  activeTabText: {
    color: colors.text,
  },
  
  // Explore Section
  exploreContainer: {
    flex: 1,
    padding: 20,
  },
  
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  
  categoryContainer: {
    marginBottom: 20,
  },
  
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
  },
  
  categoryScroll: {
    paddingVertical: 5,
  },
  
  categoryItem: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  activeCategoryItem: {
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
  },
  
  categoryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  activeCategoryText: {
    color: colors.text,
  },
  
  // Post Grid
  postsGrid: {
    flex: 1,
  },
  
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  userInfo: {
    flex: 1,
  },
  
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  
  location: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  postMedia: {
    width: '100%',
    height: 250,
    backgroundColor: colors.surfaceVariant,
  },
  
  postContent: {
    padding: 15,
  },
  
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  
  postDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  
  tag: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  
  tagText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    padding: 8,
    borderRadius: 10,
  },
  
  likedButton: {
    backgroundColor: `${colors.error}20`,
  },
  
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  
  likedText: {
    color: colors.error,
  },
  
  // Post Creation
  createContainer: {
    flex: 1,
    padding: 20,
  },
  
  createForm: {
    flex: 1,
  },
  
  inputGroup: {
    marginBottom: 20,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  textInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  focusedInput: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  mediaSection: {
    marginBottom: 20,
  },
  
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  
  activeMediaButton: {
    backgroundColor: colors.primary,
  },
  
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  
  activeMediaButtonText: {
    color: colors.text,
  },
  
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  
  mediaPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  
  locationSection: {
    marginBottom: 20,
  },
  
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  
  selectedLocationButton: {
    backgroundColor: colors.accent + '20',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  selectedLocationText: {
    color: colors.accent,
    fontWeight: '500',
  },
  
  tagsInput: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 10,
    minHeight: 50,
  },
  
  tagInputField: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    minWidth: 100,
  },
  
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  
  disabledButton: {
    backgroundColor: colors.surfaceVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  
  // Animations
  fadeIn: {
    opacity: 1,
  },
  
  fadeOut: {
    opacity: 0,
  },
  
  slideIn: {
    transform: [{ translateY: 0 }],
  },
  
  slideOut: {
    transform: [{ translateY: 50 }],
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.textSecondary,
  },
  
  // Empty States
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  
  closeButton: {
    padding: 5,
  },
});