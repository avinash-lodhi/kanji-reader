/**
 * Character Type Detection Tests (KanjiReader-e8c.8.3)
 *
 * Comprehensive tests for character type detection utility covering
 * all Unicode ranges, edge cases, and writing-practice helpers.
 */

import {
  detectCharacterType,
  detectWordType,
  containsJapanese,
  isJapanese,
  getWritingCharacterType,
  isPracticeable,
  getCodePointHex,
  CharacterType,
  WritingCharacterType,
} from '../characterType';

describe('detectCharacterType', () => {
  // --- Standard Hiragana -------------------------------------------------
  it('detects standard hiragana characters', () => {
    expect(detectCharacterType('あ')).toBe('hiragana');
    expect(detectCharacterType('い')).toBe('hiragana');
    expect(detectCharacterType('う')).toBe('hiragana');
    expect(detectCharacterType('え')).toBe('hiragana');
    expect(detectCharacterType('お')).toBe('hiragana');
    expect(detectCharacterType('ん')).toBe('hiragana');
  });

  // --- Standard Katakana -------------------------------------------------
  it('detects standard katakana characters', () => {
    expect(detectCharacterType('ア')).toBe('katakana');
    expect(detectCharacterType('イ')).toBe('katakana');
    expect(detectCharacterType('ウ')).toBe('katakana');
    expect(detectCharacterType('ン')).toBe('katakana');
  });

  // --- Half-width Katakana -----------------------------------------------
  it('detects half-width katakana', () => {
    // U+FF66 = ヲ (half-width)
    expect(detectCharacterType('ｦ')).toBe('katakana');
    // U+FF71 = ア (half-width)
    expect(detectCharacterType('ｱ')).toBe('katakana');
    // U+FF9D = ン (half-width)
    expect(detectCharacterType('ﾝ')).toBe('katakana');
  });

  // --- Common Kanji (CJK Unified Ideographs) -----------------------------
  it('detects common kanji', () => {
    expect(detectCharacterType('食')).toBe('kanji');
    expect(detectCharacterType('日')).toBe('kanji');
    expect(detectCharacterType('本')).toBe('kanji');
    expect(detectCharacterType('語')).toBe('kanji');
    expect(detectCharacterType('人')).toBe('kanji');
    expect(detectCharacterType('大')).toBe('kanji');
  });

  // --- CJK Extension A (rare kanji) -------------------------------------
  it('detects CJK Extension A kanji', () => {
    // U+3400 is the start of CJK Extension A
    expect(detectCharacterType('\u3400')).toBe('kanji');
    // U+4DB5 is within CJK Extension A
    expect(detectCharacterType('\u4DB5')).toBe('kanji');
  });

  // --- CJK Compatibility Ideographs -------------------------------------
  it('detects CJK Compatibility Ideographs', () => {
    // U+F900 = 豈 (CJK Compatibility)
    expect(detectCharacterType('\uF900')).toBe('kanji');
  });

  // --- Latin characters --------------------------------------------------
  it('detects Latin letters as romaji', () => {
    expect(detectCharacterType('a')).toBe('romaji');
    expect(detectCharacterType('z')).toBe('romaji');
    expect(detectCharacterType('A')).toBe('romaji');
    expect(detectCharacterType('Z')).toBe('romaji');
  });

  it('detects full-width Latin letters as romaji', () => {
    // U+FF21 = Ａ (full-width A)
    expect(detectCharacterType('Ａ')).toBe('romaji');
    // U+FF41 = ａ (full-width a)
    expect(detectCharacterType('ａ')).toBe('romaji');
  });

  // --- Numbers -----------------------------------------------------------
  it('detects numbers', () => {
    expect(detectCharacterType('0')).toBe('number');
    expect(detectCharacterType('1')).toBe('number');
    expect(detectCharacterType('9')).toBe('number');
  });

  it('detects full-width numbers', () => {
    // U+FF10 = ０ (full-width 0)
    expect(detectCharacterType('０')).toBe('number');
    // U+FF19 = ９ (full-width 9)
    expect(detectCharacterType('９')).toBe('number');
  });

  // --- Punctuation -------------------------------------------------------
  it('detects Japanese punctuation', () => {
    expect(detectCharacterType('。')).toBe('punctuation');
    expect(detectCharacterType('、')).toBe('punctuation');
    expect(detectCharacterType('！')).toBe('punctuation');
    expect(detectCharacterType('？')).toBe('punctuation');
    expect(detectCharacterType('「')).toBe('punctuation');
    expect(detectCharacterType('」')).toBe('punctuation');
  });

  it('detects Western punctuation', () => {
    expect(detectCharacterType('.')).toBe('punctuation');
    expect(detectCharacterType(',')).toBe('punctuation');
    expect(detectCharacterType('!')).toBe('punctuation');
    expect(detectCharacterType('?')).toBe('punctuation');
  });

  // --- Emoji / Unknown ---------------------------------------------------
  it('returns other for emoji', () => {
    expect(detectCharacterType('😀')).toBe('other');
    expect(detectCharacterType('🎉')).toBe('other');
  });

  it('returns other for special symbols', () => {
    expect(detectCharacterType('©')).toBe('other');
    expect(detectCharacterType('™')).toBe('other');
  });

  // --- Edge cases --------------------------------------------------------
  it('handles empty string gracefully', () => {
    expect(detectCharacterType('')).toBe('other');
  });

  it('only looks at first character of multi-char string', () => {
    expect(detectCharacterType('あい')).toBe('hiragana');
  });
});

