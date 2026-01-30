import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, getCharacterTypeColor } from '../constants/colors';
import { spacing, borderRadius, shadows } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';
import type { SegmentedWord } from '../services/segmentation';

interface WordCardProps {
  word: SegmentedWord;
  onPress: () => void;
  isSelected: boolean;
}

export function WordCard({ word, onPress, isSelected }: WordCardProps) {
  const typeColor = getCharacterTypeColor(word.type);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={word.text}
      accessibilityState={{ selected: isSelected }}
    >
      <Text style={styles.word}>{word.text}</Text>
      {word.romaji && <Text style={styles.romaji}>{word.romaji}</Text>}
      <View style={[styles.dot, { backgroundColor: typeColor }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 80,
    minHeight: 80,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  word: {
    fontSize: fontSizes.japaneseSmall,
    fontWeight: fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  romaji: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: spacing.xs,
  },
});

export default WordCard;
