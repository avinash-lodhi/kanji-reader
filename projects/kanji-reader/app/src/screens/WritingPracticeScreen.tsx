/**
 * WritingPracticeScreen
 * 
 * Main screen for character writing practice.
 * Hosts Learn Mode and Practice Mode with a toggle.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '../navigation/types';
import { getStrokeData, StrokeData } from '../services/strokeData';
import { StrokeGuide } from '../components/writing/StrokeGuide';
import { DrawingCanvas, RenderedStroke } from '../components/writing/DrawingCanvas';
import { PlaybackControls } from '../components/writing/PlaybackControls';
import { StrokeFeedback } from '../components/writing/StrokeFeedback';
import { HintButton } from '../components/writing/HintButton';
import { HintOverlay } from '../components/writing/HintOverlay';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { usePracticeStore } from '../store/practiceStore';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { getCharacterTypeColor } from '../constants/colors';
import { getWritingCharacterType } from '../utils/characterType';

type WritingPracticeRouteProp = RouteProp<RootStackParamList, 'WritingPractice'>;

type Mode = 'learn' | 'practice';

export function WritingPracticeScreen() {
  const navigation = useNavigation();
  const route = useRoute<WritingPracticeRouteProp>();
  const { characters, reading, meaning, source } = route.params;
  const { width } = useWindowDimensions();

  const [activeMode, setActiveMode] = useState<Mode>('practice');
  const [strokeData, setStrokeData] = useState<StrokeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [learnCurrentStroke, setLearnCurrentStroke] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [hintLevel, setHintLevel] = useState(0);

  const character = characters[0];
  const charType = getWritingCharacterType(character);
  const canvasSize = Math.min(width - spacing[8], 300);

  const practiceSession = usePracticeSession(strokeData, character);
  const addWord = usePracticeStore((state) => state.addWord);
  const isInPracticeList = usePracticeStore((state) => 
    state.words.some(w => w.word === character)
  );

  useEffect(() => {
    async function loadStrokeData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStrokeData(character);
        if (data) {
          setStrokeData(data);
        } else {
          setError('No stroke data available for this character');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stroke data');
      } finally {
        setIsLoading(false);
      }
    }
    loadStrokeData();
  }, [character]);

  const handleModeChange = useCallback((mode: Mode) => {
    setActiveMode(mode);
    if (mode === 'practice') {
      setHintLevel(0);
      practiceSession.reset();
    } else {
      setLearnCurrentStroke(0);
    }
  }, [practiceSession]);

  const handleHintUsed = useCallback((level: number) => {
    setHintLevel(level);
    practiceSession.markHintUsed();
  }, [practiceSession]);

  const handleSwitchToLearn = useCallback(() => {
    handleModeChange('learn');
  }, [handleModeChange]);

  const handleAddToPracticeList = useCallback(() => {
    if (!isInPracticeList) {
      addWord({
        word: character,
        characters: [character],
        reading,
        meaning,
        source: source === 'popup' ? 'scan' : 'manual',
      });
    }
  }, [character, reading, meaning, source, isInPracticeList, addWord]);

  const handleLearnPrevious = useCallback(() => {
    setLearnCurrentStroke((prev) => Math.max(0, prev - 1));
  }, []);

  const handleLearnNext = useCallback(() => {
    if (strokeData) {
      setLearnCurrentStroke((prev) => Math.min(strokeData.strokeCount - 1, prev + 1));
    }
  }, [strokeData]);

  const handleLearnReset = useCallback(() => {
    setLearnCurrentStroke(0);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading stroke data...</Text>
      </View>
    );
  }

  if (error || !strokeData) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Stroke data unavailable'}</Text>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.character, { color: getCharacterTypeColor(charType) }]}>
            {character}
          </Text>
          <View style={styles.headerInfo}>
            {reading && <Text style={styles.reading}>{reading}</Text>}
            {meaning && <Text style={styles.meaning}>{meaning}</Text>}
          </View>
        </View>

        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeButton, activeMode === 'learn' && styles.modeButtonActive]}
            onPress={() => handleModeChange('learn')}
          >
            <Ionicons 
              name="school-outline" 
              size={18} 
              color={activeMode === 'learn' ? colors.textInverse : colors.text} 
            />
            <Text style={[styles.modeButtonText, activeMode === 'learn' && styles.modeButtonTextActive]}>
              Learn
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, activeMode === 'practice' && styles.modeButtonActive]}
            onPress={() => handleModeChange('practice')}
          >
            <Ionicons 
              name="pencil-outline" 
              size={18} 
              color={activeMode === 'practice' ? colors.textInverse : colors.text} 
            />
            <Text style={[styles.modeButtonText, activeMode === 'practice' && styles.modeButtonTextActive]}>
              Practice
            </Text>
          </Pressable>
        </View>

        <View style={[styles.canvasContainer, { width: canvasSize, height: canvasSize }]}>
          {activeMode === 'learn' ? (
            <>
              <StrokeGuide
                strokeData={strokeData}
                currentStroke={learnCurrentStroke}
                size={canvasSize}
                showNumbers
                showGrid
                animated
                onStrokeAnimationComplete={() => setIsAnimating(false)}
              />
            </>
          ) : (
            <>
              <DrawingCanvas
                size={canvasSize}
                onStrokeComplete={practiceSession.handleStrokeComplete}
                currentStrokes={practiceSession.validatedStrokes}
                disabled={practiceSession.isComplete || practiceSession.practiceState !== 'idle'}
                showGrid
              />
              
              <HintOverlay
                strokeData={strokeData}
                hintLevel={hintLevel}
                size={canvasSize}
                onSwitchToLearn={handleSwitchToLearn}
              />

              {practiceSession.practiceState === 'feedback_incorrect' && (
                <StrokeFeedback type="incorrect" size={canvasSize} />
              )}

              {practiceSession.isComplete && (
                <StrokeFeedback type="complete" size={canvasSize} />
              )}
            </>
          )}
        </View>

        {activeMode === 'learn' && (
          <PlaybackControls
            currentStroke={learnCurrentStroke}
            totalStrokes={strokeData.strokeCount}
            onPrevious={handleLearnPrevious}
            onNext={handleLearnNext}
            onReset={handleLearnReset}
            isAnimating={isAnimating}
          />
        )}

        {activeMode === 'practice' && (
          <View style={styles.practiceControls}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Stroke {practiceSession.currentStrokeIndex + 1} of {strokeData.strokeCount}
              </Text>
              {practiceSession.isComplete && (
                <View style={styles.completeBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.completeText}>Complete!</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <HintButton
                currentHintLevel={hintLevel}
                onHintUsed={handleHintUsed}
                onSwitchToLearn={handleSwitchToLearn}
                disabled={practiceSession.isComplete}
              />

              <Pressable
                style={styles.clearButton}
                onPress={practiceSession.clearCanvas}
              >
                <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>

              {practiceSession.isComplete && (
                <Pressable
                  style={styles.retryButton}
                  onPress={practiceSession.reset}
                >
                  <Ionicons name="refresh" size={18} color={colors.primary} />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          {!isInPracticeList && (
            <Pressable style={styles.addButton} onPress={handleAddToPracticeList}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add to Practice List</Text>
            </Pressable>
          )}
          
          {isInPracticeList && (
            <View style={styles.inListBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.inListText}>In Practice List</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    padding: spacing[4],
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing[2],
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: spacing[2],
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  character: {
    fontSize: 64,
    fontWeight: '300',
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: spacing[1],
  },
  reading: {
    fontSize: 18,
    color: colors.text,
  },
  meaning: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing[4],
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    gap: spacing[1],
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  modeButtonTextActive: {
    color: colors.textInverse,
  },
  canvasContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  practiceControls: {
    width: '100%',
    marginTop: spacing[3],
    gap: spacing[3],
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  clearButton: {
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
  clearButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.md,
    gap: spacing[1],
  },
  retryButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  addButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
  inListBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  inListText: {
    fontSize: 14,
    color: colors.success,
  },
});

export default WritingPracticeScreen;
