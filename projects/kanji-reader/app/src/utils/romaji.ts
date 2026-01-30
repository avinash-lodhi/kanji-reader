/**
 * Romaji Conversion
 * 
 * Convert hiragana/katakana to romaji using wanakana library.
 * Kanji is not converted (needs dictionary lookup for reading).
 */

import { toRomaji as wanakanaToRomaji, isHiragana, isKatakana, isKana } from 'wanakana';

/**
 * Convert Japanese kana to romaji
 * Kanji characters pass through unchanged
 */
export function toRomaji(text: string): string {
  if (!text) return '';
  return wanakanaToRomaji(text);
}

/**
 * Check if text is hiragana
 */
export function checkIsHiragana(text: string): boolean {
  return isHiragana(text);
}

/**
 * Check if text is katakana
 */
export function checkIsKatakana(text: string): boolean {
  return isKatakana(text);
}

/**
 * Check if text is kana (hiragana or katakana)
 */
export function checkIsKana(text: string): boolean {
  return isKana(text);
}

/**
 * Convert reading (hiragana) to romaji safely
 * Used when we have dictionary reading
 */
export function readingToRomaji(reading: string): string {
  if (!reading) return '';
  // Reading should be in hiragana from dictionary
  return wanakanaToRomaji(reading);
}
