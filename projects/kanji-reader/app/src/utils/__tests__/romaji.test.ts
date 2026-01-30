import { toRomaji, checkIsHiragana, checkIsKatakana, checkIsKana } from '../romaji';

describe('toRomaji', () => {
  it('converts hiragana to romaji', () => {
    expect(toRomaji('ひらがな')).toBe('hiragana');
    expect(toRomaji('にほんご')).toBe('nihongo');
  });

  it('converts katakana to romaji', () => {
    expect(toRomaji('カタカナ')).toBe('katakana');
    expect(toRomaji('コンピューター')).toBe('konpyuutaa');
  });

  it('passes kanji through', () => {
    expect(toRomaji('日本')).toBe('日本');
  });

  it('handles mixed text', () => {
    expect(toRomaji('食べる')).toBe('食beru');
  });

  it('handles empty input', () => {
    expect(toRomaji('')).toBe('');
  });
});

describe('checkIsHiragana', () => {
  it('returns true for hiragana', () => {
    expect(checkIsHiragana('ひらがな')).toBe(true);
  });

  it('returns false for katakana', () => {
    expect(checkIsHiragana('カタカナ')).toBe(false);
  });

  it('returns false for kanji', () => {
    expect(checkIsHiragana('日本')).toBe(false);
  });
});

describe('checkIsKatakana', () => {
  it('returns true for katakana', () => {
    expect(checkIsKatakana('カタカナ')).toBe(true);
  });

  it('returns false for hiragana', () => {
    expect(checkIsKatakana('ひらがな')).toBe(false);
  });
});

describe('checkIsKana', () => {
  it('returns true for hiragana', () => {
    expect(checkIsKana('ひらがな')).toBe(true);
  });

  it('returns true for katakana', () => {
    expect(checkIsKana('カタカナ')).toBe(true);
  });

  it('returns false for kanji', () => {
    expect(checkIsKana('日本')).toBe(false);
  });
});
