/**
 * HintOverlay Component
 * 
 * Displays progressive hints on the practice canvas.
 * Level 1: Stroke count, Level 2: Ghost first stroke, Level 3: Learn mode prompt
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { StrokeData } from '../../services/strokeData';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';

const VIEWBOX_SIZE = 109;

interface HintOverlayProps {
  strokeData: StrokeData;
  hintLevel: number;
  size: number;
  onSwitchToLearn?: () => void;
}

export function HintOverlay({
  strokeData,
  hintLevel,
  size,
  onSwitchToLearn,
}: HintOverlayProps) {
  if (hintLevel === 0) return null;

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="box-none">
      {hintLevel >= 1 && (
        <StrokeCountHint strokeCount={strokeData.strokeCount} />
      )}
      
      {hintLevel >= 2 && strokeData.strokes.length > 0 && (
        <GhostStrokeHint 
          stroke={strokeData.strokes[0]} 
          size={size}
        />
      )}
      
      {hintLevel >= 3 && (
        <LearnModePrompt onSwitchToLearn={onSwitchToLearn} />
      )}
    </View>
  );
}

function StrokeCountHint({ strokeCount }: { strokeCount: number }) {
  return (
    <View style={styles.strokeCountContainer}>
      <Text style={styles.strokeCountText}>
        {strokeCount} stroke{strokeCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

interface GhostStrokeProps {
  stroke: { path: string };
  size: number;
}

function GhostStrokeHint({ stroke, size }: GhostStrokeProps) {
  return (
    <View style={[styles.ghostContainer, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      >
        <Path
          d={stroke.path}
          stroke={colors.primary}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.25}
          strokeDasharray="4,4"
        />
      </Svg>
    </View>
  );
}

function LearnModePrompt({ onSwitchToLearn }: { onSwitchToLearn?: () => void }) {
  return (
    <View style={styles.promptContainer}>
      <View style={styles.promptCard}>
        <Ionicons name="school-outline" size={24} color={colors.primary} />
        <Text style={styles.promptText}>
          Need more help?
        </Text>
        <Pressable
          style={styles.promptButton}
          onPress={onSwitchToLearn}
        >
          <Text style={styles.promptButtonText}>
            Switch to Learn Mode
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textInverse} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  strokeCountContainer: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strokeCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  ghostContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  promptContainer: {
    position: 'absolute',
    bottom: spacing[3],
    left: spacing[2],
    right: spacing[2],
  },
  promptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  promptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
});

export default HintOverlay;
