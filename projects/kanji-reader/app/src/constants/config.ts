/**
 * App Configuration
 * 
 * Centralized access to environment variables and app settings.
 * All API keys and sensitive config should be accessed through this module.
 * 
 * Security Note:
 * - API keys are stored in .env (gitignored)
 * - Each key is restricted to its specific API in GCP Console
 * - Keys are embedded in app bundle (consider app restrictions)
 */

interface AppConfig {
  // API Keys (separate keys for each service - principle of least privilege)
  googleCloudVisionApiKey: string;
  googleCloudTranslateApiKey: string;
  
  // API Endpoints
  visionApiUrl: string;
  translationApiUrl: string;
  jishoApiUrl: string;
  
  // App Settings
  maxImageDimension: number;
  imageQuality: number;
  dictionaryCacheSize: number;
  
  // Translation Cache Settings
  translationCacheSize: number;      // Max L1 in-memory cache entries
  translationCacheTtlMs: number;     // L2 AsyncStorage TTL (7 days)
}

const config: AppConfig = {
  // API Keys - separate keys for better security
  // Vision API key (restricted to Cloud Vision API)
  googleCloudVisionApiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY || '',
  // Translation API key (restricted to Cloud Translation API)
  googleCloudTranslateApiKey: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '',
  
  // API Endpoints
  visionApiUrl: 'https://vision.googleapis.com/v1/images:annotate',
  translationApiUrl: 'https://translation.googleapis.com/language/translate/v2',
  jishoApiUrl: 'https://jisho.org/api/v1/search/words',
  
  // App Settings
  maxImageDimension: 1920,  // Resize images larger than this
  imageQuality: 0.8,        // JPEG quality for capture/resize
  dictionaryCacheSize: 500, // Max cached dictionary entries
  
  // Translation Cache Settings
  translationCacheSize: 200,              // L1 in-memory cache entries
  translationCacheTtlMs: 7 * 24 * 60 * 60 * 1000,  // 7 days for L2 cache
};

export default config;

// Validation helper
export function validateConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!config.googleCloudVisionApiKey) {
    missing.push('EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY');
  }
  
  if (!config.googleCloudTranslateApiKey) {
    missing.push('EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY');
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
