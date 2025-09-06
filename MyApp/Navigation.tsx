import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Import your screens
import LoginScreen from './page/LoginScreen';
import ProfileData from './page/ProfileData';
import HomeScreen from './page/HomeScreen';
import Sections from './page/Sections'
import Chatbot from './page/Chatbot';
import Events from './page/Events';
import Calculator from './page/Calculator';
import AdminEventsScreen from './page/AdminEventsScreen';
const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminEvents" component={AdminEventsScreen} />
        <Stack.Screen name="ProfileData" component={ProfileData} />
        <Stack.Screen name="Sections" component={Sections} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chatbot" component={Chatbot} />
        <Stack.Screen name="Calculator" component={Calculator} />
        <Stack.Screen name="Events" component={Events} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
