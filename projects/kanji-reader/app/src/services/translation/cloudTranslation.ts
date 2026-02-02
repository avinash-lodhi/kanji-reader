/**
 * Cloud Translation Service
 * 
 * Google Cloud Translation API v2 implementation with:
 * - Two-level caching (L1 in-memory + L2 AsyncStorage)
 * - Comprehensive error handling
 * - Batch translation support
 * - Retry logic for transient failures
 */

import config from '../../constants/config';
import { translationCache } from './translationCache';
import {
  CacheStats,
  GoogleTranslateResponse,
  ITranslationService,
  TranslationErrorCode,
  TranslationOptions,
  TranslationResult,
} from './types';

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const BATCH_SIZE = 10; // Max texts per API call

class CloudTranslationService implements ITranslationService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    // Use dedicated Translation API key (separate from Vision key for security)
    this.apiKey = config.googleCloudTranslateApiKey;
    this.endpoint = config.translationApiUrl;
  }

  /**
   * Translate text to English with caching.
   */
  async translateToEnglish(
    text: string,
    options: TranslationOptions = {}
  ): Promise<TranslationResult | null> {
    const { sourceLanguage = 'ja', targetLanguage = 'en', skipCache = false } = options;

    // Validate input
    if (!text || text.trim().length === 0) {
      return null;
    }

    const cleanText = text.trim();

    // Check cache (unless skipCache)
    if (!skipCache) {
      const cached = await translationCache.get(cleanText, sourceLanguage, targetLanguage);
      if (cached) {
        console.log('TRANSLATION: Cache hit');
        return cached;
      }
    }

    // Validate API key
    if (!this.apiKey) {
      console.error('TRANSLATION: API key not configured');
      return null;
    }

    // Call API with retry
    const result = await this.callAPIWithRetry(cleanText, sourceLanguage, targetLanguage);

    // Cache successful result
    if (result) {
      await translationCache.set(cleanText, sourceLanguage, targetLanguage, result);
    }

    return result;
  }

  /**
   * Translate multiple texts in batches.
   */
  async translateBatch(
    texts: string[],
    options: TranslationOptions = {}
  ): Promise<(TranslationResult | null)[]> {
    const { sourceLanguage = 'ja', targetLanguage = 'en', skipCache = false } = options;
    
    // Filter and clean texts
    const cleanTexts = texts.map(t => t?.trim() || '').filter(t => t.length > 0);
    
    if (cleanTexts.length === 0) {
      return [];
    }

    const results: (TranslationResult | null)[] = new Array(cleanTexts.length).fill(null);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    // Check cache for each text
    if (!skipCache) {
      for (let i = 0; i < cleanTexts.length; i++) {
        const cached = await translationCache.get(cleanTexts[i], sourceLanguage, targetLanguage);
        if (cached) {
          results[i] = cached;
        } else {
          uncachedIndices.push(i);
          uncachedTexts.push(cleanTexts[i]);
        }
      }
    } else {
      uncachedIndices.push(...cleanTexts.map((_, i) => i));
      uncachedTexts.push(...cleanTexts);
    }

    // If all cached, return early
    if (uncachedTexts.length === 0) {
      console.log('TRANSLATION BATCH: All from cache');
      return results;
    }

    // Validate API key
    if (!this.apiKey) {
      console.error('TRANSLATION: API key not configured');
      return results;
    }

    // Process in batches
    for (let i = 0; i < uncachedTexts.length; i += BATCH_SIZE) {
      const batchTexts = uncachedTexts.slice(i, i + BATCH_SIZE);
      const batchIndices = uncachedIndices.slice(i, i + BATCH_SIZE);

      try {
        const batchResults = await this.callBatchAPI(batchTexts, sourceLanguage, targetLanguage);
        
        for (let j = 0; j < batchResults.length; j++) {
          const originalIndex = batchIndices[j];
          const result = batchResults[j];
          
          if (result) {
            results[originalIndex] = result;
            await translationCache.set(cleanTexts[originalIndex], sourceLanguage, targetLanguage, result);
          }
        }
      } catch (error) {
        console.error('TRANSLATION BATCH: Batch failed', error);
        // Continue with next batch
      }
    }

    return results;
  }

  /**
   * Clear all caches.
   */
  async clearCache(): Promise<void> {
    await translationCache.clear();
    console.log('TRANSLATION: Cache cleared');
  }

  /**
   * Get cache statistics.
   */
  getCacheStats(): CacheStats {
    return translationCache.getStats();
  }

  /**
   * Call Translation API with retry logic.
   */
  private async callAPIWithRetry(
    text: string,
    source: string,
    target: string,
    attempt: number = 0
  ): Promise<TranslationResult | null> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format: 'text',
          key: this.apiKey,
        }),
      });

      if (!response.ok) {
        return this.handleAPIError(response, text, source, target, attempt);
      }

      const data: GoogleTranslateResponse = await response.json();
      
      if (!data.data?.translations?.[0]) {
        console.warn('TRANSLATION: Empty response from API');
        return null;
      }

      return {
        translatedText: data.data.translations[0].translatedText,
        detectedSourceLanguage: data.data.translations[0].detectedSourceLanguage,
      };
    } catch (error) {
      // Network error - retry if possible
      if (this.isNetworkError(error) && attempt < MAX_RETRIES) {
        console.warn(`TRANSLATION: Network error, retry ${attempt + 1}/${MAX_RETRIES}`);
        await this.delay(RETRY_DELAY_MS * (attempt + 1));
        return this.callAPIWithRetry(text, source, target, attempt + 1);
      }

      console.error('TRANSLATION: Request failed', error);
      return null;
    }
  }

  /**
   * Call batch Translation API.
   */
  private async callBatchAPI(
    texts: string[],
    source: string,
    target: string
  ): Promise<(TranslationResult | null)[]> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source,
        target,
        format: 'text',
        key: this.apiKey,
      }),
    });

    if (!response.ok) {
      const errorCode = this.getErrorCode(response.status);
      console.error(`TRANSLATION BATCH: API error ${response.status} (${errorCode})`);
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data: GoogleTranslateResponse = await response.json();
    
    return (data.data?.translations || []).map(t => ({
      translatedText: t.translatedText,
      detectedSourceLanguage: t.detectedSourceLanguage,
    }));
  }

  /**
   * Handle API error responses.
   */
  private async handleAPIError(
    response: Response,
    text: string,
    source: string,
    target: string,
    attempt: number
  ): Promise<TranslationResult | null> {
    const status = response.status;
    const errorCode = this.getErrorCode(status);

    // Log error (without exposing API key)
    console.error(`TRANSLATION: API error ${status} (${errorCode})`);

    // Retry on rate limiting
    if (status === 429 && attempt < MAX_RETRIES) {
      console.warn(`TRANSLATION: Rate limited, retry ${attempt + 1}/${MAX_RETRIES}`);
      await this.delay(RETRY_DELAY_MS * (attempt + 1) * 2); // Longer delay for rate limits
      return this.callAPIWithRetry(text, source, target, attempt + 1);
    }

    // Log specific errors for debugging
    if (status === 403) {
      try {
        const errorBody = await response.json();
        if (errorBody?.error?.message?.includes('disabled')) {
          console.error('TRANSLATION: Cloud Translation API is not enabled in GCP Console');
        } else {
          console.error('TRANSLATION: Quota exceeded or permission denied');
        }
      } catch {
        console.error('TRANSLATION: Permission denied (403)');
      }
    } else if (status === 401) {
      console.error('TRANSLATION: Invalid API key');
    } else if (status === 400) {
      console.error('TRANSLATION: Invalid request (check text encoding)');
    }

    return null;
  }

  /**
   * Map HTTP status to error code.
   */
  private getErrorCode(status: number): TranslationErrorCode {
    switch (status) {
      case 401:
        return TranslationErrorCode.AUTH_ERROR;
      case 403:
        return TranslationErrorCode.API_DISABLED; // or QUOTA_EXCEEDED
      case 429:
        return TranslationErrorCode.RATE_LIMITED;
      case 400:
        return TranslationErrorCode.INVALID_TEXT;
      default:
        return TranslationErrorCode.UNKNOWN;
    }
  }

  /**
   * Check if error is a network error.
   */
  private isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && 
           (error.message.includes('Network') || error.message.includes('fetch'));
  }

  /**
   * Delay helper for retries.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton export
export const cloudTranslationService = new CloudTranslationService();
