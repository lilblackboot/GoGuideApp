// Sections.tsx - Main home screen with navigation and profile management
import React, { useState, useEffect } from 'react';
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
import { firebaseService } from '../Services/FirebaseService';
import { getNavNotificationCounts } from '../utils/navNotificationUtils';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileData from './ProfileData'; 
const { width, height } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaskedView from '@react-native-masked-view/masked-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Red dot notification indicator
const RedDot = () => (
  <View style={{
    position: 'absolute',
    top: 2,
    right: -7,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f43f5e',
    borderWidth: 2,
    borderColor: '#23232b',
    zIndex: 10,
  }} />
);
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Removed due to missing module

// Floating particle component (reused from login)
type FloatingParticleProps = { index: number };
const FloatingParticle: React.FC<FloatingParticleProps> = ({ index }) => {
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

// Helper for right arrow
const RightArrow = () => <Text style={{ fontSize: 22, color: '#fff', marginLeft: 8 }}>→</Text>;

// Main option card component
type OptionCardProps = {
  title: React.ReactNode | string;
  emoji?: string | null;
  onPress: () => void;
  delay?: number;
  gradientColors: [string, string];
  size?: 'small' | 'large'; // Added size prop
};
const OptionCard: React.FC<OptionCardProps> = ({ title, emoji, onPress, delay = 0, gradientColors, size }) => {
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

  const isDarkButton = Array.isArray(gradientColors) && gradientColors[0] === '#23232b';
  const cardStyle = [
    styles.optionCard,
    {
      transform: [{ scale: scaleAnim }],
      minHeight: size === 'large' ? 150 : 120, // Adjust minHeight based on size
    },
  ];

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={cardStyle}
      >
        {isDarkButton ? (
          <View style={[styles.optionGradient, { backgroundColor: '#23232b' }]}> 
            {emoji ? <Text style={styles.optionEmoji}>{emoji}</Text> : null}
            {typeof title === 'string' ? (
              <Text style={styles.optionTitle}>{title}</Text>
            ) : (
              title
            )}
          </View>
        ) : (
          <LinearGradient
            colors={pressed ? ([...gradientColors].reverse() as [string, string]) : (gradientColors as [string, string])}
            style={styles.optionGradient}
          >
            {emoji ? <Text style={styles.optionEmoji}>{emoji}</Text> : null}
            {typeof title === 'string' ? (
              <Text style={styles.optionTitle}>{title}</Text>
            ) : (
              title
            )}
          </LinearGradient>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Gradient text helper
const GradientText = ({ text, gradientColors }: { text: string, gradientColors: [string, string] }) => (
  <MaskedView maskElement={<Text style={{ fontWeight: 'bold', fontSize: 18, textTransform: 'lowercase' }}>{text}</Text>}>
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Text style={{ opacity: 0, fontWeight: 'bold', fontSize: 18, textTransform: 'lowercase' }}>{text}</Text>
    </LinearGradient>
  </MaskedView>
);
const GradientArrow = ({ gradientColors }: { gradientColors: [string, string] }) => (
  <MaskedView maskElement={<Text style={{ fontSize: 22, marginLeft: 8 }}>→</Text>}>
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Text style={{ opacity: 0, fontSize: 22, marginLeft: 8 }}>→</Text>
    </LinearGradient>
  </MaskedView>
);

// Gradient icon helpers
const GradientIcon = ({ icon, gradientColors, iconType, size = 32 }: { icon: string, gradientColors: [string, string], iconType?: 'vector', size?: number }) => (
  <MaskedView maskElement={
    iconType === 'vector'
      ? <MaterialCommunityIcons name={icon as any} size={size} color="#000" />
      : <Text style={{ fontSize: size }}>{icon}</Text>
  }>
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      {iconType === 'vector'
        ? (
            
            <MaterialCommunityIcons name={icon as any} size={size} color="transparent" />
          )
        : <Text style={{ opacity: 0, fontSize: size }}>{icon}</Text>
      }
    </LinearGradient>
  </MaskedView>
);

export default function HomeScreen() {
  const { currentUser, logout } = useAuth();
  // Real notification state for each nav page
  const [navNotifications, setNavNotifications] = useState({
    home: false,
    food: false,
    event: false,
    calculator: false,
    assistant: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchNotifications() {
      if (!currentUser?.uid) return;
      try {
        const notifications = await firebaseService.getNotifications(currentUser.uid);
        if (isMounted) {
          setNavNotifications(getNavNotificationCounts(notifications));
        }
      } catch (e) {
        // Optionally handle error
      }
    }
    fetchNotifications();
    return () => { isMounted = false; };
  }, [currentUser?.uid]);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const displayName = currentUser?.displayName || 'Guest';
  const profileEmoji = currentUser?.photoURL || '😎';
  //const { logout, user } = useAuth(); // Get user from auth context
  const [userName, setUserName] = useState(currentUser?.displayName || currentUser?.email?.split('@')[0] || 'user');

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
  type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    ProfileData: undefined;
    Sections: undefined;
    Chatbot: undefined;
    Calculator: undefined;
    Events: undefined;  // Add Events screen to the stack
    // Add other screens here as needed
  };
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleChatbot = () => {
    setMenuVisible(false);
    navigation.navigate('Chatbot');
  };
const handleCalculator = () => {
    setMenuVisible(false);
    navigation.navigate('Calculator');
  };
  const handleLogout = () => {
    setMenuVisible(false);
    logout();
    navigation.navigate('Login');
  };

  const handleEditProfile = () => {
    setMenuVisible(false);
    navigation.navigate('ProfileData');
  };

  const handleOptionPress = (option: string) => {
    if (option === 'events') {
      navigation.navigate('Events'); // Navigate to Events page
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <LinearGradient
      colors={['#18181b', '#23232b']}
      style={{ flex: 1 }}
    >
      {/* Floating particles */}
      {/* {Array.from({ length: 5 }).map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))} */}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with profile */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: 'center',
            },
          ]}
        >
          {/* 3-dots menu icon at top right */}
          <TouchableOpacity
            style={styles.menuIcon}
            onPress={() => setMenuVisible((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 28, color: '#fff' }}>⋮</Text>
          </TouchableOpacity>
          {/* Dropdown menu */}
          {menuVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleEditProfile}>
                <Text style={styles.dropdownText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.headerContentContainer}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.profilePicContainer}
                onPress={() => setProfileModalVisible(true)}
              >
                <Text style={styles.profilePicEmoji}>{profileEmoji}</Text>
              </TouchableOpacity>
              <Text style={styles.welcomeText}>hey there,</Text>
              <MaskedView maskElement={<Text style={styles.userNameText}>{displayName} </Text>}>
                <LinearGradient colors={["#f43f5e", "#f97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={[styles.userNameText, { opacity: 0 }]}>{displayName} </Text>
                </LinearGradient>
              </MaskedView>
              {currentUser?.email && (
                <Text style={styles.userEmailText}>{currentUser.email}</Text>
              )}
            </View>
          </View>
          {/* Attendance and Teacher options row below email */}
          <View style={{ gap: 16, width: '100%', marginBottom: 24 }}>
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
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBarContainer}>
        <LinearGradient
          colors={["#23232b", "#18181b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bottomNavBar}
        >
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Sections')}>
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name="home-variant" size={28} color="#fff" />
              {navNotifications.home && <RedDot />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleOptionPress('Home')}>
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name="food" size={28} color="#fbbf24" />
              {navNotifications.food && <RedDot />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => handleOptionPress('events')}>
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name="calendar-star" size={28} color="#a855f7" />
              {/* {navNotifications.event && <RedDot />} */}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleCalculator}>
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name="calculator-variant" size={28} color="#f472b6" />
              {navNotifications.calculator && <RedDot />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleChatbot}>
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name="robot-excited" size={28} color="#10b981" />
              {navNotifications.assistant && <RedDot />}
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>

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
              <Text style={styles.modalUserName}>{displayName}</Text>
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
        <ProfileData />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 20,
    backgroundColor: 'transparent',
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 12,
    backgroundColor: 'rgba(35,35,43,0.98)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'lowercase',
    marginTop: 2,
    letterSpacing: 0.2,
    opacity: 0.85,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  headerContentContainer: {
    paddingTop: 100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(35, 35, 43, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: -200,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
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
  userEmailText: {
    fontSize: 14,
    color: '#fafafa',
    marginTop: 2,
    marginBottom: 4,
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },
  userEmailBlurContainer: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  profileButton: {
    padding: 4,
  },
  profilePicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  profilePicEmoji: {
    fontSize: 60,
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
  menuIcon: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 20,
    padding: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 54,
    right: 18,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    zIndex: 30,
    minWidth: 140,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // New styles for the main buttons container
  mainButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  leftButtonContainer: {
    flex: 1,
  },
  rightButtonsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  topRightButtonContainer: {
    flex: 1,
  },
  bottomRightButtonContainer: {
    flex: 1,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
});