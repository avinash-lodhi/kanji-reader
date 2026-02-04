/**
 * PracticeListScreen
 * 
 * Displays all saved practice words as a scrollable list.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePracticeStore, PracticeWord, usePracticeHydrated } from '../store/practiceStore';
import { RootNavigationProp } from '../navigation/types';
import { colors, getCharacterTypeColor } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { getWritingCharacterType } from '../utils/characterType';

export function PracticeListScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const words = usePracticeStore((state) => state.words);
  const characterProgress = usePracticeStore((state) => state.characterProgress);
  const removeWord = usePracticeStore((state) => state.removeWord);
  const hasHydrated = usePracticeHydrated();

  const sortedWords = [...words].sort((a, b) => b.addedAt - a.addedAt);

  const handleWordPress = useCallback((word: PracticeWord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('WritingPractice', {
      characters: word.characters,
      reading: word.reading,
      meaning: word.meaning,
      source: 'practiceList',
    });
  }, [navigation]);

  const handleDeleteWord = useCallback((wordId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeWord(wordId);
  }, [removeWord]);

  const getWordProgress = useCallback((word: PracticeWord) => {
    let totalAttempts = 0;
    let totalSuccesses = 0;
    
    for (const char of word.characters) {
      const progress = characterProgress[char];
      if (progress) {
        totalAttempts += progress.attempts;
        totalSuccesses += progress.successes;
      }
    }
    
    if (totalAttempts === 0) return null;
    return Math.round((totalSuccesses / totalAttempts) * 100);
  }, [characterProgress]);

  const renderItem: ListRenderItem<PracticeWord> = useCallback(({ item }) => {
    const progress = getWordProgress(item);
    const mainCharType = getWritingCharacterType(item.word[0]);
    const typeColor = getCharacterTypeColor(mainCharType);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.wordCard,
          pressed && styles.wordCardPressed,
        ]}
        onPress={() => handleWordPress(item)}
      >
        <View style={styles.wordMain}>
          <Text style={[styles.wordText, { color: typeColor }]}>
            {item.word}
          </Text>
          <View style={styles.wordInfo}>
            {item.reading && (
              <Text style={styles.reading}>{item.reading}</Text>
            )}
            {item.meaning && (
              <Text style={styles.meaning} numberOfLines={1}>
                {item.meaning}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.wordActions}>
          {progress !== null && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteWord(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </Pressable>
        </View>
      </Pressable>
    );
  }, [handleWordPress, handleDeleteWord, getWordProgress]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No practice words yet</Text>
      <Text style={styles.emptyText}>
        Scan text and tap the pencil icon on a word to start practicing!
      </Text>
    </View>
  );

  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice List</Text>
        <Text style={styles.headerSubtitle}>
          {words.length} {words.length === 1 ? 'word' : 'words'}
        </Text>
      </View>
      
      <FlatList
        data={sortedWords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  listContent: {
    padding: spacing[4],
    flexGrow: 1,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  wordCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  wordMain: {
    flex: 1,
  },
  wordText: {
    fontSize: 28,
    fontWeight: '500',
  },
  wordInfo: {
    marginTop: spacing[1],
  },
  reading: {
    fontSize: 14,
    color: colors.text,
  },
  meaning: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  progressBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  deleteButton: {
    padding: spacing[1],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing[4],
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing[2],
    lineHeight: 20,
  },
});

export default PracticeListScreen;
