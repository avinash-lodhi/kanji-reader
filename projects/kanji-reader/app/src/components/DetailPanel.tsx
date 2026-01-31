import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';
import type { SegmentedWord } from '../services/segmentation';
import type { DictionaryEntry } from '../services/dictionary';

interface DetailPanelProps {
  word: SegmentedWord;
  entry: DictionaryEntry | null;
  isLoading: boolean;
  onClose: () => void;
  onPlayAudio: () => void;
}

export const DetailPanel = forwardRef<BottomSheet, DetailPanelProps>(
  ({ word, entry, isLoading, onClose, onPlayAudio }, ref) => {
    const snapPoints = useMemo(() => ['45%'], []);

    const handlePlayAudio = async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPlayAudio();
    };

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.header}>
            <View style={styles.wordSection}>
              <Text style={styles.word}>{word.text}</Text>
              {entry?.reading && (
                <Text style={styles.reading}>
                  {entry.reading}
                  {word.romaji && ` (${word.romaji})`}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handlePlayAudio}
              style={styles.audioButton}
              accessibilityRole="button"
              accessibilityLabel="Play pronunciation"
            >
              <Ionicons name="volume-high" size={28} color={colors.primary} />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Looking up meaning...</Text>
            </View>
          ) : entry ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Meanings:</Text>
                {entry.meanings.slice(0, 5).map((meaning, index) => (
                  <Text key={index} style={styles.meaning}>
                    • {meaning}
                  </Text>
                ))}
              </View>

              {entry.partsOfSpeech.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Parts of Speech:</Text>
                  <Text style={styles.partsOfSpeech}>
                    {entry.partsOfSpeech.slice(0, 3).join(', ')}
                  </Text>
                </View>
              )}

              <View style={styles.badges}>
                {entry.jlptLevel && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>JLPT N{entry.jlptLevel}</Text>
                  </View>
                )}
                {entry.isCommon && (
                  <View style={[styles.badge, styles.commonBadge]}>
                    <Text style={styles.badgeText}>Common</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.notFound}>
              <Ionicons name="help-circle-outline" size={48} color={colors.textMuted} />
              <Text style={styles.notFoundText}>No dictionary entry found</Text>
              <Text style={styles.notFoundHint}>
                This word may be a name or very specialized term
              </Text>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

DetailPanel.displayName = 'DetailPanel';

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  wordSection: {
    flex: 1,
  },
  word: {
    fontSize: fontSizes.japaneseLarge,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  reading: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  audioButton: {
    padding: spacing.sm,
    marginLeft: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meaning: {
    fontSize: fontSizes.base,
    color: colors.text,
    lineHeight: fontSizes.base * 1.5,
    marginLeft: spacing.sm,
  },
  partsOfSpeech: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  badges: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  commonBadge: {
    backgroundColor: colors.success,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.textInverse,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  notFoundText: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  notFoundHint: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default DetailPanel;
