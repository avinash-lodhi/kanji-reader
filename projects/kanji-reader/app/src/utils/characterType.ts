/**
 * Character Type Detection
 * 
 * Detects whether a character is Kanji, Hiragana, Katakana, or other.
 * Used for color coding and display.
 */

export type CharacterType = 
  | 'kanji' 
  | 'hiragana' 
  | 'katakana' 
  | 'romaji' 
  | 'punctuation' 
  | 'number'
  | 'other';

/**
 * Detect the type of a single character
 */
export function detectCharacterType(char: string): CharacterType {
  if (!char || char.length === 0) return 'other';
  
  const code = char.charCodeAt(0);
  
  // Hiragana: U+3040 - U+309F
  if (code >= 0x3040 && code <= 0x309F) {
    return 'hiragana';
  }
  
  // Katakana: U+30A0 - U+30FF
  if (code >= 0x30A0 && code <= 0x30FF) {
    return 'katakana';
  }
  
  // Half-width Katakana: U+FF65 - U+FF9F
  if (code >= 0xFF65 && code <= 0xFF9F) {
    return 'katakana';
  }
  
  // CJK Unified Ideographs (Kanji): U+4E00 - U+9FFF
  if (code >= 0x4E00 && code <= 0x9FFF) {
    return 'kanji';
  }
  
  // CJK Extension A: U+3400 - U+4DBF
  if (code >= 0x3400 && code <= 0x4DBF) {
    return 'kanji';
  }
  
  // CJK Compatibility Ideographs: U+F900 - U+FAFF
  if (code >= 0xF900 && code <= 0xFAFF) {
    return 'kanji';
  }
  
  // Basic Latin letters (a-z, A-Z)
  if ((code >= 0x0041 && code <= 0x005A) || 
      (code >= 0x0061 && code <= 0x007A)) {
    return 'romaji';
  }
  
  // Full-width Latin letters
  if ((code >= 0xFF21 && code <= 0xFF3A) || 
      (code >= 0xFF41 && code <= 0xFF5A)) {
    return 'romaji';
  }
  
  // Numbers (0-9)
  if ((code >= 0x0030 && code <= 0x0039) ||
      (code >= 0xFF10 && code <= 0xFF19)) {
    return 'number';
  }
  
  // Japanese punctuation
  if ('。、！？「」『』（）・〜ー'.includes(char)) {
    return 'punctuation';
  }
  
  // General punctuation
  if ('.,!?()[]{}"\'-:;'.includes(char)) {
    return 'punctuation';
  }
  
  return 'other';
}

/**
 * Detect the primary type of a word/string
 * Priority: kanji > katakana > hiragana > romaji > other
 */
export function detectWordType(word: string): CharacterType {
  if (!word || word.length === 0) return 'other';
  
  const types = new Set<CharacterType>();
  
  for (const char of word) {
    const type = detectCharacterType(char);
    if (type !== 'punctuation' && type !== 'other') {
      types.add(type);
    }
  }
  
  // Priority order
  if (types.has('kanji')) return 'kanji';
  if (types.has('katakana')) return 'katakana';
  if (types.has('hiragana')) return 'hiragana';
  if (types.has('romaji')) return 'romaji';
  if (types.has('number')) return 'number';
  
  return 'other';
}

/**
 * Check if string contains any Japanese characters
 */
export function containsJapanese(text: string): boolean {
  for (const char of text) {
    const type = detectCharacterType(char);
    if (type === 'kanji' || type === 'hiragana' || type === 'katakana') {
      return true;
    }
  }
  return false;
}

/**
 * Check if string is primarily Japanese
 */
export function isJapanese(text: string): boolean {
  if (!text || text.length === 0) return false;
  
  let japaneseCount = 0;
  let totalCount = 0;
  
  for (const char of text) {
    const type = detectCharacterType(char);
    if (type !== 'punctuation' && type !== 'other' && char.trim()) {
      totalCount++;
      if (type === 'kanji' || type === 'hiragana' || type === 'katakana') {
        japaneseCount++;
      }
    }
  }
  
  return totalCount > 0 && (japaneseCount / totalCount) > 0.5;
}

/**
 * Writing practice character type - simplified for stroke data lookup
 */
export type WritingCharacterType = 'kanji' | 'hiragana' | 'katakana' | 'unknown';

/**
 * Get writing character type for stroke data service
 * Used to determine which tier to look up stroke data from
 */
export function getWritingCharacterType(char: string): WritingCharacterType {
  const type = detectCharacterType(char);
  
  if (type === 'hiragana') return 'hiragana';
  if (type === 'katakana') return 'katakana';
  if (type === 'kanji') return 'kanji';
  
  return 'unknown';
}

/**
 * Check if a character can be practiced (has stroke data available)
 */
export function isPracticeable(char: string): boolean {
  const type = getWritingCharacterType(char);
  return type !== 'unknown';
}

/**
 * Get the Unicode code point hex string for a character
 * Used for stroke data lookup
 */
export function getCodePointHex(char: string): string {
  if (!char || char.length === 0) return '';
  return char.codePointAt(0)?.toString(16).padStart(5, '0') ?? '';
}
