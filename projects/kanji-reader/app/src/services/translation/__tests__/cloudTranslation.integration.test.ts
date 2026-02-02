import { cloudTranslationService } from '../cloudTranslation';
import { translationCache } from '../translationCache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage since we are running in Node environment
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

describe('Cloud Translation Integration', () => {
  // Check if API key is present
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  const hasApiKey = !!apiKey && apiKey.length > 0;

  beforeAll(async () => {
    if (!hasApiKey) {
      console.warn('SKIPPING INTEGRATION TESTS: No API key found in EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY');
    }
    // Clear cache before starting
    await translationCache.clear();
  });

  afterEach(async () => {
    // Clear cache after each test to ensure isolation
    await translationCache.clear();
    jest.clearAllMocks();
  });

  // Helper to conditionally run tests
  const runIfApiKey = hasApiKey ? it : it.skip;

  runIfApiKey('should translate simple Japanese to English', async () => {
    const result = await cloudTranslationService.translateToEnglish('こんにちは');
    expect(result).not.toBeNull();
    expect(result?.translatedText.toLowerCase()).toMatch(/hello|hi|good afternoon/);
    // Source language is not returned when explicitly provided in request
    // expect(result?.detectedSourceLanguage).toBe('ja');
  });

  runIfApiKey('should translate a complete sentence', async () => {
    const result = await cloudTranslationService.translateToEnglish('今日は天気がいいですね');
    expect(result).not.toBeNull();
    expect(result?.translatedText).toBeTruthy();
    // English translation should be "The weather is nice today" or similar
    expect(result?.translatedText.length).toBeGreaterThan(10); 
  });

  runIfApiKey('should cache translation on second call', async () => {
    const text = '猫が好きです';
    
    // First call - API
    const result1 = await cloudTranslationService.translateToEnglish(text);
    expect(result1).not.toBeNull();
    expect(result1?.cached).toBeFalsy();
    
    // Second call - should be cached
    const result2 = await cloudTranslationService.translateToEnglish(text);
    expect(result2).not.toBeNull();
    expect(result2?.cached).toBeTruthy();
    expect(result2?.translatedText).toBe(result1?.translatedText);
  });

  runIfApiKey('should handle empty text gracefully', async () => {
    const result = await cloudTranslationService.translateToEnglish('');
    expect(result).toBeNull();
  });

  // Note: We avoid very long text tests to save quota and avoid potential flakiness in CI,
  // but we can test a moderately long sentence.
  runIfApiKey('should handle moderate length text', async () => {
    const longText = '吾輩は猫である。名前はまだ無い。'.repeat(5);
    const result = await cloudTranslationService.translateToEnglish(longText);
    expect(result).not.toBeNull();
    expect(result?.translatedText.length).toBeGreaterThan(longText.length / 2); // Rough check
  });

  runIfApiKey('should complete translation within reasonable time', async () => {
    const start = Date.now();
    await cloudTranslationService.translateToEnglish('速いテスト');
    const elapsed = Date.now() - start;
    // 2 seconds might be tight for some network conditions, but good for a target
    expect(elapsed).toBeLessThan(5000); 
  });
  
  runIfApiKey('should support batch translation', async () => {
    const texts = ['犬', '猫', '鳥'];
    const results = await cloudTranslationService.translateBatch(texts);
    
    expect(results).toHaveLength(3);
    expect(results[0]?.translatedText.toLowerCase()).toContain('dog');
    expect(results[1]?.translatedText.toLowerCase()).toContain('cat');
    expect(results[2]?.translatedText.toLowerCase()).toContain('bird');
  });
});
