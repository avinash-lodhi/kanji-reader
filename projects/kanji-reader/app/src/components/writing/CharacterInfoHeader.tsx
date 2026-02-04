/**
 * CharacterInfoHeader Component
 * 
 * Displays the character being practiced with type badge, reading, and meaning.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, getCharacterTypeColor } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { WritingCharacterType } from '../../utils/characterType';

interface CharacterInfoHeaderProps {
  character: string;
  type: WritingCharacterType;
  reading?: string;
  meaning?: string;
}

function getTypeLabel(type: WritingCharacterType): string {
  switch (type) {
    case 'kanji':
      return 'Kanji';
    case 'hiragana':
      return 'Hiragana';
    case 'katakana':
      return 'Katakana';
    default:
      return 'Character';
  }
}

export function CharacterInfoHeader({
  character,
  type,
  reading,
  meaning,
}: CharacterInfoHeaderProps) {
  const color = getCharacterTypeColor(type);

  return (
    <View style={styles.container}>
      <Text style={[styles.character, { color }]}>
        {character}
      </Text>
      
      <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.typeText, { color }]}>
          {getTypeLabel(type)}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        {reading && (
          <Text style={styles.reading}>{reading}</Text>
        )}
        {meaning && (
          <Text style={styles.meaning}>{meaning}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  character: {
    fontSize: 72,
    fontWeight: '300',
    lineHeight: 84,
  },
  typeBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginTop: spacing[2],
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: spacing[2],
    gap: spacing[1],
  },
  reading: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '400',
  },
  meaning: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default CharacterInfoHeader;
