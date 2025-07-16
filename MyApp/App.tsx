import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './page/LoginScreen';
import HomeScreen from './page/HomeScreen';

function MainApp() {
  const { currentUser } = useAuth();
  
  return currentUser ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}