/**
 * HintButton Component
 * 
 * Progressive hint trigger for practice mode.
 * Each tap reveals the next level of help.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';

export const MAX_HINT_LEVEL = 3;

interface HintButtonProps {
  currentHintLevel: number;
  onHintUsed: (level: number) => void;
  onSwitchToLearn: () => void;
  disabled?: boolean;
}

export function HintButton({
  currentHintLevel,
  onHintUsed,
  onSwitchToLearn,
  disabled = false,
}: HintButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentHintLevel >= MAX_HINT_LEVEL - 1) {
      onSwitchToLearn();
    } else {
      const nextLevel = currentHintLevel + 1;
      onHintUsed(nextLevel);
    }
  };

  const getHintLabel = (): string => {
    switch (currentHintLevel) {
      case 0:
        return 'Hint';
      case 1:
        return 'More help';
      case 2:
        return 'Show me';
      default:
        return 'Hint';
    }
  };

  const getHintDescription = (): string => {
    switch (currentHintLevel) {
      case 0:
        return 'Show stroke count';
      case 1:
        return 'Show first stroke';
      case 2:
        return 'Watch full animation';
      default:
        return '';
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={`Hint button, level ${currentHintLevel}. ${getHintDescription()}`}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="bulb-outline"
          size={18}
          color={currentHintLevel > 0 ? colors.warning : colors.textSecondary}
        />
        {currentHintLevel > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{currentHintLevel}</Text>
          </View>
        )}
      </View>
      <Text style={[
        styles.label,
        currentHintLevel > 0 && styles.labelActive,
      ]}>
        {getHintLabel()}
      </Text>
    </Pressable>
  );
}

export function HintLevelIndicator({ level }: { level: number }) {
  if (level === 0) return null;
  
  return (
    <View style={styles.indicator}>
      {Array.from({ length: MAX_HINT_LEVEL }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < level && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[1],
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  disabled: {
    opacity: 0.4,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: colors.warning,
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textInverse,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.warning,
  },
  indicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.warning,
  },
});

export default HintButton;
