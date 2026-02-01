import { segmentText, needsSegmentation, getUniqueWords } from '../index';
import { kuromojiService } from '../../kuromoji';

jest.mock('../../kuromoji', () => ({
  kuromojiService: {
    isReady: jest.fn(),
    tokenize: jest.fn(),
  },
}));

const mockedKuromojiService = kuromojiService as jest.Mocked<typeof kuromojiService>;

describe('segmentText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array for empty input', () => {
    expect(segmentText('')).toEqual([]);
    expect(segmentText('   ')).toEqual([]);
  });

  it('falls back to Budoux when Kuromoji is not ready', () => {
    mockedKuromojiService.isReady.mockReturnValue(false);

    const result = segmentText('日本語');

    expect(mockedKuromojiService.isReady).toHaveBeenCalled();
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(w => w.text.length > 0)).toBe(true);
  });

  it('segments Japanese text using Budoux fallback', () => {
    mockedKuromojiService.isReady.mockReturnValue(false);

    const result = segmentText('今日は天気がいいです');

    expect(result.length).toBeGreaterThan(0);
    const texts = result.map(w => w.text);
    expect(texts.join('')).toContain('今日');
  });
});

describe('needsSegmentation', () => {
  it('returns true for Japanese text with hiragana', () => {
    expect(needsSegmentation('ひらがな')).toBe(true);
  });

  it('returns true for Japanese text with katakana', () => {
    expect(needsSegmentation('カタカナ')).toBe(true);
  });

  it('returns true for Japanese text with kanji', () => {
    expect(needsSegmentation('日本語')).toBe(true);
  });

  it('returns false for English text', () => {
    expect(needsSegmentation('Hello world')).toBe(false);
  });

  it('returns false for empty text', () => {
    expect(needsSegmentation('')).toBe(false);
  });

  it('returns true for mixed text with Japanese', () => {
    expect(needsSegmentation('Hello 日本')).toBe(true);
  });
});

describe('getUniqueWords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedKuromojiService.isReady.mockReturnValue(false);
  });

  it('returns unique words from text', () => {
    const result = getUniqueWords('日本語');

    expect(Array.isArray(result)).toBe(true);
    const uniqueSet = new Set(result);
    expect(result.length).toBe(uniqueSet.size);
  });

  it('returns empty array for empty text', () => {
    expect(getUniqueWords('')).toEqual([]);
  });
});
