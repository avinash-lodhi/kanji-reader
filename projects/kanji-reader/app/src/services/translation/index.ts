const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

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

    const cacheKey = `ja-en:${text}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=ja|en`;
      
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Translation API error:', response.status);
        return null;
      }

      const data: MyMemoryResponse = await response.json();
      
      if (data.responseStatus !== 200 || data.quotaFinished) {
        console.warn('Translation quota exceeded or error:', data.responseStatus);
        return null;
      }

      if (!data.responseData?.translatedText) {
        return null;
      }

      const result: TranslationResult = {
        translatedText: data.responseData.translatedText,
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

  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();
export type { TranslationResult };
