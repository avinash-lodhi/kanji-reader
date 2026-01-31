/**
 * Root Navigation
 * 
 * Main navigation container and stack navigator.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { ResultsScreen } from '../screens/ResultsScreen';
import { colors } from '../constants/colors';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Results',
          headerBackTitle: 'Back',
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

export function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default Navigation;
export * from './types';
