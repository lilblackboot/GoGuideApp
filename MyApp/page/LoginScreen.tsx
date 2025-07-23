import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
  LoginScreen: undefined;
  ProfileData: undefined;
  Home: undefined;
  Sections: undefined;
  // add other screens here if needed
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'LoginScreen'>>();
 // const navigation = useNavigation();


  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Only allow @paruluniversity.ac.in emails for signup
    if (!isLogin && !/^[A-Za-z0-9._%+-]+@paruluniversity\.ac\.in$/.test(email)) {
      Alert.alert('Can not register', 'Only use offical Parul University email addresses for signup');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        navigation.navigate('Sections')
      } else {
        await signup(email, password);
        navigation.navigate('ProfileData');
      }
    } catch (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: string }).message)
        : 'An unexpected error occurred';
      Alert.alert('Error', errorMessage);
    }
    setLoading(false);
  };

  return (
    // To support gradients, wrap this in LinearGradient instead
    <ScrollView style={{ flex: 1, backgroundColor: '#18181b' /* dark background */ }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo image for GoGuide */}
          <View style={styles.logo}>
            <Image
              source={require('../assets/goguide-logo.png')}
              style={{ width: 70, height: 70, resizeMode: 'contain' }}
              accessible
              accessibilityLabel="GoGuide logo"
            />
          </View>
          <Text style={styles.title}>GoGuide</Text>
          <Text style={styles.subtitle}>
            Never hungry around the campus
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isLogin ? 'Welcome Back!' : 'Join GoGuide'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isLogin
              ? 'Sign in to continue exploxing the best food around'
              : 'Create account and find your food'}
          </Text>

          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#71717a"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#71717a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Submit Button with Gradient */}
          <LinearGradient
            colors={loading ? ['#52525b', '#71717a'] : ['#ec4899', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: 'transparent' }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {loading ? 'Loading...' : isLogin ? '🍽️ Sign In' : '🚀 Create Account'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Toggle Button */}
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ paddingVertical: 12 }}>
            <Text style={styles.toggleText}>
              {isLogin
                ? 'New to GoGuide? Sign Up'
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Decoration */}
        <View style={styles.bottomIcons}>
          <Text style={styles.icon}>🍔</Text>
          <Text style={styles.icon}>🍜</Text>
          <Text style={styles.icon}>🍰</Text>
          <Text style={styles.icon}>🥗</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#18181b', // dark background
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
    backgroundColor: '#27272a', // darker circle
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fafafa', // light text
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f9a8d4', // soft pink
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#23232b', // dark form
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginHorizontal: 8,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#fafafa',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#a1a1aa', // muted grey
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb', // lighter label
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#18181b', // input dark
    borderWidth: 2,
    borderColor: '#27272a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#fafafa',
  },
  gradientBtn: {
    borderRadius: 16,
    marginBottom: 24,
    // paddingVertical: 16, // handled by submitBtn
    alignItems: 'center',
    shadowColor: '#ec4899',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    // backgroundColor: 'transparent', // handled in render
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  toggleText: {
    color: '#f472b6', // pink
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  icon: {
    fontSize: 24,
  },
});
