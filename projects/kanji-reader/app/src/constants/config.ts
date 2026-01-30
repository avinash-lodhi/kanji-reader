/**
 * App Configuration
 * 
 * Centralized access to environment variables and app settings.
 * All API keys and sensitive config should be accessed through this module.
 */

import Constants from 'expo-constants';

interface AppConfig {
  // API Keys
  googleCloudVisionApiKey: string;
  googleCloudTtsApiKey?: string;
  
  // API Endpoints
  visionApiUrl: string;
  jishoApiUrl: string;
  
  // App Settings
  maxImageDimension: number;
  imageQuality: number;
  dictionaryCacheSize: number;
}

const config: AppConfig = {
  // API Keys from environment
  googleCloudVisionApiKey: Constants.expoConfig?.extra?.googleCloudVisionApiKey || '',
  googleCloudTtsApiKey: Constants.expoConfig?.extra?.googleCloudTtsApiKey,
  
  // API Endpoints
  visionApiUrl: 'https://vision.googleapis.com/v1/images:annotate',
  jishoApiUrl: 'https://jisho.org/api/v1/search/words',
  
  // App Settings
  maxImageDimension: 1920,  // Resize images larger than this
  imageQuality: 0.8,        // JPEG quality for capture/resize
  dictionaryCacheSize: 500, // Max cached dictionary entries
};

export default config;

// Validation helper
export function validateConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!config.googleCloudVisionApiKey) {
    missing.push('GOOGLE_CLOUD_VISION_API_KEY');
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
