# Translation Service Specification

## Overview

KanjiReader uses Google Cloud Translation API v2 for high-quality Japanese → English translation. The service features a two-level caching strategy to minimize API costs and improve response times.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   CloudTranslationService                    │
├─────────────────────────────────────────────────────────────┤
│  translateToEnglish(text)                                   │
│  translateBatch(texts[])                                    │
│  clearCache()                                               │
│  getCacheStats()                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    TranslationCache                          │
├─────────────────────────────────────────────────────────────┤
│  L1 Cache (In-Memory)                                       │
│    • Map-based, LRU eviction                                │
│    • Max 200 entries                                        │
│    • Session-only (cleared on restart)                      │
├─────────────────────────────────────────────────────────────┤
│  L2 Cache (AsyncStorage)                                    │
│    • Persistent across app restarts                         │
│    • TTL-based expiry (7 days)                              │
│    • Key prefix: @translation_cache:                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Google Cloud Translation API v2                 │
│                                                              │
│  POST https://translation.googleapis.com/language/translate/v2
│                                                              │
│  Features:                                                   │
│    • Neural Machine Translation (NMT)                        │
│    • Supports 100+ languages                                 │
│    • Batch translation (up to 128 texts)                     │
│    • Automatic language detection                            │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Required Environment Variable

```bash
# .env (not committed to git)
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=AIzaSy...
```

**Note:** The same API key is used for Vision API and Translation API. Ensure both APIs are enabled in your GCP project.

### Config Constants (`app/src/constants/config.ts`)

| Setting | Default | Description |
|---------|---------|-------------|
| `translationApiUrl` | `https://translation.googleapis.com/language/translate/v2` | API endpoint |
| `translationCacheSize` | 200 | Max L1 cache entries |
| `translationCacheTtlMs` | 604800000 (7 days) | L2 cache TTL |

## API Usage

### Single Translation

```typescript
import { translationService } from './services/translation';

const result = await translationService.translateToEnglish('こんにちは');
// result: { translatedText: 'Hello', cached: false }
```

### Batch Translation

```typescript
const results = await translationService.translateBatch([
  'おはようございます',
  'こんばんは',
]);
// Sends single API request with multiple texts
```

### Skip Cache

```typescript
const result = await translationService.translateToEnglish(
  'test',
  { skipCache: true }
);
```

### Cache Statistics

```typescript
const stats = translationService.getCacheStats();
// { l1Hits: 42, l1Misses: 10, l1Size: 52, l2Hits: 5, l2Misses: 5 }
```

## Error Handling

| HTTP Status | Error Code | Retryable | Action |
|-------------|------------|-----------|--------|
| 401 | `AUTH_ERROR` | No | Check API key |
| 403 | `API_DISABLED` | No | Enable API in GCP Console |
| 403 | `QUOTA_EXCEEDED` | No | Wait or upgrade quota |
| 429 | `RATE_LIMITED` | Yes | Automatic retry with backoff |
| 5xx | `UNKNOWN` | Yes | Automatic retry (2 attempts) |

## Costs

### Free Tier (per month)

- **Cloud Translation API:** 500,000 characters free
- **Typical usage:** ~10-20 characters per translation
- **Estimated free translations:** 25,000-50,000/month

### Paid Pricing

| Volume | Price per million characters |
|--------|------------------------------|
| 0-500K | Free |
| 500K+ | $20 |

### Cost Optimization

1. **L1 Cache:** Avoids re-translating same text within session
2. **L2 Cache:** Persists translations for 7 days
3. **Batch API:** Single request for multiple texts reduces overhead
4. **Word-level only:** DetailPanel only translates when no Jisho match

## File Structure

```
app/src/services/translation/
├── index.ts              # Exports (backward compatible)
├── types.ts              # Interfaces and types
├── cloudTranslation.ts   # Main service implementation
├── translationCache.ts   # Two-level cache
└── __tests__/
    ├── cloudTranslation.test.ts
    └── translationCache.test.ts
```

## Migration from MyMemory

The previous MyMemory implementation had limitations:
- 50-character chunking broke sentence context
- Lower translation quality
- Rate limiting (1K-10K words/day)
- No persistent caching

**Archived:** `openspec/changes/cloud-translation-migration/archived/mymemory-translation-service.ts`
