// navigationUtils.tsx
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

// Custom hook for navigation with auth awareness
export const useAuthNavigation = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigation = useNavigation();

  const navigateBasedOnAuth = () => {
    if (currentUser) {
      if (isAdmin) {
        navigation.navigate('AdminEvents' as never);
      } else {
        navigation.navigate('HomeScreen' as never);
      }
    } else {
      navigation.navigate('Login' as never);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled automatically by the auth state change
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return {
    currentUser,
    isAdmin,
    navigateBasedOnAuth,
    handleLogout,
    navigation
  };
};

// Reusable Logout Button Component
export const LogoutButton = ({ style = {}, textStyle = {} }) => {
  const { handleLogout } = useAuthNavigation();

  return (
    <TouchableOpacity 
      style={[styles.logoutButton, style]} 
      onPress={handleLogout}
    >
      <Text style={[styles.logoutText, textStyle]}>Logout</Text>
    </TouchableOpacity>
  );
};

// Header component with user info and logout
export const AuthHeader = ({ title = '', showLogout = true }) => {
  const { currentUser, isAdmin } = useAuth();
  const { handleLogout } = useAuthNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>{title}</Text>
        {currentUser && (
          <Text style={styles.headerSubtitle}>
            {isAdmin ? 'Admin User' : currentUser.email}
          </Text>
        )}
      </View>
      
      {showLogout && currentUser && (
        <TouchableOpacity 
          style={styles.headerLogoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.headerLogoutText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerLogoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  headerLogoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

// Example usage in a screen:
export const ExampleScreenWithLogout = () => {
  const { currentUser, isAdmin, handleLogout } = useAuthNavigation();

  return (
    <View style={{ flex: 1 }}>
      <AuthHeader 
        title="My Screen" 
        showLogout={true} 
      />
      
      {/* Your screen content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Welcome {isAdmin ? 'Admin' : currentUser?.email}</Text>
        
        {/* Or use the standalone logout button */}
        <LogoutButton />
      </View>
    </View>
  );
};