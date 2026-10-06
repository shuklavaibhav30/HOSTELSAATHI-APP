import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ComplaintDetailScreen } from '../screens/ComplaintDetailScreen';
import { Loader } from '../components/Loader';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <Loader message="Connecting to HostelSaathi..." />;
  }

  return (
    <NavigationContainer>
      {user && token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
