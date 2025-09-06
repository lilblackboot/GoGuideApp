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
import { auth, db } from './firebaseConfig';

// Extend Firebase User with isAdmin only (don't override photoURL)
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

  // Initialize admin credentials in Firestore (run once)
  const initializeAdminCredentials = async (): Promise<void> => {
    try {
      const adminRef = doc(db, 'admin', 'credentials');
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        // Set default admin credentials (change these!)
        await setDoc(adminRef, {
          username: 'admin123',
          password: 'admin@123', // In production, this should be hashed
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error initializing admin credentials:', error);
    }
  };

  const signup = async (email: string, password: string): Promise<any> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isAdmin: false,
        photoURL: '😎', // Default emoji
        bookedEvents: []
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const login = (email: string, password: string): Promise<any> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const adminLogin = async (username: string, password: string): Promise<any> => {
    try {
      const adminRef = doc(db, 'admin', 'credentials');
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        throw new Error('Admin credentials not found');
      }

      const adminData = adminDoc.data();

      // Only check the stored credentials from Firestore
      if (username === adminData.username && password === adminData.password) {
        const adminUser: AdminUser = {
          uid: 'admin_user',
          email: 'admin@goguide.com',
          displayName: 'Admin User',
          isAdmin: true,
          photoURL: '👨‍💼'
        };

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
        setCurrentUser(null);
        setIsAdmin(false);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: any): Promise<void> => {
    try {
      if (currentUser && currentUser.uid !== 'admin_user') {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          ...data,
          updatedAt: Timestamp.now()
        });

        // Update local user state
        setCurrentUser(prev => (prev ? { ...prev, ...data } : null));
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    initializeAdminCredentials();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.isAdmin || false);
            setCurrentUser({
              ...user,
              isAdmin: userData.isAdmin || false,
              photoURL: userData.photoURL || '😎'
            });
          } else {
            await setDoc(userRef, {
              email: user.email,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              isAdmin: false,
              photoURL: '😎',
              bookedEvents: []
            });
            setCurrentUser({
              ...user,
              isAdmin: false,
              photoURL: '😎'
            });
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(user);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
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