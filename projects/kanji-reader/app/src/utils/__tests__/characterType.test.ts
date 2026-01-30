import { detectCharacterType, detectWordType } from '../characterType';

describe('detectCharacterType', () => {
  it('detects hiragana', () => {
    expect(detectCharacterType('あ')).toBe('hiragana');
    expect(detectCharacterType('ん')).toBe('hiragana');
  });

  it('detects katakana', () => {
    expect(detectCharacterType('ア')).toBe('katakana');
    expect(detectCharacterType('ン')).toBe('katakana');
  });

  it('detects kanji', () => {
    expect(detectCharacterType('日')).toBe('kanji');
    expect(detectCharacterType('本')).toBe('kanji');
    expect(detectCharacterType('語')).toBe('kanji');
  });

  it('detects romaji', () => {
    expect(detectCharacterType('a')).toBe('romaji');
    expect(detectCharacterType('Z')).toBe('romaji');
  });

  it('detects numbers', () => {
    expect(detectCharacterType('1')).toBe('number');
    expect(detectCharacterType('0')).toBe('number');
  });

  it('detects punctuation', () => {
    expect(detectCharacterType('。')).toBe('punctuation');
    expect(detectCharacterType('、')).toBe('punctuation');
  });

  it('handles empty input', () => {
    expect(detectCharacterType('')).toBe('other');
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

  it('detects mixed kanji + hiragana as kanji', () => {
    expect(detectWordType('食べる')).toBe('kanji');
  });

  it('handles empty input', () => {
    expect(detectWordType('')).toBe('other');
  });
});
