/**
 * StrokeFeedback Component
 * 
 * Displays visual feedback for stroke validation results.
 * Green for correct, red flash for wrong.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

interface StrokeFeedbackProps {
  type: 'correct' | 'incorrect' | 'complete' | null;
  onAnimationComplete?: () => void;
  size?: number;
}

export function StrokeFeedback({
  type,
  onAnimationComplete,
  size = 200,
}: StrokeFeedbackProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (type === 'correct') {
      opacity.value = 0;
      scale.value = 0.8;
      opacity.value = withSequence(
        withTiming(0.6, { duration: 150 }),
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
      scale.value = withTiming(1, { duration: 200 });
    } else if (type === 'incorrect') {
      opacity.value = 0;
      scale.value = 0.9;
      opacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0.8, { duration: 200 }),
        withTiming(0, { duration: 200 }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
      scale.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    } else if (type === 'complete') {
      opacity.value = 0;
      scale.value = 0.5;
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [type, opacity, scale, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!type) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'correct':
        return 'rgba(16, 185, 129, 0.2)';
      case 'incorrect':
        return 'rgba(239, 68, 68, 0.2)';
      case 'complete':
        return 'rgba(16, 185, 129, 0.3)';
      default:
        return 'transparent';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'correct':
        return <Ionicons name="checkmark" size={60} color={colors.success} />;
      case 'incorrect':
        return <Ionicons name="close" size={60} color={colors.error} />;
      case 'complete':
        return <Ionicons name="checkmark-circle" size={80} color={colors.success} />;
      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size, backgroundColor: getBackgroundColor() },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {getIcon()}
    </Animated.View>
  );
}

export function IncorrectFlash({
  visible,
  onComplete,
}: {
  visible: boolean;
  onComplete: () => void;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(0, { duration: 400 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        })
      );
    }
  }, [visible, opacity, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.flashOverlay, animatedStyle]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.error,
    borderRadius: 8,
  },
});

export default StrokeFeedback;
