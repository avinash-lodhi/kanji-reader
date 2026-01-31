import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import { RootStackParamList } from '../navigation/types';
import { Button, WordCard, DetailPanel, ErrorMessage, InlineText } from '../components';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';
import { performOCR } from '../services/ocrService';
import { segmentText, SegmentedWord } from '../services/segmentation';
import { lookupFirst, DictionaryEntry } from '../services/dictionary';
import { ttsService } from '../services/tts';
import { translationService } from '../services/translation';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

export function ResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute<ResultsScreenRouteProp>();
  const { imageUri } = route.params;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [words, setWords] = useState<SegmentedWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<SegmentedWord | null>(null);
  const [dictionaryEntry, setDictionaryEntry] = useState<DictionaryEntry | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [isPlayingFullText, setIsPlayingFullText] = useState(false);
  const [englishTranslation, setEnglishTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

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

  useEffect(() => {
    async function translateText() {
      if (!rawText || rawText.trim().length === 0) {
        setEnglishTranslation(null);
        return;
      }
      
      setIsTranslating(true);
      try {
        const result = await translationService.translateToEnglish(rawText);
        setEnglishTranslation(result?.translatedText ?? null);
      } catch (err) {
        console.warn('Translation failed:', err);
        setEnglishTranslation(null);
      } finally {
        setIsTranslating(false);
      }
    }
    translateText();
  }, [rawText]);

  const handleWordPress = useCallback(async (word: SegmentedWord) => {
    setSelectedWord(word);
    setDictionaryEntry(null);
    setIsLoadingEntry(true);
    
    ttsService.speakJapanese(word.text);
    
    try {
      const entry = await lookupFirst(word.text);
      setDictionaryEntry(entry);
    } catch (err) {
      console.warn('Dictionary lookup failed:', err);
    } finally {
      setIsLoadingEntry(false);
    }
  }, []);

  const handlePlayAudio = useCallback(() => {
    if (selectedWord) {
      ttsService.speakJapanese(selectedWord.text);
    }
  }, [selectedWord]);

  const handlePlayFullText = useCallback(async () => {
    if (!rawText || isPlayingFullText) return;
    
    setIsPlayingFullText(true);
    try {
      await ttsService.speakJapanese(rawText, 0.9);
    } finally {
      setIsPlayingFullText(false);
    }
  }, [rawText, isPlayingFullText]);

  const handleClosePanel = useCallback(() => {
    setSelectedWord(null);
    setDictionaryEntry(null);
  }, []);

  const handleScanAgain = useCallback(() => {
    ttsService.stop();
    navigation.goBack();
  }, [navigation]);

  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    performOCR(imageUri)
      .then((text) => {
        setRawText(text);
        setWords(segmentText(text));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to process image');
      })
      .finally(() => setIsLoading(false));
  }, [imageUri]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    const isNetworkError = error.toLowerCase().includes('network');
    return (
      <ErrorMessage
        title={isNetworkError ? 'Connection Error' : 'Processing Failed'}
        message={isNetworkError ? 'Please check your internet connection and try again.' : error}
        icon={isNetworkError ? 'cloud-offline-outline' : 'alert-circle-outline'}
        onRetry={handleRetry}
        onGoBack={handleScanAgain}
      />
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="contain" />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Full text with pronunciation:</Text>
            {rawText && (
              <Pressable
                onPress={handlePlayFullText}
                style={[styles.speakerButton, isPlayingFullText && styles.speakerButtonActive]}
                accessibilityRole="button"
                accessibilityLabel="Play full sentence audio"
              >
                <Ionicons 
                  name={isPlayingFullText ? 'volume-high' : 'volume-medium'} 
                  size={24} 
                  color={isPlayingFullText ? colors.primary : colors.textSecondary} 
                />
              </Pressable>
            )}
          </View>
          {words.length > 0 ? (
            <InlineText
              words={words}
              onWordPress={handleWordPress}
              selectedWord={selectedWord}
              showPronunciation={true}
            />
          ) : (
            <Text style={styles.fullText}>{rawText || '(No text detected)'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>English Translation:</Text>
          {isTranslating ? (
            <View style={styles.translationLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.translationLoadingText}>Translating...</Text>
            </View>
          ) : englishTranslation ? (
            <Text style={styles.translationText}>{englishTranslation}</Text>
          ) : rawText ? (
            <Text style={styles.translationUnavailable}>Translation unavailable</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Word cards: (tap to learn)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wordList}>
            {words.map((word, index) => (
              <WordCard
                key={`${word.text}-${index}`}
                word={word}
                isSelected={selectedWord?.text === word.text}
                onPress={() => handleWordPress(word)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Scan Again" onPress={handleScanAgain} fullWidth />
      </View>

      {selectedWord && (
        <DetailPanel
          ref={bottomSheetRef}
          word={selectedWord}
          entry={dictionaryEntry}
          isLoading={isLoadingEntry}
          onClose={handleClosePanel}
          onPlayAudio={handlePlayAudio}
        />
      )}
    </GestureHandlerRootView>
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
    paddingBottom: spacing.xl,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  speakerButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  speakerButtonActive: {
    backgroundColor: colors.primaryLight + '30',
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
  fullText: {
    fontSize: fontSizes.lg,
    color: colors.text,
    lineHeight: fontSizes.lg * 1.8,
  },
  translationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  translationLoadingText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  translationText: {
    fontSize: fontSizes.base,
    color: colors.text,
    lineHeight: fontSizes.base * 1.6,
    fontStyle: 'italic',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  translationUnavailable: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  wordList: {
    flexDirection: 'row',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default ResultsScreen;
