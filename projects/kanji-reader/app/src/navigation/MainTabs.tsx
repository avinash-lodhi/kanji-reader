/**
 * Main Tabs Navigator
 * 
 * Bottom tab navigation between Camera and Upload screens.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabsParamList } from './types';
import { colors } from '../constants/colors';
import { fontSizes } from '../constants/typography';

// Placeholder screens (will be replaced with actual screens)
import { View, Text, StyleSheet } from 'react-native';

function CameraScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="camera" size={64} color={colors.primary} />
      <Text style={styles.placeholderText}>Camera Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming soon...</Text>
    </View>
  );
}

function UploadScreen() {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="image" size={64} color={colors.primary} />
      <Text style={styles.placeholderText}>Upload Screen</Text>
      <Text style={styles.placeholderSubtext}>Coming soon...</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
        },
      }}
    >
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarLabel: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="image" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
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

export default MainTabs;
