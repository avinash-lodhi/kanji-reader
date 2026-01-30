import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Button } from '../components';
import { colors } from '../constants/colors';
import { spacing, borderRadius, shadows } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';
import { performOCR } from '../services/ocrService';
import { segmentText, SegmentedWord } from '../services/segmentation';
import { lookupFirst, DictionaryEntry } from '../services/dictionary';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

export function ResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ResultsScreenRouteProp>();
  const { imageUri } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [words, setWords] = useState<SegmentedWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<SegmentedWord | null>(null);
  const [dictionaryEntry, setDictionaryEntry] = useState<DictionaryEntry | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);

  useEffect(() => {
    async function processImage() {
      try {
        setIsLoading(true);
        setError(null);
        const text = await performOCR(imageUri);
        setRawText(text);
        const segmented = segmentText(text);
        setWords(segmented);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process image');
      } finally {
        setIsLoading(false);
      }
    }
    processImage();
  }, [imageUri]);

  const handleWordPress = useCallback(async (word: SegmentedWord) => {
    setSelectedWord(word);
    setDictionaryEntry(null);
    setIsLoadingEntry(true);
    try {
      const entry = await lookupFirst(word.text);
      setDictionaryEntry(entry);
    } catch (err) {
      console.warn('Dictionary lookup failed:', err);
    } finally {
      setIsLoadingEntry(false);
    }
  }, []);

  const handleScanAgain = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={handleScanAgain} style={styles.retryButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="contain" />

        <View style={styles.section}>
          <Text style={styles.label}>Full text:</Text>
          <Text style={styles.fullText}>{rawText || '(No text detected)'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Words: (tap to learn)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wordList}>
            {words.map((word, index) => (
              <WordCardPlaceholder
                key={`${word.text}-${index}`}
                word={word}
                isSelected={selectedWord?.text === word.text}
                onPress={() => handleWordPress(word)}
              />
            ))}
          </ScrollView>
        </View>

        {selectedWord && (
          <View style={styles.detailSection}>
            <Text style={styles.selectedWordText}>{selectedWord.text}</Text>
            {isLoadingEntry ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : dictionaryEntry ? (
              <View>
                <Text style={styles.reading}>{dictionaryEntry.reading}</Text>
                <Text style={styles.meanings}>
                  {dictionaryEntry.meanings.slice(0, 3).join(', ')}
                </Text>
                {dictionaryEntry.jlptLevel && (
                  <Text style={styles.jlpt}>JLPT N{dictionaryEntry.jlptLevel}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.noEntry}>No dictionary entry found</Text>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Scan Again" onPress={handleScanAgain} fullWidth />
      </View>
    </SafeAreaView>
  );
}

interface WordCardPlaceholderProps {
  word: SegmentedWord;
  isSelected: boolean;
  onPress: () => void;
}

function WordCardPlaceholder({ word, isSelected, onPress }: WordCardPlaceholderProps) {
  return (
    <View
      style={[styles.wordCard, isSelected && styles.wordCardSelected]}
      onTouchEnd={onPress}
    >
      <Text style={styles.wordCardText}>{word.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  section: {
    marginTop: spacing.lg,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  fullText: {
    fontSize: fontSizes.lg,
    color: colors.text,
    lineHeight: fontSizes.lg * 1.8,
  },
  wordList: {
    flexDirection: 'row',
  },
  wordCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  wordCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  wordCardText: {
    fontSize: fontSizes.japaneseSmall,
    color: colors.text,
  },
  detailSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  selectedWordText: {
    fontSize: fontSizes.japaneseMedium,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reading: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meanings: {
    fontSize: fontSizes.base,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  jlpt: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  noEntry: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default ResultsScreen;
