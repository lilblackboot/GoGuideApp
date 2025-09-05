// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Adjust path according to your config
import { onAuthStateChanged, User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};

// Alternative: If you're using a different auth system or want to mock it
export const useMockAuth = (): AuthState => {
  const [user] = useState<User | null>({
    uid: 'mock_user_123',
    email: 'user@example.com',
  } as User);
  const [loading] = useState<boolean>(false);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};