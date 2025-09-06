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
  AdminEvents: undefined;
  // add other screens here if needed
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginScreen'>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { login, signup, adminLogin } = useAuth();

  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleSubmit = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      // Try admin login first
      try {
        await adminLogin(email, password);
        navigation.navigate('AdminEvents');
        setLoading(false);
        return;
      } catch (adminError) {
        // If admin login fails, continue with regular login/signup
        console.log('Admin login failed, trying regular login');
      }

      // Regular user login/signup
      if (isLogin) {
        await login(email, password);
        navigation.navigate('Sections');
      } else {
        // Only allow @paruluniversity.ac.in emails for signup
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#18181b' }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
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
            Never lost around the campus
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isLogin ? 'Welcome Back!' : 'Join GoGuide'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isLogin ? 'Sign in to continue' : 
             'Create account and find your way around campus'}
          </Text>

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
                {loading ? 'Loading...' : 
                 isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Toggle Button */}
          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)} 
            style={{ paddingVertical: 12 }}
          >
            <Text style={styles.toggleText}>
              {isLogin
                ? 'New to GoGuide? Sign Up'
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Decoration */}
        <View style={styles.bottomIcons}>
          <Text style={styles.icon}>👨‍🏫</Text>
          <Text style={styles.icon}>🍜</Text>
          <Text style={styles.icon}>📚</Text>
          <Text style={styles.icon}>🔖</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#18181b',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    backgroundColor: '#27272a',
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
    color: '#fafafa',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f9a8d4',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#23232b',
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
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 2,
    borderColor: '#27272a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#fafafa',
    fontSize: 16,
  },
  gradientBtn: {
    borderRadius: 16,
    marginBottom: 24,
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
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  toggleText: {
    color: '#f472b6',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
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

export default LoginScreen;