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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

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
      } else {
        await signup(email, password);
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
    <ScrollView style={{ flex: 1, backgroundColor: '#f87171' /* fallback color */ }}>
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              loading
                ? { backgroundColor: '#d1d5db' }
                : { backgroundColor: '#f97316' }, // fallback for gradient
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Loading...' : isLogin ? '🍽️ Sign In' : '🚀 Create Account'}
            </Text>
          </TouchableOpacity>

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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
    backgroundColor: '#ffffff',
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
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffedd5',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#374151',
  },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  submitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  toggleText: {
    color: '#ea580c',
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
