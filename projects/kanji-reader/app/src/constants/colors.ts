/**
 * Color Palette for KanjiReader
 * 
 * Character type colors are core to the learning experience:
 * - Kanji (blue): The main characters users are learning
 * - Hiragana (green): Native Japanese syllabary
 * - Katakana (orange): Used for foreign words
 * 
 * These colors should be easily distinguishable at a glance.
 */

export const colors = {
  // Character type colors - THE learning signal
  kanji: '#3B82F6',      // Blue - primary learning target
  hiragana: '#10B981',   // Green - native Japanese
  katakana: '#F59E0B',   // Orange - foreign words
  romaji: '#6B7280',     // Gray - romanized (helper)
  
  // UI colors
  primary: '#3B82F6',    // Same as kanji - consistent identity
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F3F4F6',
  surfaceElevated: '#FFFFFF',
  
  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Borders
  border: '#E5E7EB',
  borderFocused: '#3B82F6',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

// Type for character type colors
export type CharacterTypeColor = typeof colors.kanji | typeof colors.hiragana | typeof colors.katakana | typeof colors.romaji;

// Helper to get color by character type
export function getCharacterTypeColor(type: string): string {
  switch (type) {
    case 'kanji':
      return colors.kanji;
    case 'hiragana':
      return colors.hiragana;
    case 'katakana':
      return colors.katakana;
    case 'romaji':
      return colors.romaji;
    case 'mixed':
      return colors.kanji;
    default:
      return colors.textSecondary;
  }
}
