const GOOGLE_TRANSLATE_API = 'https://translation.googleapis.com/language/translate/v2';

interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

class TranslationService {
  private apiKey: string | undefined;
  private cache: Map<string, TranslationResult> = new Map();

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;
  }

  async translateToEnglish(text: string): Promise<TranslationResult | null> {
    if (!text || text.trim().length === 0) {
      return null;
    }

    const cacheKey = `ja-en:${text}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.apiKey) {
      console.warn('Translation API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${GOOGLE_TRANSLATE_API}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'ja',
          target: 'en',
          format: 'text',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Translation API error:', response.status, errorText);
        return null;
      }

      const data: GoogleTranslateResponse = await response.json();
      
      if (!data.data?.translations?.length) {
        return null;
      }

      const result: TranslationResult = {
        translatedText: data.data.translations[0].translatedText,
        detectedSourceLanguage: data.data.translations[0].detectedSourceLanguage,
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
