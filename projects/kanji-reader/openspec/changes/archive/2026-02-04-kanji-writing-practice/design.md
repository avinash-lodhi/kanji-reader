# Design: Kanji Writing Practice

## Context

KanjiReader v1.0 is a read-only OCR app. This change adds interactive writing practice triggered from the word popup. The feature covers all three Japanese writing systems (hiragana, katakana, kanji).

**Key insight:** Japanese has a bounded character set (~5,100 total). This is NOT a growing dataset — we can design for the full ceiling from day one.

**Stakeholders:** Avinash (sole user/developer)
**Constraints:** Must work offline once stroke data is cached. Must feel responsive on mobile.

## Goals / Non-Goals

**Goals:**
- Teach correct stroke order for kanji, hiragana, and katakana
- Validate user-drawn strokes (order, direction, approximate path)
- Build memory recall — user writes from memory, hints are progressive fallbacks
- Persist practice words with per-character progress tracking
- Design schema to support future SRS without migration

**Non-Goals:**
- Handwriting recognition / artistic quality assessment
- SRS scheduling logic (v1 tracks data; scheduling is a future feature)
- Cloud sync (local-only for now)
- Calligraphy assessment (brush pressure, style)

## Architecture

### Data Separation: Reference vs User Data

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│   REFERENCE DATA (read-only)│     │   USER DATA (read-write)    │
│                             │     │                             │
│  Bundled stroke paths       │     │  Practice word list         │
│  Pre-processed KanjiVG      │     │  Per-character progress     │
│  ~5,100 characters max      │     │  Attempt history            │
│                             │     │                             │
│  Storage: bundled JSON      │     │  Storage: Zustand +         │
│  + lazy-load cache          │     │  AsyncStorage persist       │
└─────────────────────────────┘     └─────────────────────────────┘
```

### Stroke Data Strategy

**Source:** [KanjiVG](https://kanjivg.tagaini.net/) — open-source SVG stroke order data covering kanji + kana.

**Tiered bundling:**
| Tier | Characters | Count | Strategy |
|------|-----------|-------|----------|
| **Bundled** | Hiragana + Katakana | 92 | Always available, shipped with app |
| **Bundled** | JLPT N5–N3 Kanji | ~1,000 | Most common, shipped with app |
| **On-demand** | Remaining kanji | ~4,000 | Fetched on first use, cached permanently |

**Pre-processing pipeline** (build-time):
```
KanjiVG SVG files
    → Parse SVG paths per character
    → Extract: stroke paths, stroke count, stroke order
    → Output: compressed JSON lookup table
    → Bundle as app asset
```

**Estimated sizes:**
- Bundled set (1,092 chars): ~500KB compressed
- Full set (5,100 chars): ~2–3MB compressed
- Well within mobile app size budgets

### Practice Data Schema

Designed for future SRS from day one. Nullable fields = "not yet implemented but won't need migration."

```typescript
// Character-level progress (the core unit)
interface CharacterProgress {
  character: string;          // single character: "食", "あ", "ア"
  type: 'kanji' | 'hiragana' | 'katakana';
  attempts: number;           // total attempts
  successes: number;          // successful completions
  lastPracticed: number | null; // timestamp
  // SRS fields — populated but not consumed in v1
  nextReview: number | null;
  interval: number | null;    // days between reviews
  easeFactor: number | null;  // SM-2 ease factor
}

// Word-level entry in the practice list
interface PracticeWord {
  id: string;                 // uuid
  word: string;               // full word: "食べる"
  characters: string[];       // decomposed: ["食", "べ", "る"]
  reading: string;            // hiragana reading
  meaning: string;            // english meaning
  addedAt: number;            // timestamp
  source: 'scan' | 'manual'; // how it was added
}

// Store shape
interface PracticeStore {
  words: PracticeWord[];
  characterProgress: Record<string, CharacterProgress>; // keyed by character
  // Future: settings, SRS config
}
```

**Why `characterProgress` is separate from `words`:**
- A character like "食" might appear in multiple words
- Progress is per-character, not per-word
- At full scale: ~5,100 character entries × ~200 bytes = ~1MB (trivially small)

### Progressive Hint System

**Philosophy:** Memory recall first. Hints are earned, not given.

```
User attempts to write character from memory
    │
    ├─ Success → ✅ Next character / completion
    │
    └─ Stuck / Failed →
        │
        ├─ Hint 1: "This character has N strokes" (stroke count)
        │
        ├─ Hint 2: Show first stroke ghost (starting point)
        │
        └─ Hint 3: "Switch to Learn Mode" (full guide)
                    │
                    └─ After learning → return to Practice
```

**Implementation:**
- Hints are user-initiated (tap "hint" button), not automatic
- Each hint level reveals progressively more
- Using a hint on a character is tracked (affects future SRS weighting)
- No hint count shown by default — blank canvas, just the character to write

### Drawing Surface

**Tech:** react-native-gesture-handler + react-native-svg

**Why:**
- Already in Expo ecosystem (no native module headaches)
- Gesture handler provides smooth touch tracking
- SVG provides precise path rendering for both reference strokes and user input
- Performant enough for real-time stroke drawing

**Alternatives rejected:**
- react-native-canvas — heavier, less Expo-friendly
- react-native-skia — powerful but overkill, adds complexity

### Stroke Validation

**Approach:** Geometric path comparison (not ML).

**Algorithm:**
1. Capture user's touch points as a polyline
2. Compare against reference stroke:
   - **Start region:** User starts within ~30% of reference start area
   - **Direction:** Overall stroke direction matches (up/down/left/right/diagonal)
   - **End region:** User ends within ~30% of reference end area
   - **Path shape:** Simplified DTW (Dynamic Time Warping) or Fréchet distance
3. Tolerance: ~30% deviation — forgiving but catches reversed/wrong strokes

**Feedback:**
- Correct stroke → green overlay, auto-advance to next stroke
- Wrong stroke → red flash, stroke cleared, prompt to retry
- No penalty limit — user can retry indefinitely (learning, not testing)

**Why not ML:** The problem is stroke ORDER validation, not handwriting recognition. Geometric comparison is sufficient, deterministic, and runs offline with zero latency.

### Multi-Character Word Flow (Architecture-Ready)

**V1:** User selects a single character from the word to practice. The WritingPracticeScreen handles one character at a time.

**Future (architected for):** Sequential mode — user writes each character in the word in order. The screen accepts a `characters[]` array and steps through them.

**How the architecture supports this:**
- `PracticeWord.characters` is already an array
- WritingPracticeScreen accepts `characters: string[]` param
- V1 just passes a single-element array: `["食"]`
- Future: pass full array `["食", "べ", "る"]` and add a stepper UI

### Navigation

```
Scan Screen → Word Popup → [Practice Icon] → WritingPracticeScreen
                                                    ↑
Main Nav → Practice List Screen → [Tap Word] ───────┘
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| KanjiVG bundle size (~2-3MB full) | Tiered bundling; common set bundled, rest lazy-loaded |
| Stroke validation too strict/lenient | Start at 30% tolerance, make configurable, tune with use |
| Gesture conflicts with scroll | Drawing canvas captures all touches when active; no scroll in practice |
| AsyncStorage size limits (~6MB) | At full scale, practice data is ~1MB. Well within limits. |
| KanjiVG missing a character | Graceful fallback: show "stroke data unavailable", disable practice for that char |

## Migration Path

This design explicitly avoids needing data migrations:
- SRS fields are nullable from day one
- `characterProgress` is a flat map (easy to extend)
- `PracticeWord` decomposition supports both single-char and multi-char flows
- When SRS is added later, it reads the existing data and starts scheduling
