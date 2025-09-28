// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';

// Extend Firebase User with isAdmin only
interface AuthUser extends User {
  isAdmin?: boolean;
}

interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  photoURL?: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  adminLogin: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Local storage keys (AsyncStorage - FREE)
  const ADMIN_SESSION_KEY = '@admin_session';
  const ADMIN_CREDENTIALS_KEY = '@admin_credentials';

  // Initialize admin credentials in AsyncStorage (FREE alternative to Firestore)
  const initializeAdminCredentials = async (): Promise<void> => {
    try {
      const existingCredentials = await AsyncStorage.getItem(ADMIN_CREDENTIALS_KEY);
      
      if (!existingCredentials) {
        // Set default admin credentials locally
        const adminCredentials = {
          username: 'admin123',
          password: 'admin@123', // In production, hash this
          createdAt: new Date().toISOString()
        };
        await AsyncStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(adminCredentials));
      }
    } catch (error) {
      console.error('Error initializing admin credentials:', error);
    }
  };

  // Save admin session locally
  const saveAdminSession = async (adminUser: AdminUser): Promise<void> => {
    try {
      const sessionData = {
        user: adminUser,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error saving admin session:', error);
    }
  };

  // Load admin session from local storage
  const loadAdminSession = async (): Promise<AdminUser | null> => {
    try {
      const sessionData = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
      
      if (sessionData) {
        const { user, expiresAt } = JSON.parse(sessionData);
        
        // Check if session has expired
        if (new Date(expiresAt) > new Date()) {
          return user;
        } else {
          // Session expired, clear it
          await clearAdminSession();
        }
      }
    } catch (error) {
      console.error('Error loading admin session:', error);
    }
    return null;
  };

  // Clear admin session
  const clearAdminSession = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing admin session:', error);
    }
  };

  const signup = async (email: string, password: string): Promise<any> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore (this is FREE in Firebase)
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isAdmin: false,
        photoURL: '😎',
        bookedEvents: []
      });

      // Clear any admin session when regular user signs up
      await clearAdminSession();
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<any> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Clear any admin session when regular user logs in
      await clearAdminSession();
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const adminLogin = async (username: string, password: string): Promise<any> => {
    try {
      // Get admin credentials from local storage (FREE)
      const credentialsData = await AsyncStorage.getItem(ADMIN_CREDENTIALS_KEY);
      
      if (!credentialsData) {
        throw new Error('Admin credentials not found');
      }

      const adminCredentials = JSON.parse(credentialsData);
      
      // Validate credentials
      if (username === adminCredentials.username && password === adminCredentials.password) {
        const adminUser: AdminUser = {
          uid: 'admin_user',
          email: 'admin@goguide.com',
          displayName: 'Admin User',
          isAdmin: true,
          photoURL: '👨‍💼'
        };

        // Save admin session locally
        await saveAdminSession(adminUser);
        
        // Update state
        setCurrentUser(adminUser);
        setIsAdmin(true);
        
        return { user: adminUser };
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isAdmin && currentUser?.uid === 'admin_user') {
        // Clear admin session
        await clearAdminSession();
      } else {
        // Sign out from Firebase
        await signOut(auth);
      }
      
      // Reset state
      setCurrentUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Reset state even if logout fails
      setCurrentUser(null);
      setIsAdmin(false);
    }
  };

  const updateProfile = async (data: any): Promise<void> => {
    try {
      if (currentUser && currentUser.uid !== 'admin_user') {
        // Update in Firestore (FREE)
        await updateDoc(doc(db, 'users', currentUser.uid), {
          ...data,
          updatedAt: Timestamp.now()
        });
        
        // Update local state
        setCurrentUser(prev => (prev ? { ...prev, ...data } : null));
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Initialize admin credentials locally
        await initializeAdminCredentials();

        // First, check for existing admin session
        const existingAdminSession = await loadAdminSession();
        if (existingAdminSession && isMounted) {
          setCurrentUser(existingAdminSession);
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Set up Firebase auth state listener (this handles regular user sessions automatically)
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!isMounted) return;

          try {
            if (user) {
              // User is signed in with Firebase
              const userRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userRef);
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const authUser: AuthUser = {
                  ...user,
                  isAdmin: userData.isAdmin || false,
                  photoURL: userData.photoURL || '😎'
                };
                
                setIsAdmin(userData.isAdmin || false);
                setCurrentUser(authUser);
              } else {
                // Create user document if it doesn't exist
                const newUserData = {
                  email: user.email,
                  createdAt: Timestamp.now(),
                  updatedAt: Timestamp.now(),
                  isAdmin: false,
                  photoURL: '😎',
                  bookedEvents: []
                };
                
                await setDoc(userRef, newUserData);
                
                setCurrentUser({
                  ...user,
                  isAdmin: false,
                  photoURL: '😎'
                });
                setIsAdmin(false);
              }
            } else {
              // No Firebase user - check again for admin session (in case it was set after Firebase check)
              const adminSession = await loadAdminSession();
              if (adminSession && isMounted) {
                setCurrentUser(adminSession);
                setIsAdmin(true);
              } else {
                setCurrentUser(null);
                setIsAdmin(false);
              }
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setCurrentUser(null);
            setIsAdmin(false);
          }
          
          if (isMounted) {
            setLoading(false);
          }
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    isAdmin,
    loading,
    signup,
    login,
    adminLogin,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};