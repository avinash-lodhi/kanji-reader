/**
 * Translation Cache Layer
 * 
 * Two-level caching strategy:
 * - L1: In-memory Map (fast, limited size, session-only)
 * - L2: AsyncStorage (persistent, TTL-based, survives restarts)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../constants/config';
import { CacheEntry, CacheStats, TranslationResult } from './types';

const L2_CACHE_PREFIX = '@translation_cache:';

export class TranslationCache {
  // L1: In-memory cache
  private l1Cache: Map<string, TranslationResult> = new Map();
  
  // Stats
  private stats: CacheStats = {
    l1Hits: 0,
    l1Misses: 0,
    l1Size: 0,
    l2Hits: 0,
    l2Misses: 0,
  };

  /**
   * Generate cache key from source/target/text
   */
  private getCacheKey(text: string, source: string, target: string): string {
    return `${source}:${target}:${text}`;
  }

  /**
   * Check L1 cache (sync, fast)
   */
  getFromL1(text: string, source: string = 'ja', target: string = 'en'): TranslationResult | null {
    const key = this.getCacheKey(text, source, target);
    const cached = this.l1Cache.get(key);
    
    if (cached) {
      this.stats.l1Hits++;
      return { ...cached, cached: true };
    }
    
    this.stats.l1Misses++;
    return null;
  }

  /**
   * Check L2 cache (async, persistent)
   */
  async getFromL2(text: string, source: string = 'ja', target: string = 'en'): Promise<TranslationResult | null> {
    const key = this.getCacheKey(text, source, target);
    
    try {
      const stored = await AsyncStorage.getItem(L2_CACHE_PREFIX + key);
      
      if (!stored) {
        this.stats.l2Misses++;
        return null;
      }

      const entry: CacheEntry = JSON.parse(stored);
      
      // Check TTL
      const age = Date.now() - entry.timestamp;
      if (age > config.translationCacheTtlMs) {
        // Expired - remove and return null
        await AsyncStorage.removeItem(L2_CACHE_PREFIX + key);
        this.stats.l2Misses++;
        return null;
      }

      this.stats.l2Hits++;
      
      // Promote to L1
      const result: TranslationResult = {
        translatedText: entry.translatedText,
        detectedSourceLanguage: entry.detectedSourceLanguage,
        cached: true,
      };
      this.setL1(text, source, target, result);
      
      return result;
    } catch (error) {
      console.warn('L2 cache read error:', error);
      this.stats.l2Misses++;
      return null;
    }
  }

  /**
   * Get from both caches (L1 first, then L2)
   */
  async get(text: string, source: string = 'ja', target: string = 'en'): Promise<TranslationResult | null> {
    // Try L1 first (fast)
    const l1Result = this.getFromL1(text, source, target);
    if (l1Result) {
      return l1Result;
    }

    // Try L2 (async)
    return this.getFromL2(text, source, target);
  }

  /**
   * Store in L1 cache only
   */
  private setL1(text: string, source: string, target: string, result: TranslationResult): void {
    const key = this.getCacheKey(text, source, target);
    
    // LRU eviction: remove oldest if at capacity
    if (this.l1Cache.size >= config.translationCacheSize) {
      const oldestKey = this.l1Cache.keys().next().value;
      if (oldestKey) {
        this.l1Cache.delete(oldestKey);
      }
    }
    
    this.l1Cache.set(key, result);
    this.stats.l1Size = this.l1Cache.size;
  }

  /**
   * Store in both L1 and L2 caches
   */
  async set(
    text: string,
    source: string,
    target: string,
    result: TranslationResult
  ): Promise<void> {
    const key = this.getCacheKey(text, source, target);
    
    // Store in L1
    this.setL1(text, source, target, result);

    // Store in L2 (async, fire-and-forget with error handling)
    try {
      const entry: CacheEntry = {
        translatedText: result.translatedText,
        detectedSourceLanguage: result.detectedSourceLanguage,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(L2_CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('L2 cache write error:', error);
      // Non-fatal - L1 cache still works
    }
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    // Clear L1
    this.l1Cache.clear();
    this.stats.l1Size = 0;

    // Clear L2 (only our keys)
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const translationKeys = allKeys.filter(k => k.startsWith(L2_CACHE_PREFIX));
      if (translationKeys.length > 0) {
        await AsyncStorage.multiRemove(translationKeys);
      }
    } catch (error) {
      console.warn('L2 cache clear error:', error);
    }

    // Reset stats
    this.stats = {
      l1Hits: 0,
      l1Misses: 0,
      l1Size: 0,
      l2Hits: 0,
      l2Misses: 0,
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
}

// Singleton instance
export const translationCache = new TranslationCache();
