/**
 * Root Navigation
 * 
 * Main navigation container and stack navigator.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { colors } from '../constants/colors';
import { fontSizes } from '../constants/typography';

// Placeholder Results screen (will be replaced)
function ResultsScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="document-text" size={64} color={colors.primary} />
      <Text style={styles.placeholderText}>Results Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming soon...</Text>
    </View>
  );
}

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

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: fontSizes.xl,
    color: colors.text,
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

export default Navigation;
export * from './types';
