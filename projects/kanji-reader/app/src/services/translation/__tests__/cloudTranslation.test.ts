/**
 * CloudTranslationService Unit Tests
 */

import { cloudTranslationService } from '../cloudTranslation';
import { translationCache } from '../translationCache';
import config from '../../../constants/config';

// Mock fetch
global.fetch = jest.fn();

// Mock config
jest.mock('../../../constants/config', () => ({
  __esModule: true,
  default: {
    googleCloudTranslateApiKey: 'test-translate-api-key',
    translationApiUrl: 'https://translation.googleapis.com/language/translate/v2',
    translationCacheSize: 10,
    translationCacheTtlMs: 1000 * 60 * 60, // 1 hour
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

describe('CloudTranslationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache between tests
    translationCache['l1Cache'].clear();
    translationCache['stats'] = {
      l1Hits: 0,
      l1Misses: 0,
      l1Size: 0,
      l2Hits: 0,
      l2Misses: 0,
    };
  });

  describe('translateToEnglish', () => {
    it('should translate Japanese text to English', async () => {
      const mockResponse = {
        data: {
          translations: [
            { translatedText: 'Hello', detectedSourceLanguage: 'ja' },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await cloudTranslationService.translateToEnglish('こんにちは');

      expect(result).toEqual({
        translatedText: 'Hello',
        detectedSourceLanguage: 'ja',
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return null for empty text', async () => {
      const result = await cloudTranslationService.translateToEnglish('');
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null for whitespace-only text', async () => {
      const result = await cloudTranslationService.translateToEnglish('   \n\t  ');
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should trim input text before translating', async () => {
      const mockResponse = {
        data: {
          translations: [{ translatedText: 'Test' }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await cloudTranslationService.translateToEnglish('  テスト  ');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"q":"テスト"'),
        })
      );
    });

    it('should use cached result on second call', async () => {
      const mockResponse = {
        data: {
          translations: [{ translatedText: 'Hello' }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call - should hit API
      const result1 = await cloudTranslationService.translateToEnglish('こんにちは');
      expect(result1?.translatedText).toBe('Hello');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await cloudTranslationService.translateToEnglish('こんにちは');
      expect(result2?.translatedText).toBe('Hello');
      expect(result2?.cached).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should skip cache when skipCache option is true', async () => {
      const mockResponse = {
        data: {
          translations: [{ translatedText: 'Hello' }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call
      await cloudTranslationService.translateToEnglish('こんにちは');
      
      // Second call with skipCache
      await cloudTranslationService.translateToEnglish('こんにちは', { skipCache: true });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should return null on 401 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
      });

      const result = await cloudTranslationService.translateToEnglish('テスト');

      expect(result).toBeNull();
    });

    it('should return null on 403 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: { message: 'Quota exceeded' } }),
      });

      const result = await cloudTranslationService.translateToEnglish('テスト');

      expect(result).toBeNull();
    });

    it('should retry on 429 rate limit error', async () => {
      const mockResponse = {
        data: {
          translations: [{ translatedText: 'Test' }],
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

      const result = await cloudTranslationService.translateToEnglish('テスト');

      expect(result?.translatedText).toBe('Test');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return null on network error after retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new TypeError('Network request failed'));

      const result = await cloudTranslationService.translateToEnglish('テスト');

      expect(result).toBeNull();
      // 1 initial + 2 retries = 3 calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('translateBatch', () => {
    it('should translate multiple texts in one API call', async () => {
      const mockResponse = {
        data: {
          translations: [
            { translatedText: 'Hello' },
            { translatedText: 'Goodbye' },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const results = await cloudTranslationService.translateBatch([
        'こんにちは',
        'さようなら',
      ]);

      expect(results).toHaveLength(2);
      expect(results[0]?.translatedText).toBe('Hello');
      expect(results[1]?.translatedText).toBe('Goodbye');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should use cached results where available', async () => {
      // Pre-populate cache
      const mockResponse1 = {
        data: {
          translations: [{ translatedText: 'Hello' }],
        },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse1),
      });
      await cloudTranslationService.translateToEnglish('こんにちは');

      // Now batch translate with one cached, one new
      const mockResponse2 = {
        data: {
          translations: [{ translatedText: 'Goodbye' }],
        },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse2),
      });

      const results = await cloudTranslationService.translateBatch([
        'こんにちは', // cached
        'さようなら', // new
      ]);

      expect(results[0]?.cached).toBe(true);
      expect(results[1]?.translatedText).toBe('Goodbye');
      // Only 2 API calls total (1 for initial, 1 for batch)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return empty array for empty input', async () => {
      const results = await cloudTranslationService.translateBatch([]);
      expect(results).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const mockResponse = {
        data: {
          translations: [{ translatedText: 'Hello' }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call - miss
      await cloudTranslationService.translateToEnglish('こんにちは');
      
      // Second call - hit
      await cloudTranslationService.translateToEnglish('こんにちは');

      const stats = cloudTranslationService.getCacheStats();

      expect(stats.l1Hits).toBe(1);
      expect(stats.l1Misses).toBeGreaterThanOrEqual(1);
      expect(stats.l1Size).toBe(1);
    });
  });
});
