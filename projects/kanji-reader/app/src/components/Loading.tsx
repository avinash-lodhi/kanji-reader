/**
 * Loading Component
 * 
 * Displays loading states:
 * - Overlay: Full-screen loading with backdrop
 * - Inline: Small inline spinner
 * - Shimmer: Skeleton placeholder for content
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { fontSizes } from '../constants/typography';

interface LoadingProps {
  variant?: 'overlay' | 'inline' | 'shimmer';
  message?: string;
  size?: 'small' | 'large';
}

export function Loading({
  variant = 'inline',
  message,
  size = 'large',
}: LoadingProps) {
  if (variant === 'overlay') {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={colors.primary} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    );
  }

  if (variant === 'shimmer') {
    return <Shimmer />;
  }

  // Inline variant
  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
}

// Shimmer/Skeleton component
function Shimmer() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.shimmerContainer}>
      <Animated.View style={[styles.shimmerLine, styles.shimmerLong, { opacity }]} />
      <Animated.View style={[styles.shimmerLine, styles.shimmerMedium, { opacity }]} />
      <Animated.View style={[styles.shimmerLine, styles.shimmerShort, { opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  overlayContent: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing[6],
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
  },

  message: {
    marginTop: spacing[3],
    fontSize: fontSizes.base,
    color: colors.text,
  },

  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },

  inlineMessage: {
    marginLeft: spacing[2],
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  shimmerContainer: {
    padding: spacing[4],
  },

  shimmerLine: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing[2],
  },

  shimmerLong: {
    width: '100%',
  },

  shimmerMedium: {
    width: '75%',
  },

  shimmerShort: {
    width: '50%',
  },
});

export default Loading;
