/**
 * Translation Service Type Definitions
 * 
 * Interfaces and types for the Cloud Translation API service.
 */

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  confidence?: number;  // 0-1 confidence (reserved for future use)
  cached?: boolean;     // Indicates if result came from cache
}

export interface TranslationOptions {
  sourceLanguage?: string;  // Default: 'ja'
  targetLanguage?: string;  // Default: 'en'
  skipCache?: boolean;      // Force fresh translation
}

export enum TranslationErrorCode {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  API_DISABLED = 'API_DISABLED',
  INVALID_TEXT = 'INVALID_TEXT',
  UNKNOWN = 'UNKNOWN',
}

export interface TranslationError {
  code: TranslationErrorCode;
  message: string;
  retryable: boolean;
}

export interface CacheStats {
  l1Hits: number;
  l1Misses: number;
  l1Size: number;
  l2Hits: number;
  l2Misses: number;
}

export interface ITranslationService {
  /**
   * Translate text to English (primary method).
   * Uses two-level caching (L1 memory, L2 AsyncStorage).
   */
  translateToEnglish(text: string, options?: TranslationOptions): Promise<TranslationResult | null>;

  /**
   * Translate multiple texts in a single API call (batching).
   * More efficient for multiple translations.
   */
  translateBatch(texts: string[], options?: TranslationOptions): Promise<(TranslationResult | null)[]>;

  /**
   * Clear all caches (L1 + L2).
   */
  clearCache(): Promise<void>;

  /**
   * Get cache statistics for debugging.
   */
  getCacheStats(): CacheStats;
}

// Google Cloud Translation API v2 Response Types
export interface GoogleTranslateResponse {
  data: {
    translations: GoogleTranslation[];
  };
}

export interface GoogleTranslation {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// L2 Cache Entry (stored in AsyncStorage)
export interface CacheEntry {
  translatedText: string;
  detectedSourceLanguage?: string;
  timestamp: number;
}
