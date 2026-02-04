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

import CameraScreen from '../screens/CameraScreen';
import { ImageUploadScreen } from '../screens/ImageUploadScreen';
import { PracticeListScreen } from '../screens/PracticeListScreen';

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
        component={ImageUploadScreen}
        options={{
          tabBarLabel: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="image" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeListScreen}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pencil" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;
