/**
 * Word Segmentation Service
 * 
 * Splits continuous Japanese text into words using Kuromoji (primary) with Budoux fallback.
 * Critical for dictionary lookup - Japanese has no spaces.
 */

import { loadDefaultJapaneseParser } from 'budoux';
import { toHiragana } from 'wanakana';
import { detectWordType, CharacterType } from '../../utils/characterType';
import { toRomaji } from '../../utils/romaji';
import { kuromojiService } from '../kuromoji';
import { joinMorphemes } from './morphemeJoiner';

// Initialize the Budoux parser (fallback)
const parser = loadDefaultJapaneseParser();

/**
 * Represents a segmented word
 */
export interface SegmentedWord {
  /** The word text (e.g., "日本語") */
  text: string;
  /** Primary character type */
  type: CharacterType;
  /** Romaji if available (only for pure kana) */
  romaji?: string;
  /** Hiragana reading from Kuromoji (if available) */
  reading?: string;
  /** Original position in source text */
  startIndex: number;
  /** End position in source text */
  endIndex: number;
}

/**
 * Segment text using Kuromoji tokenizer
 */
function segmentWithKuromoji(text: string): SegmentedWord[] {
  const rawTokens = kuromojiService.tokenize(text);
  const tokens = joinMorphemes(rawTokens);
  const words: SegmentedWord[] = [];

  for (const token of tokens) {
    // Skip punctuation tokens
    if (token.pos.startsWith('記号')) {
      continue;
    }

    const type = detectWordType(token.surface_form);
    
    // Skip if detected as punctuation or other
    if (type === 'punctuation' || type === 'other') {
      continue;
    }

    // Calculate romaji for pure kana words
    let romaji: string | undefined;
    if (type === 'hiragana' || type === 'katakana') {
      romaji = toRomaji(token.surface_form);
    }

    // Convert katakana reading to hiragana
    const reading = token.reading ? toHiragana(token.reading) : undefined;

    // word_position is 1-indexed in Kuromoji
    const startIndex = token.word_position - 1;
    const endIndex = startIndex + token.surface_form.length;

    words.push({
      text: token.surface_form,
      type,
      romaji,
      reading,
      startIndex,
      endIndex,
    });
  }

  return words;
}

/**
 * Segment text using Budoux parser (fallback)
 */
function segmentWithBudoux(text: string): SegmentedWord[] {
  const segments = parser.parse(text);
  const words: SegmentedWord[] = [];
  let currentIndex = 0;

  for (const segment of segments) {
    const trimmed = segment.trim();

    // Skip empty segments and pure whitespace
    if (!trimmed) {
      currentIndex += segment.length;
      continue;
    }

    // Skip pure punctuation
    const type = detectWordType(trimmed);
    if (type === 'punctuation' || type === 'other') {
      currentIndex += segment.length;
      continue;
    }

    // Calculate romaji for pure kana words
    let romaji: string | undefined;
    if (type === 'hiragana' || type === 'katakana') {
      romaji = toRomaji(trimmed);
    }

    words.push({
      text: trimmed,
      type,
      romaji,
      startIndex: currentIndex,
      endIndex: currentIndex + segment.length,
    });

    currentIndex += segment.length;
  }

  return words;
}

/**
 * Segment Japanese text into words
 * Uses Kuromoji when available, falls back to Budoux
 */
export function segmentText(text: string): SegmentedWord[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Use Kuromoji if ready, otherwise fall back to Budoux
  if (kuromojiService.isReady()) {
    return segmentWithKuromoji(text);
  }

  return segmentWithBudoux(text);
}

/**
 * Get unique words from text (for batch dictionary lookup)
 */
export function getUniqueWords(text: string): string[] {
  const words = segmentText(text);
  const unique = new Set(words.map(w => w.text));
  return Array.from(unique);
}

/**
 * Quick check if segmentation is needed
 * (contains Japanese characters)
 */
export function needsSegmentation(text: string): boolean {
  if (!text) return false;
  
  for (const char of text) {
    const code = char.charCodeAt(0);
    // Check for any CJK or kana characters
    if ((code >= 0x3040 && code <= 0x30FF) || // Hiragana + Katakana
        (code >= 0x4E00 && code <= 0x9FFF)) { // CJK
      return true;
    }
  }
  return false;
}
