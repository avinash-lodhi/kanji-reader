/**
 * Spacing Scale for KanjiReader
 * 
 * Consistent spacing creates visual rhythm and hierarchy.
 * Based on 4px base unit for pixel-perfect alignment.
 */

// Base spacing unit
const BASE = 4;

export const spacing = {
  // Core spacing scale (multiples of 4)
  0: 0,
  1: BASE * 1,    // 4px
  2: BASE * 2,    // 8px
  3: BASE * 3,    // 12px
  4: BASE * 4,    // 16px
  5: BASE * 5,    // 20px
  6: BASE * 6,    // 24px
  8: BASE * 8,    // 32px
  10: BASE * 10,  // 40px
  12: BASE * 12,  // 48px
  16: BASE * 16,  // 64px
  20: BASE * 20,  // 80px
  
  // Semantic spacing
  xs: BASE * 1,   // 4px - tight spacing
  sm: BASE * 2,   // 8px - compact
  md: BASE * 4,   // 16px - default
  lg: BASE * 6,   // 24px - comfortable
  xl: BASE * 8,   // 32px - spacious
  '2xl': BASE * 12, // 48px - section gaps
} as const;

// Border radii
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Shadows (for iOS, Android uses elevation)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Touch targets (accessibility)
export const touchTargets = {
  minimum: 44,  // iOS minimum
  comfortable: 48,
} as const;
