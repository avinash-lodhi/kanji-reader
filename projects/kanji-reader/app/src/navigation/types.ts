/**
 * Navigation Types
 * 
 * Type definitions for React Navigation.
 * Provides type safety for navigation params.
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps, StackNavigationProp } from '@react-navigation/stack';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Main tabs
export type MainTabsParamList = {
  Camera: undefined;
  Upload: undefined;
};

// Root stack
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  Results: {
    imageUri: string;
  };
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

export type MainTabsScreenProps<T extends keyof MainTabsParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabsParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// Navigation prop for use in components
export type RootNavigationProp = StackNavigationProp<RootStackParamList>;

// Declare global types for useNavigation hook
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
