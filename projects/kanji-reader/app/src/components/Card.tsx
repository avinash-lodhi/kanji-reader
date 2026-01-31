/**
 * Card Component
 * 
 * Elevated surface container with optional press interaction.
 * Used for WordCard and other interactive surfaces.
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { spacing, borderRadius, shadows } from '../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  selected?: boolean;
  onPress?: PressableProps['onPress'];
  disabled?: boolean;
}

export function Card({
  children,
  style,
  selected = false,
  onPress,
  disabled = false,
}: CardProps) {
  const handlePress = async (event: Parameters<NonNullable<typeof onPress>>[0]) => {
    if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(event);
    }
  };

  const cardStyles = [
    styles.card,
    selected && styles.selected,
    disabled && styles.disabled,
    style,
  ];

  // If pressable, wrap in Pressable
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...cardStyles,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        {children}
      </Pressable>
    );
  }

  // Otherwise, just a View
  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },

  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.md,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.5,
  },
});

export default Card;
