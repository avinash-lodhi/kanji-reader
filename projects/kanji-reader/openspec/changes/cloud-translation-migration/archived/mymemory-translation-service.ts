/**
 * ARCHIVED: MyMemory Translation Service
 * 
 * This file is preserved for reference only.
 * It was replaced by CloudTranslationService on 2026-02-02.
 * 
 * Reasons for replacement:
 * - 50-char chunking limit broke sentence context
 * - Lower translation quality for colloquial Japanese
 * - Rate limiting (1K-10K words/day depending on auth)
 * - No persistent caching
 * 
 * The new CloudTranslationService provides:
 * - Full sentence translation (no chunking)
 * - Higher quality neural machine translation
 * - Two-level caching (L1 in-memory + L2 AsyncStorage)
 * - Better error handling with retries
 * 
 * See: openspec/changes/cloud-translation-migration/
 */

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
// Add your email for 10,000 words/day instead of 1,000
// Get a free API key at https://mymemory.translated.net/doc/keygen.php for even more
const MYMEMORY_EMAIL = 'avinash.j.p.lodhi@gmail.com';

interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
    match: number;
  };
  quotaFinished?: boolean;
}

class TranslationService {
  private cache: Map<string, TranslationResult> = new Map();

  async translateToEnglish(text: string): Promise<TranslationResult | null> {
    if (!text || text.trim().length === 0) {
      return null;
    }

    const cleanText = text.trim();
    const cacheKey = `ja-en:${cleanText}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // MyMemory limits to ~50 Japanese chars per request, so chunk the text
    const CHUNK_SIZE = 50;
    const chunks: string[] = [];
    for (let i = 0; i < cleanText.length; i += CHUNK_SIZE) {
      chunks.push(cleanText.slice(i, i + CHUNK_SIZE));
    }

    console.log('TRANSLATION SERVICE - Text length:', cleanText.length, 'Chunks:', chunks.length);

    try {
      const translatedChunks: string[] = [];
      
      for (const chunk of chunks) {
        const chunkResult = await this.translateChunk(chunk);
        if (chunkResult) {
          translatedChunks.push(chunkResult);
        } else {
          // If any chunk fails, return partial result or null
          console.warn('Chunk translation failed, returning partial result');
          break;
        }
      }

      if (translatedChunks.length === 0) {
        return null;
      }

      const result: TranslationResult = {
        translatedText: translatedChunks.join(' '),
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network')) {
        console.error('Network error during translation');
      } else {
        console.error('Translation error:', error);
      }
      return null;
    }
  }

  private async translateChunk(chunk: string): Promise<string | null> {
    try {
      const formData = new URLSearchParams();
      formData.append('q', chunk);
      formData.append('langpair', 'ja|en');
      if (MYMEMORY_EMAIL) {
        formData.append('de', MYMEMORY_EMAIL);
      }

      const response = await fetch(MYMEMORY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        console.error('Translation API error:', response.status);
        return null;
      }

      const data: MyMemoryResponse = await response.json();

      if (data.responseStatus !== 200 || data.quotaFinished) {
        console.warn('Translation chunk error:', data.responseStatus);
        return null;
      }

      return data.responseData?.translatedText ?? null;
    } catch (error) {
      console.error('Chunk translation error:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();
export type { TranslationResult };
