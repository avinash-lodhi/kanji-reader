# Spec: Dictionary Lookup

## Summary

Lookup Japanese words/characters to get readings (romaji/furigana) and English meanings using Jisho API.

## Service Interface

```typescript
interface DictionaryService {
  lookup(text: string): Promise<DictionaryEntry[]>;
  lookupKanji(kanji: string): Promise<KanjiEntry>;
}

interface DictionaryEntry {
  word: string;
  reading: string;        // Hiragana reading
  romaji: string;         // Romanized reading
  meanings: string[];     // English definitions
  partsOfSpeech: string[];
  jlptLevel?: number;     // N5-N1
  commonWord: boolean;
}

interface KanjiEntry {
  character: string;
  meanings: string[];
  kunReadings: string[];  // Japanese readings
  onReadings: string[];   // Chinese readings
  strokeCount: number;
  jlptLevel?: number;
  grade?: number;         // School grade level
}
```

## Technical Implementation

### Jisho API Integration
```typescript
// services/dictionary/jisho.ts

const JISHO_API_URL = 'https://jisho.org/api/v1/search/words';

async function lookup(text: string): Promise<DictionaryEntry[]> {
  const response = await fetch(
    `${JISHO_API_URL}?keyword=${encodeURIComponent(text)}`
  );
  
  const data = await response.json();
  return data.data.map(parseJishoEntry);
}

function parseJishoEntry(entry: JishoRawEntry): DictionaryEntry {
  const japanese = entry.japanese[0];
  return {
    word: japanese.word || japanese.reading,
    reading: japanese.reading,
    romaji: toRomaji(japanese.reading),
    meanings: entry.senses.flatMap(s => s.english_definitions),
    partsOfSpeech: entry.senses.flatMap(s => s.parts_of_speech),
    jlptLevel: parseJlptLevel(entry.jlpt),
    commonWord: entry.is_common,
  };
}
```

### Romaji Conversion
```typescript
// Use wanakana library for hiragana/katakana ↔ romaji
import { toRomaji, toHiragana } from 'wanakana';

// Examples:
// toRomaji('かんじ') → 'kanji'
// toRomaji('カタカナ') → 'katakana'
```

### Caching Strategy (MVP)
```typescript
interface DictionaryCache {
  get(key: string): DictionaryEntry[] | null;
  set(key: string, entries: DictionaryEntry[]): void;
  clear(): void;
}

// LRU cache with 500 entry limit
// Purpose: Avoid repeat API calls for same words in a session
// Persist to AsyncStorage for cross-session performance
```

**MVP Scope:** Cache for performance only. Full offline dictionary deferred to v2.

## Fallback: Error Handling (Not Offline Mode)

If Jisho API fails:
- Show "Couldn't load meaning" with retry option
- Still display the word with romaji (wanakana can convert without API)
- Don't block the learning flow

**Future (v2):** Bundle common words dictionary for true offline support.

## Edge Cases

- Word not found → Return empty array, show "Unknown"
- Multiple readings → Show most common first
- Network error → Fall back to local dictionary
- Ambiguous segmentation → Show all possible matches

## Acceptance Criteria

- [ ] Single kanji lookup returns reading + meaning
- [ ] Multi-character word lookup works
- [ ] Romaji conversion is accurate
- [ ] Results cached for repeat lookups
- [ ] Offline fallback works for common words
- [ ] JLPT level shown when available
- [ ] API errors handled gracefully
