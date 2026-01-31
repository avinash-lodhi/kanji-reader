import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';
import type { SegmentedWord } from '../services/segmentation';

interface InlineTextProps {
  words: SegmentedWord[];
  onWordPress?: (word: SegmentedWord) => void;
  selectedWord?: SegmentedWord | null;
  showPronunciation?: boolean;
  wordReadings?: Map<string, string>;
}

export function InlineText({ 
  words, 
  onWordPress, 
  selectedWord,
  showPronunciation = true,
  wordReadings,
}: InlineTextProps) {
  const handleWordPress = async (word: SegmentedWord) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onWordPress?.(word);
  };

  return (
    <View style={styles.container}>
      {words.map((word, index) => {
        const isSelected = selectedWord?.text === word.text && 
                          selectedWord?.startIndex === word.startIndex;
        
        const isKanjiWord = word.type === 'kanji';
        const reading = wordReadings?.get(word.text);
        const shouldShowPronunciation = showPronunciation && isKanjiWord && reading;
        
        return (
          <Pressable
            key={`${word.text}-${word.startIndex}-${index}`}
            onPress={() => handleWordPress(word)}
            style={({ pressed }) => [
              styles.wordContainer,
              isSelected && styles.selectedWord,
              pressed && styles.pressedWord,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${word.text}${reading ? `, pronounced ${reading}` : ''}`}
          >
            {shouldShowPronunciation && (
              <Text style={[styles.pronunciation, isSelected && styles.selectedPronunciation]}>
                {reading}
              </Text>
            )}
            <Text style={[styles.word, isSelected && styles.selectedWordText]}>
              {word.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  wordContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    marginRight: 2,
    marginBottom: spacing.xs,
    borderRadius: 4,
  },
  selectedWord: {
    backgroundColor: colors.primaryLight,
  },
  pressedWord: {
    opacity: 0.7,
  },
  pronunciation: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  selectedPronunciation: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  word: {
    fontSize: fontSizes.lg,
    color: colors.text,
    lineHeight: fontSizes.lg * 1.4,
  },
  selectedWordText: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
});

export default InlineText;
