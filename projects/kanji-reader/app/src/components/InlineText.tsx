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
  compactMode?: boolean;
}

export function InlineText({ 
  words, 
  onWordPress, 
  selectedWord,
  showPronunciation = true,
  wordReadings,
  compactMode = false,
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
        
        // Only show reading for kanji words - prefer Kuromoji reading, fall back to dictionary lookup
        const reading = word.type === 'kanji' 
          ? (word.reading || wordReadings?.get(`${word.text}-${word.startIndex}`))
          : undefined;
        const shouldShowPronunciation = showPronunciation && reading;
        
        return (
          <Pressable
            key={`${word.text}-${word.startIndex}-${index}`}
            onPress={() => handleWordPress(word)}
            style={({ pressed }) => [
              styles.wordContainer,
              compactMode && styles.wordContainerCompact,
              isSelected && styles.selectedWord,
              pressed && styles.pressedWord,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${word.text}${reading ? `, pronounced ${reading}` : ''}`}
          >
            {shouldShowPronunciation && (
              <Text style={[
                styles.pronunciation, 
                compactMode && styles.pronunciationCompact,
                isSelected && styles.selectedPronunciation
              ]}>
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
    justifyContent: 'flex-end',
    minHeight: 44,
    paddingHorizontal: 2,
    paddingVertical: 2,
    marginRight: 1,
    marginBottom: 2,
    borderRadius: 4,
  },
  wordContainerCompact: {
    minHeight: 38,
    paddingHorizontal: 1,
    paddingVertical: 1,
    marginRight: 0,
    marginBottom: 1,
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
    marginBottom: 1,
  },
  pronunciationCompact: {
    marginBottom: 0,
    fontSize: fontSizes.xs - 1,
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
