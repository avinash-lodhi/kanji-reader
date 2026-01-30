/**
 * Typography Scale for KanjiReader
 * 
 * Japanese text needs larger sizes for readability, especially Kanji.
 * We use system fonts for fastest load time.
 */

import { Platform } from 'react-native';

// Font families - system fonts for performance
export const fonts = {
  // Use system font for UI text
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Bold variant
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

// Font sizes - larger for Japanese text
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  
  // Special sizes for Japanese characters
  japaneseSmall: 20,    // For word cards
  japaneseMedium: 28,   // For detail panel
  japaneseLarge: 48,    // For hero display
} as const;

// Line heights
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  
  // Japanese needs more line height
  japanese: 1.8,
} as const;

// Font weights
export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Pre-composed text styles
export const textStyles = {
  // Body text
  body: {
    fontSize: fontSizes.base,
    lineHeight: fontSizes.base * lineHeights.normal,
    fontWeight: fontWeights.normal,
  },
  
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.normal,
  },
  
  // Headers
  h1: {
    fontSize: fontSizes['3xl'],
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
  },
  
  h2: {
    fontSize: fontSizes['2xl'],
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    fontWeight: fontWeights.bold,
  },
  
  h3: {
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.tight,
    fontWeight: fontWeights.semibold,
  },
  
  // Japanese text
  japaneseWord: {
    fontSize: fontSizes.japaneseSmall,
    lineHeight: fontSizes.japaneseSmall * lineHeights.japanese,
    fontWeight: fontWeights.medium,
  },
  
  japaneseHero: {
    fontSize: fontSizes.japaneseLarge,
    lineHeight: fontSizes.japaneseLarge * lineHeights.japanese,
    fontWeight: fontWeights.bold,
  },
  
  // Labels
  label: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.medium,
  },
  
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontWeight: fontWeights.normal,
  },
} as const;
