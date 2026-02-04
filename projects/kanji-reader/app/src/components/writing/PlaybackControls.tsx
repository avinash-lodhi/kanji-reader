/**
 * PlaybackControls Component
 * 
 * UI controls for navigating through strokes in Learn Mode.
 * Supports: previous, next, replay, and auto-play.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';

interface PlaybackControlsProps {
  currentStroke: number;
  totalStrokes: number;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  isAnimating?: boolean;
  animationDuration?: number;
}

export function PlaybackControls({
  currentStroke,
  totalStrokes,
  onPrevious,
  onNext,
  onReset,
  isAnimating = false,
  animationDuration = 500,
}: PlaybackControlsProps) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canGoPrevious = currentStroke > 0 && !isAutoPlaying;
  const canGoNext = currentStroke < totalStrokes - 1 && !isAutoPlaying;
  const isComplete = currentStroke === totalStrokes - 1;

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    setIsAutoPlaying(false);
  }, []);

  const startAutoPlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReset();
    setIsAutoPlaying(true);
  }, [onReset]);

  useEffect(() => {
    if (isAutoPlaying && !isAnimating) {
      if (currentStroke < totalStrokes - 1) {
        autoPlayTimeoutRef.current = setTimeout(() => {
          onNext();
        }, 300);
      } else {
        stopAutoPlay();
      }
    }
    
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [isAutoPlaying, isAnimating, currentStroke, totalStrokes, onNext, stopAutoPlay]);

  useEffect(() => {
    return () => {
      stopAutoPlay();
    };
  }, [stopAutoPlay]);

  const handlePrevious = () => {
    if (!canGoPrevious) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrevious();
  };

  const handleNext = () => {
    if (!canGoNext) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  };

  const handleReplay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReset();
  };

  const handleAutoPlayToggle = () => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Pressable
          style={[styles.button, !canGoPrevious && styles.buttonDisabled]}
          onPress={handlePrevious}
          disabled={!canGoPrevious}
          accessibilityLabel="Previous stroke"
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={canGoPrevious ? colors.text : colors.textMuted}
          />
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={handleReplay}
          disabled={isAutoPlaying}
          accessibilityLabel="Replay from beginning"
          accessibilityRole="button"
        >
          <Ionicons
            name="refresh"
            size={24}
            color={isAutoPlaying ? colors.textMuted : colors.text}
          />
        </Pressable>

        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentStroke + 1} / {totalStrokes}
          </Text>
        </View>

        <Pressable
          style={[styles.button, isAutoPlaying && styles.buttonActive]}
          onPress={handleAutoPlayToggle}
          accessibilityLabel={isAutoPlaying ? "Stop auto-play" : "Start auto-play"}
          accessibilityRole="button"
        >
          <Ionicons
            name={isAutoPlaying ? "pause" : "play"}
            size={24}
            color={isAutoPlaying ? colors.textInverse : colors.text}
          />
        </Pressable>

        <Pressable
          style={[styles.button, !canGoNext && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canGoNext}
          accessibilityLabel="Next stroke"
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={canGoNext ? colors.text : colors.textMuted}
          />
        </Pressable>
      </View>

      {isComplete && !isAutoPlaying && (
        <Text style={styles.completeText}>All strokes shown</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  counter: {
    minWidth: 60,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  completeText: {
    marginTop: spacing[2],
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default PlaybackControls;