describe('detectWordType', () => {
  it('detects pure hiragana word', () => {
    expect(detectWordType('ひらがな')).toBe('hiragana');
  });

  it('detects pure katakana word', () => {
    expect(detectWordType('カタカナ')).toBe('katakana');
  });

  it('detects pure kanji word', () => {
    expect(detectWordType('日本語')).toBe('kanji');
  });

  it('prioritizes kanji in mixed kanji+hiragana', () => {
    expect(detectWordType('食べる')).toBe('kanji');
  });

  it('prioritizes katakana over hiragana', () => {
    // e.g. a word with both katakana and hiragana
    expect(detectWordType('テストの')).toBe('katakana');
  });

  it('handles empty input', () => {
    expect(detectWordType('')).toBe('other');
  });

  it('handles punctuation-only string', () => {
    expect(detectWordType('。、')).toBe('other');
  });

  it('handles numbers', () => {
    expect(detectWordType('123')).toBe('number');
  });
});

describe('containsJapanese', () => {
  it('returns true for strings with kanji', () => {
    expect(containsJapanese('hello 日本')).toBe(true);
  });

  it('returns true for strings with hiragana', () => {
    expect(containsJapanese('test あ test')).toBe(true);
  });

  it('returns true for strings with katakana', () => {
    expect(containsJapanese('テスト')).toBe(true);
  });

  it('returns false for pure English', () => {
    expect(containsJapanese('hello world')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(containsJapanese('')).toBe(false);
  });

  it('returns false for numbers only', () => {
    expect(containsJapanese('12345')).toBe(false);
  });
});

describe('isJapanese', () => {
  it('returns true for primarily Japanese text', () => {
    expect(isJapanese('日本語のテスト')).toBe(true);
  });

  it('returns false for primarily English text', () => {
    expect(isJapanese('this is English')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isJapanese('')).toBe(false);
  });

  it('handles mixed content based on majority', () => {
    // More Japanese than non-Japanese
    expect(isJapanese('日本語ab')).toBe(true);
    // More non-Japanese than Japanese
    expect(isJapanese('abcdefg日')).toBe(false);
  });
});

describe('getWritingCharacterType', () => {
  it('returns hiragana for hiragana characters', () => {
    expect(getWritingCharacterType('あ')).toBe('hiragana');
    expect(getWritingCharacterType('ん')).toBe('hiragana');
  });

  it('returns katakana for katakana characters', () => {
    expect(getWritingCharacterType('ア')).toBe('katakana');
    expect(getWritingCharacterType('ン')).toBe('katakana');
  });

  it('returns kanji for kanji characters', () => {
    expect(getWritingCharacterType('食')).toBe('kanji');
    expect(getWritingCharacterType('日')).toBe('kanji');
  });

  it('returns unknown for Latin characters', () => {
    expect(getWritingCharacterType('a')).toBe('unknown');
    expect(getWritingCharacterType('Z')).toBe('unknown');
  });

  it('returns unknown for numbers', () => {
    expect(getWritingCharacterType('1')).toBe('unknown');
  });

  it('returns unknown for emoji', () => {
    expect(getWritingCharacterType('😀')).toBe('unknown');
  });

  it('returns unknown for punctuation', () => {
    expect(getWritingCharacterType('。')).toBe('unknown');
  });
});

describe('isPracticeable', () => {
  it('returns true for kanji', () => {
    expect(isPracticeable('食')).toBe(true);
    expect(isPracticeable('日')).toBe(true);
  });

  it('returns true for hiragana', () => {
    expect(isPracticeable('あ')).toBe(true);
  });

  it('returns true for katakana', () => {
    expect(isPracticeable('ア')).toBe(true);
  });

  it('returns false for Latin characters', () => {
    expect(isPracticeable('a')).toBe(false);
    expect(isPracticeable('B')).toBe(false);
  });

  it('returns false for numbers', () => {
    expect(isPracticeable('1')).toBe(false);
  });

  it('returns false for punctuation', () => {
    expect(isPracticeable('.')).toBe(false);
  });

  it('returns false for emoji', () => {
    expect(isPracticeable('🎉')).toBe(false);
  });
});

describe('getCodePointHex', () => {
  it('returns 5-digit hex for common kanji', () => {
    // '食' = U+98DF → "098df"
    expect(getCodePointHex('食')).toBe('098df');
  });

  it('returns 5-digit hex for hiragana', () => {
    // 'あ' = U+3042 → "03042"
    expect(getCodePointHex('あ')).toBe('03042');
  });

  it('returns 5-digit hex for katakana', () => {
    // 'ア' = U+30A2 → "030a2"
    expect(getCodePointHex('ア')).toBe('030a2');
  });

  it('returns empty string for empty input', () => {
    expect(getCodePointHex('')).toBe('');
  });

  it('pads with leading zeros for low code points', () => {
    // 'a' = U+0061 → "00061"
    expect(getCodePointHex('a')).toBe('00061');
  });
});
