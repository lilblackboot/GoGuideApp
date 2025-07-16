import React from 'react';
import Navigation from './Navigation'; // update the path if needed
import { AuthProvider } from './AuthContext'; // if you're using AuthContext

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
