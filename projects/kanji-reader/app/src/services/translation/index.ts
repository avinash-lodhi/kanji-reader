/**
 * Translation Service Export
 * 
 * Backward-compatible export of the Cloud Translation service.
 * Replaces the previous MyMemory implementation.
 */

export { cloudTranslationService as translationService } from './cloudTranslation';
export { cloudTranslationService } from './cloudTranslation';
export { translationCache } from './translationCache';
export type {
  CacheStats,
  ITranslationService,
  TranslationError,
  TranslationErrorCode,
  TranslationOptions,
  TranslationResult,
} from './types';
