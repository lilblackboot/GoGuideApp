// hereimport React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { useAuth } from '../AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import EditProfile from './EditProfile'; // Import your EditProfile component
const { width, height } = Dimensions.get('window');

// Floating particle component (reused from login)
const FloatingParticle = ({ index }) => {
  const animValue = useState(new Animated.Value(0))[0];
  const [randomProps] = useState({
    size: Math.random() * 30 + 15,
    startX: Math.random() * width,
    endX: Math.random() * width,
    duration: Math.random() * 10000 + 8000,
    delay: Math.random() * 3000,
    emoji: ['✨', '🌟', '💫', '🚀', '💜', '🌈'][Math.floor(Math.random() * 6)],
  });

  useEffect(() => {
    const animate = () => {
      animValue.setValue(0);
      Animated.timing(animValue, {
        toValue: 1,
        duration: randomProps.duration,
        delay: randomProps.delay,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start(() => animate());
    };
    animate();
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height + 50, -50],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [randomProps.startX, randomProps.endX, randomProps.startX],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.6, 0.6, 0],
  });

  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        {
          transform: [
            { translateY },
            { translateX },
            { rotate },
          ],
          opacity,
        },
      ]}
    >
      <Text style={[styles.particleEmoji, { fontSize: randomProps.size }]}>
        {randomProps.emoji}
      </Text>
    </Animated.View>
  );
};

// Main option card component
const OptionCard = ({ title, emoji, onPress, delay = 0 }) => {
  const scaleAnim = useState(new Animated.Value(0))[0];
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: delay,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.optionCard,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={pressed ? ['#ff6b6b', '#ff8e8e'] : ['#667eea', '#764ba2']}
          style={styles.optionGradient}
        >
          <Text style={styles.optionEmoji}>{emoji}</Text>
          <Text style={styles.optionTitle}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const { logout, user } = useAuth(); // Get user from auth context
  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || 'user');

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    setProfileModalVisible(false);
    logout();
  };

  const handleEditProfile = () => {
    setProfileModalVisible(false);
    setEditProfileVisible(true);
  };

  const handleOptionPress = (option) => {
    console.log(`Navigate to ${option}`);
    // Add navigation logic here
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      style={{ flex: 1 }}
    >
      {/* Floating particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with profile */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>hey there,</Text>
              <Text style={styles.userNameText}>{userName} ✨</Text>
            </View>
            
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setProfileModalVisible(true)}
            >
              <View style={styles.profilePicContainer}>
                <Text style={styles.profilePicEmoji}>🦄</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main content */}
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.sectionTitle}>what's the vibe today? 🌈</Text>
          
          <View style={styles.optionsGrid}>
            <OptionCard
              title="attendance calculator"
              emoji="📊"
              onPress={() => handleOptionPress('attendance')}
              delay={200}
            />
            <OptionCard
              title="find your teacher"
              emoji="👩‍🏫"
              onPress={() => handleOptionPress('teacher')}
              delay={400}
            />
            <OptionCard
              title="find your food"
              emoji="🍕"
              onPress={() => handleOptionPress('food')}
              delay={600}
            />
            <OptionCard
              title="events"
              emoji="🎉"
              onPress={() => handleOptionPress('events')}
              delay={800}
            />
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>made with 💜 for campus life</Text>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalProfilePic}>
                <Text style={styles.modalProfileEmoji}>🦄</Text>
              </View>
              <Text style={styles.modalUserName}>{userName}</Text>
              <Text style={styles.modalSubtext}>living the campus life 🌟</Text>
            </View>

            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleEditProfile}
              >
                <Text style={styles.modalOptionEmoji}>✏️</Text>
                <Text style={styles.modalOptionText}>edit profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalOption, styles.logoutOption]}
                onPress={handleLogout}
              >
                <Text style={styles.modalOptionEmoji}>👋</Text>
                <Text style={styles.modalOptionText}>log out</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal - Add this import: import EditProfile from './EditProfile'; */}
      {editProfileVisible && (
        <EditProfile
          visible={editProfileVisible}
          onClose={() => setEditProfileVisible(false)}
          currentUserName={userName}
          onUpdateProfile={(newName) => setUserName(newName)}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
    textTransform: 'lowercase',
  },
  userNameText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'lowercase',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  profileButton: {
    padding: 4,
  },
  profilePicContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  profilePicEmoji: {
    fontSize: 32,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
    textTransform: 'lowercase',
  },
  optionsGrid: {
    gap: 20,
  },
  optionCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  optionGradient: {
    padding: 25,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'lowercase',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#d0d0ff',
    fontSize: 12,
    fontStyle: 'italic',
    textTransform: 'lowercase',
  },
  floatingParticle: {
    position: 'absolute',
    zIndex: 1,
  },
  particleEmoji: {
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 30,
    width: width * 0.85,
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalProfilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#667eea',
  },
  modalProfileEmoji: {
    fontSize: 40,
  },
  modalUserName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textTransform: 'lowercase',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    textTransform: 'lowercase',
  },
  modalOptions: {
    width: '100%',
    gap: 15,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutOption: {
    backgroundColor: '#ffe0e0',
    borderColor: '#ffb3b3',
  },
  modalOptionEmoji: {
    fontSize: 20,
    marginRight: 15,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'lowercase',
  },
});