/**
 * TranslationCache Unit Tests
 */

import { TranslationCache } from '../translationCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock config
jest.mock('../../../constants/config', () => ({
  __esModule: true,
  default: {
    translationCacheSize: 3, // Small size for testing LRU
    translationCacheTtlMs: 1000, // 1 second for testing expiry
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

describe('TranslationCache', () => {
  let cache: TranslationCache;

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new TranslationCache();
  });

  describe('L1 Cache (In-Memory)', () => {
    it('should return null for cache miss', () => {
      const result = cache.getFromL1('missing', 'ja', 'en');
      expect(result).toBeNull();
    });

    it('should return cached result for cache hit', async () => {
      const testResult = { translatedText: 'Hello' };
      
      await cache.set('こんにちは', 'ja', 'en', testResult);
      const result = cache.getFromL1('こんにちは', 'ja', 'en');

      expect(result?.translatedText).toBe('Hello');
      expect(result?.cached).toBe(true);
    });

    it('should track hit/miss statistics', async () => {
      await cache.set('test', 'ja', 'en', { translatedText: 'Test' });

      // Miss
      cache.getFromL1('missing', 'ja', 'en');
      
      // Hit
      cache.getFromL1('test', 'ja', 'en');
      cache.getFromL1('test', 'ja', 'en');

      const stats = cache.getStats();
      expect(stats.l1Hits).toBe(2);
      expect(stats.l1Misses).toBe(1);
    });

    it('should evict oldest entry when at capacity (LRU)', async () => {
      // Fill cache to capacity (3 items)
      await cache.set('word1', 'ja', 'en', { translatedText: 'Translation 1' });
      await cache.set('word2', 'ja', 'en', { translatedText: 'Translation 2' });
      await cache.set('word3', 'ja', 'en', { translatedText: 'Translation 3' });

      expect(cache.getStats().l1Size).toBe(3);

      // Add 4th item - should evict word1
      await cache.set('word4', 'ja', 'en', { translatedText: 'Translation 4' });

      expect(cache.getStats().l1Size).toBe(3);
      expect(cache.getFromL1('word1', 'ja', 'en')).toBeNull(); // Evicted
      expect(cache.getFromL1('word2', 'ja', 'en')?.translatedText).toBe('Translation 2');
      expect(cache.getFromL1('word4', 'ja', 'en')?.translatedText).toBe('Translation 4');
    });

    it('should use composite key from source/target/text', async () => {
      await cache.set('test', 'ja', 'en', { translatedText: 'Test (ja→en)' });
      await cache.set('test', 'en', 'ja', { translatedText: 'Test (en→ja)' });

      const jaToEn = cache.getFromL1('test', 'ja', 'en');
      const enToJa = cache.getFromL1('test', 'en', 'ja');

      expect(jaToEn?.translatedText).toBe('Test (ja→en)');
      expect(enToJa?.translatedText).toBe('Test (en→ja)');
    });
  });

  describe('L2 Cache (AsyncStorage)', () => {
    it('should return null for cache miss', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await cache.getFromL2('missing', 'ja', 'en');

      expect(result).toBeNull();
      expect(cache.getStats().l2Misses).toBe(1);
    });

    it('should return cached result for cache hit', async () => {
      const cachedEntry = {
        translatedText: 'Hello',
        detectedSourceLanguage: 'ja',
        timestamp: Date.now(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedEntry));

      const result = await cache.getFromL2('こんにちは', 'ja', 'en');

      expect(result?.translatedText).toBe('Hello');
      expect(result?.cached).toBe(true);
      expect(cache.getStats().l2Hits).toBe(1);
    });

    it('should expire entries after TTL', async () => {
      // Entry from 2 seconds ago (TTL is 1 second)
      const expiredEntry = {
        translatedText: 'Old',
        timestamp: Date.now() - 2000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(expiredEntry));

      const result = await cache.getFromL2('expired', 'ja', 'en');

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
      expect(cache.getStats().l2Misses).toBe(1);
    });

    it('should promote L2 hit to L1 cache', async () => {
      const cachedEntry = {
        translatedText: 'Hello',
        timestamp: Date.now(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedEntry));

      // L2 hit
      await cache.getFromL2('こんにちは', 'ja', 'en');

      // Should now be in L1
      const l1Result = cache.getFromL1('こんにちは', 'ja', 'en');
      expect(l1Result?.translatedText).toBe('Hello');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await cache.getFromL2('error', 'ja', 'en');

      expect(result).toBeNull();
      expect(cache.getStats().l2Misses).toBe(1);
    });

    it('should write to both L1 and L2 on set', async () => {
      await cache.set('new', 'ja', 'en', { translatedText: 'New' });

      // Check L1
      const l1Result = cache.getFromL1('new', 'ja', 'en');
      expect(l1Result?.translatedText).toBe('New');

      // Check L2 was called
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@translation_cache:ja:en:new',
        expect.stringContaining('"translatedText":"New"')
      );
    });
  });

  describe('Combined get()', () => {
    it('should return L1 result if available (no L2 check)', async () => {
      // Pre-populate L1
      await cache.set('cached', 'ja', 'en', { translatedText: 'L1 Result' });

      const result = await cache.get('cached', 'ja', 'en');

      expect(result?.translatedText).toBe('L1 Result');
      // L2 should not be checked
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it('should fall back to L2 if L1 misses', async () => {
      const l2Entry = {
        translatedText: 'L2 Result',
        timestamp: Date.now(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(l2Entry));

      const result = await cache.get('not-in-l1', 'ja', 'en');

      expect(result?.translatedText).toBe('L2 Result');
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it('should return null if both L1 and L2 miss', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await cache.get('nowhere', 'ja', 'en');

      expect(result).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should clear L1 cache', async () => {
      await cache.set('test1', 'ja', 'en', { translatedText: 'Test 1' });
      await cache.set('test2', 'ja', 'en', { translatedText: 'Test 2' });

      expect(cache.getStats().l1Size).toBe(2);

      await cache.clear();

      expect(cache.getStats().l1Size).toBe(0);
      expect(cache.getFromL1('test1', 'ja', 'en')).toBeNull();
    });

    it('should clear only translation keys from L2', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce([
        '@translation_cache:ja:en:test1',
        '@translation_cache:ja:en:test2',
        '@other_key:something',
      ]);

      await cache.clear();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@translation_cache:ja:en:test1',
        '@translation_cache:ja:en:test2',
      ]);
    });

    it('should reset statistics', async () => {
      await cache.set('test', 'ja', 'en', { translatedText: 'Test' });
      cache.getFromL1('test', 'ja', 'en');
      cache.getFromL1('test', 'ja', 'en');

      expect(cache.getStats().l1Hits).toBe(2);

      await cache.clear();

      const stats = cache.getStats();
      expect(stats.l1Hits).toBe(0);
      expect(stats.l1Misses).toBe(0);
      expect(stats.l2Hits).toBe(0);
      expect(stats.l2Misses).toBe(0);
    });
  });
});
