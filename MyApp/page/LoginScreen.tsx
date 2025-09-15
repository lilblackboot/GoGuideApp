import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  LoginScreen: undefined;
  ProfileData: undefined;
  Home: undefined;
  Events: undefined;
  Sections: undefined;
  AdminEvents: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginScreen'>;

// Enhanced Material-UI Inspired Colors
const colors = {
  primary: '#1976d2',
  primaryLight: '#42a5f5',
  primaryDark: '#0d47a1',
  secondary: '#f50057',
  secondaryLight: '#ff5983',
  accent: '#00bcd4',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  background: '#fafafa',
  surface: '#ffffff',
  surfaceElevated: '#f8f9ff',
  glass: 'rgba(255, 255, 255, 0.25)',
  glassLight: 'rgba(255, 255, 255, 0.15)',
  onSurface: '#1a1a1a',
  onSurfaceVariant: '#6b7280',
  outline: '#e5e7eb',
  shadow: 'rgba(25, 118, 210, 0.15)',
};

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEntry, setShowEntry] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonGlow = useRef(new Animated.Value(0)).current;
  const emailInputScale = useRef(new Animated.Value(1)).current;
  const passwordInputScale = useRef(new Animated.Value(1)).current;
  const toggleScale = useRef(new Animated.Value(1)).current;
  
  // Background animations
  const backgroundFloat1 = useRef(new Animated.Value(0)).current;
  const backgroundFloat2 = useRef(new Animated.Value(0)).current;
  const backgroundFloat3 = useRef(new Animated.Value(0)).current;
  const backgroundFloat4 = useRef(new Animated.Value(0)).current;
  const iconsFloat = useRef(new Animated.Value(0)).current;
  const particleFloat1 = useRef(new Animated.Value(0)).current;
  const particleFloat2 = useRef(new Animated.Value(0)).current;

  const { login, signup, adminLogin } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useEffect(() => {
    startBackgroundAnimations();
    startEntryAnimation();
  }, []);

  const startBackgroundAnimations = () => {
    // Enhanced floating animations with different speeds and patterns
    const createFloatingAnimation = (animValue: Animated.Value, delay: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createFloatingAnimation(backgroundFloat1, 0, 4000).start();
    createFloatingAnimation(backgroundFloat2, 1000, 5000).start();
    createFloatingAnimation(backgroundFloat3, 2000, 3500).start();
    createFloatingAnimation(backgroundFloat4, 500, 4500).start();
    createFloatingAnimation(iconsFloat, 1500, 3000).start();
    createFloatingAnimation(particleFloat1, 0, 6000).start();
    createFloatingAnimation(particleFloat2, 3000, 7000).start();
  };

  const startEntryAnimation = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowEntry(false);
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(formTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleLogoPress = () => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 0.85,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    logoRotation.stopAnimation((currentValue: number) => {
      Animated.timing(logoRotation, {
        toValue: currentValue + 1,
        duration: 800,
        easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
        useNativeDriver: true,
      }).start();
    });
  };

  const handleButtonPress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.96,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(buttonGlow, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(buttonGlow, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  const handleInputFocus = (inputType: 'email' | 'password') => {
    const scaleValue = inputType === 'email' ? emailInputScale : passwordInputScale;
    
    Animated.spring(scaleValue, {
      toValue: 1.02,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (inputType === 'email') {
      setEmailFocused(true);
    } else {
      setPasswordFocused(true);
    }
  };

  const handleInputBlur = (inputType: 'email' | 'password') => {
    const scaleValue = inputType === 'email' ? emailInputScale : passwordInputScale;
    
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();

    if (inputType === 'email') {
      setEmailFocused(false);
    } else {
      setPasswordFocused(false);
    }
  };

  const handleTogglePress = () => {
    Animated.sequence([
      Animated.spring(toggleScale, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(toggleScale, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    handleButtonPress();
    setLoading(true);
    
    try {
      try {
        await adminLogin(email, password);
        navigation.navigate('AdminEvents');
        setLoading(false);
        return;
      } catch (adminError) {
        console.log('Admin login failed, trying regular login');
      }

      if (isLogin) {
        await login(email, password);
        navigation.navigate('Events');
      } else {
        if (!/^[A-Za-z0-9._%+-]+@paruluniversity\.ac\.in$/.test(email)) {
          Alert.alert('Cannot register', 'Only use official Parul University email addresses for signup');
          setLoading(false);
          return;
        }
        await signup(email, password);
        navigation.navigate('ProfileData');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      Alert.alert('Error', errorMessage);
    }
    
    setLoading(false);
  };

  // Interpolated values for animations
  const backgroundFloat1Y = backgroundFloat1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const backgroundFloat2Y = backgroundFloat2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const backgroundFloat3Y = backgroundFloat3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const backgroundFloat4Y = backgroundFloat4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const iconsFloatY = iconsFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const particleFloat1Y = particleFloat1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const particleFloat2Y = particleFloat2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 35],
  });

  const logoRotationDegrees = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const buttonGlowOpacity = buttonGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  if (showEntry) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.splashContainer}
      >
        {/* Enhanced background particles */}
        <Animated.View
          style={[
            styles.splashParticle1,
            {
              transform: [
                { translateY: particleFloat1Y },
                { rotate: logoRotationDegrees },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.splashParticle2,
            {
              transform: [{ translateY: particleFloat2Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.splashParticle3,
            {
              transform: [
                { translateX: backgroundFloat1Y },
                { translateY: backgroundFloat2Y },
              ],
            },
          ]}
        />

        <Animated.View
          style={{
            transform: [
              { scale: logoScale },
              { rotate: logoRotationDegrees },
            ],
            opacity: logoOpacity,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={styles.splashLogo}>
            <Image
              source={require('../assets/goguide-logo.png')}
              style={{ width: 110, height: 110, resizeMode: 'contain' }}
              accessible
              accessibilityLabel="GoGuide logo"
            />
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.splashTitle}>GoGuide</Text>
          <Text style={styles.splashTagline}>Campus Navigation Redefined</Text>
          
          {/* Enhanced loading animation */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <Animated.View style={[styles.loadingProgress]} />
            </View>
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced gradient background */}
      <LinearGradient
        colors={[colors.background, colors.surfaceElevated, '#f0f4ff']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dynamic background elements */}
      <Animated.View
        style={[
          styles.backgroundElement1,
          {
            transform: [
              { translateY: backgroundFloat1Y },
              { rotate: '15deg' },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundElement2,
          {
            transform: [
              { translateY: backgroundFloat2Y },
              { rotate: '-20deg' },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundElement3,
          {
            transform: [
              { translateY: backgroundFloat3Y },
              { rotate: '25deg' },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.backgroundElement4,
          {
            transform: [
              { translateY: backgroundFloat4Y },
              { rotate: '-10deg' },
            ],
          },
        ]}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            },
          ]}
        >
          {/* Enhanced Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.8}>
              <Animated.View
                style={[
                  styles.logo,
                  {
                    transform: [
                      { scale: logoScale },
                      { rotate: logoRotationDegrees },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.logoGradient}
                >
                  <Image
                    source={require('../assets/goguide-logo.png')}
                    style={{ width: 65, height: 65, resizeMode: 'contain' }}
                    accessible
                    accessibilityLabel="GoGuide logo"
                  />
                </LinearGradient>
                <View style={styles.logoShadow} />
              </Animated.View>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>GoGuide</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            <Text style={styles.subtitle}>
              Your intelligent campus companion
            </Text>
          </View>

          {/* Glass morphism form */}
          <View style={styles.formGlassContainer}>
            <LinearGradient
              colors={[colors.glass, colors.glassLight]}
              style={styles.formGlass}
            >
              <View style={styles.form}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {isLogin ? 'Welcome Back!' : 'Join the Community'}
                  </Text>
                  <Text style={styles.formSubtitle}>
                    {isLogin 
                      ? 'Continue your journey with us' 
                      : 'Start exploring campus like never before'}
                  </Text>
                </View>

                {/* Enhanced Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    <Text style={styles.labelIcon}>✉️</Text> Email Address
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputWrapper,
                      {
                        transform: [{ scale: emailInputScale }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        emailFocused
                          ? [colors.primaryLight, colors.accent]
                          : [colors.outline, colors.outline]
                      }
                      style={styles.inputBorder}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          emailFocused && styles.inputFocused,
                        ]}
                        placeholder="your.name@paruluniversity.ac.in"
                        placeholderTextColor={colors.onSurfaceVariant}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => handleInputFocus('email')}
                        onBlur={() => handleInputBlur('email')}
                      />
                    </LinearGradient>
                    {emailFocused && <View style={styles.inputGlow} />}
                  </Animated.View>
                </View>

                {/* Enhanced Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    <Text style={styles.labelIcon}>🔐</Text> Password
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputWrapper,
                      {
                        transform: [{ scale: passwordInputScale }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        passwordFocused
                          ? [colors.primaryLight, colors.accent]
                          : [colors.outline, colors.outline]
                      }
                      style={styles.inputBorder}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          passwordFocused && styles.inputFocused,
                        ]}
                        placeholder="Enter your secure password"
                        placeholderTextColor={colors.onSurfaceVariant}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        onFocus={() => handleInputFocus('password')}
                        onBlur={() => handleInputBlur('password')}
                      />
                    </LinearGradient>
                    {passwordFocused && <View style={styles.inputGlow} />}
                  </Animated.View>
                </View>

                {/* Premium Submit Button */}
                <Animated.View
                  style={[
                    styles.buttonContainer,
                    {
                      transform: [{ scale: buttonScale }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.submitBtnContainer}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={
                        loading
                          ? [colors.onSurfaceVariant, colors.outline]
                          : [colors.primary, colors.primaryLight, colors.accent]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitBtn}
                    >
                      <Text style={styles.submitText}>
                        {loading ? (
                          <Text>
                            <Text style={styles.loadingSpinner}>⟳</Text> Please wait...
                          </Text>
                        ) : (
                          <Text>
                            {isLogin ? '🚀 Sign In' : '✨ Create Account'}
                          </Text>
                        )}
                      </Text>
                    </LinearGradient>
                    
                    {/* Animated glow effect */}
                    <Animated.View
                      style={[
                        styles.buttonGlow,
                        { opacity: buttonGlowOpacity },
                      ]}
                    />
                  </TouchableOpacity>
                </Animated.View>

                {/* Enhanced Toggle Button */}
                <Animated.View
                  style={{
                    transform: [{ scale: toggleScale }],
                  }}
                >
                  <TouchableOpacity 
                    onPress={handleTogglePress} 
                    style={styles.toggleButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors.glass, colors.glassLight]}
                      style={styles.toggleGradient}
                    >
                      <Text style={styles.toggleText}>
                        {isLogin
                          ? '✨ New to GoGuide? Create Account'
                          : '👋 Already have an account? Sign In'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>

          {/* Premium Bottom Icons */}
          <Animated.View
            style={[
              styles.bottomIcons,
              {
                transform: [{ translateY: iconsFloatY }],
              },
            ]}
          >
            {[
              { icon: '🎓', color: colors.primary, label: 'Learn' },
              { icon: '🍽️', color: colors.secondary, label: 'Dine' },
              { icon: '📚', color: colors.accent, label: 'Study' },
              { icon: '🧭', color: colors.success, label: 'Navigate' },
            ].map((item, index) => (
              <View key={index} style={styles.iconContainer}>
                <LinearGradient
                  colors={[item.color, `${item.color}CC`]}
                  style={styles.iconGradient}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                </LinearGradient>
                <Text style={styles.iconLabel}>{item.label}</Text>
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  splashTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
    fontWeight: '300',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    width: 200,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
    width: '70%',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '300',
  },
  splashParticle1: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  splashParticle2: {
    position: 'absolute',
    bottom: '25%',
    left: '8%',
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 75,
  },
  splashParticle3: {
    position: 'absolute',
    top: '40%',
    left: '15%',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
  },

  // Main Screen Styles
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    minHeight: height,
    justifyContent: 'center',
  },

  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 20,
    position: 'relative',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 47.5,
    backgroundColor: colors.shadow,
    top: 5,
    left: -2.5,
    zIndex: -1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },

  // Form Styles
  formGlassContainer: {
    marginHorizontal: 4,
    marginBottom: 32,
  },
  formGlass: {
    borderRadius: 32,
    padding: 2,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    padding: 32,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Input Styles
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 12,
    marginLeft: 4,
  },
  labelIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputBorder: {
    borderRadius: 20,
    padding: 2,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: colors.onSurface,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  inputFocused: {
    backgroundColor: colors.surfaceElevated,
  },
  inputGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    opacity: 0.15,
    zIndex: -1,
  },

  // Button Styles
  buttonContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  submitBtnContainer: {
    position: 'relative',
    borderRadius: 20,
  },
  submitBtn: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  loadingSpinner: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: colors.primaryLight,
    borderRadius: 25,
    zIndex: -1,
  },

  // Toggle Button Styles
  toggleButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  toggleGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  toggleText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // Bottom Icons Styles
  bottomIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
    gap: 8,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.onSurface,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  icon: {
    fontSize: 24,
  },
  iconLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Background Elements
  backgroundElement1: {
    position: 'absolute',
    top: '8%',
    right: '5%',
    width: 120,
    height: 120,
    backgroundColor: colors.primaryLight,
    borderRadius: 60,
    opacity: 0.08,
  },
  backgroundElement2: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    width: 80,
    height: 80,
    backgroundColor: colors.accent,
    borderRadius: 40,
    opacity: 0.06,
  },
  backgroundElement3: {
    position: 'absolute',
    bottom: '25%',
    right: '15%',
    width: 100,
    height: 100,
    backgroundColor: colors.secondary,
    borderRadius: 50,
    opacity: 0.05,
  },
  backgroundElement4: {
    position: 'absolute',
    bottom: '45%',
    left: '5%',
    width: 60,
    height: 60,
    backgroundColor: colors.success,
    borderRadius: 30,
    opacity: 0.07,
  },
});

export default LoginScreen;