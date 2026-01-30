/**
 * Button Component
 * 
 * Primary interactive element with variants:
 * - primary: Main actions (blue)
 * - secondary: Secondary actions (outlined)
 * - ghost: Subtle actions (no background)
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { spacing, borderRadius, shadows } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const handlePress = async (event: any) => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.textInverse : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...shadows.sm,
  },

  primary: {
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
    ...{ shadowOpacity: 0, elevation: 0 },
  },

  fullWidth: {
    width: '100%',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },

  primaryText: {
    color: colors.textInverse,
  },

  secondaryText: {
    color: colors.primary,
  },

  ghostText: {
    color: colors.primary,
  },

  disabledText: {
    color: colors.textMuted,
  },
});

export default Button;
