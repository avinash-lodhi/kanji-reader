# Spec: Results Display

## Summary

Display OCR results with interactive characters. Tap to hear pronunciation, see readings and meanings. The core learning interface.

## User Flow

1. OCR completes → Navigate to Results screen
2. See scanned image thumbnail + **full extracted text**
3. Below: segmented words as tappable cards
4. Tap word → Pronunciation plays + detail panel shows
5. Panel shows: reading, romaji, meaning
6. Swipe/tap to dismiss panel
7. "Scan Again" button to return

## UI Components

### ResultsScreen
```typescript
interface ResultsScreenProps {
  imageUri: string;
  ocrResult: OCRResult;
  words: SegmentedWord[];  // From word segmentation
}
```

**Layout:**
```
┌─────────────────────────────┐
│  ← Back       Results       │  Header
├─────────────────────────────┤
│  ┌───────────────────────┐ │
│  │   [Scanned Image]     │ │  Small preview
│  └───────────────────────┘ │
├─────────────────────────────┤
│  Full text:                 │
│  「日本語を勉強する」        │  Complete text
│                             │  (read the whole sentence)
├─────────────────────────────┤
│  Words: (tap to learn)      │
│  ┌──────┐ ┌──┐ ┌────┐     │
│  │日本語│ │を│ │勉強│ ... │  Word cards
│  │nihongo│ │o ││benkyō│    │  (word-level, not chars)
│  └──────┘ └──┘ └────┘     │
├─────────────────────────────┤
│       [Scan Again]          │  Action
└─────────────────────────────┘
```

### WordCard (Not CharacterCard)
```typescript
interface WordCardProps {
  word: SegmentedWord;
  entry?: DictionaryEntry;
  onPress: () => void;
  isSelected: boolean;
}

interface SegmentedWord {
  text: string;           // "日本語"
  reading?: string;       // "にほんご" (if known)
  romaji?: string;        // "nihongo"
  primaryType: 'kanji' | 'hiragana' | 'katakana' | 'mixed';
}
```

**Why word-level (not character-level):**
- Kanji meanings change with context: 日 alone vs 日本 vs 日本語
- More useful for learning real vocabulary
- Matches how Japanese is actually read

**States:**
- Default: Word + romaji preview
- Selected: Highlighted border
- Loading: Shimmer while fetching dictionary

**Visual:**
```
┌─────────┐
│ 日本語  │  Word
│ nihongo │  Romaji
│   ◉     │  Type indicator (kanji=blue)
└─────────┘
```

### DetailPanel
```typescript
interface DetailPanelProps {
  entry: DictionaryEntry | KanjiEntry;
  onClose: () => void;
  onPlayAudio: () => void;
}
```

**Layout (Bottom Sheet):**
```
┌─────────────────────────┐
│  ━━━━━  (drag handle)   │
├─────────────────────────┤
│  漢字            🔊     │  Character + audio
│  かんじ (kanji)         │  Reading + romaji
├─────────────────────────┤
│  Meanings:              │
│  • Chinese character    │
│  • Kanji               │
├─────────────────────────┤
│  JLPT N5  •  6 strokes  │  Metadata
└─────────────────────────┘
```

### TextOverlay
```typescript
interface TextOverlayProps {
  imageUri: string;
  blocks: TextBlock[];
  onCharacterTap: (char: CharacterInfo) => void;
}
```

**Behavior:**
- Render image as background
- Draw semi-transparent boxes over detected text
- Tap box → Select that text segment

## Interactions

### Tap Character
1. Highlight card
2. Play pronunciation (TTS)
3. Show detail panel

### Long Press Character
- Show context menu:
  - Play slower
  - Copy character
  - Add to study list (future)

### Swipe Gestures
- Swipe left/right between characters
- Swipe down to dismiss panel

### Auto-play Option
- Setting to auto-play each character in sequence
- Useful for learning word pronunciation

## Animations

- Card selection: scale + highlight
- Panel: slide up from bottom
- Character type: color pulse on first view

## Color Coding

| Type | Color | Example |
|------|-------|---------|
| Kanji | Blue | 日 |
| Hiragana | Green | に |
| Katakana | Orange | ニ |
| Romaji | Gray | ni |

## Loading States

- Image loading: Blur placeholder
- OCR processing: Shimmer over image
- Dictionary lookup: Skeleton in panel
- TTS loading: Pulsing audio icon

## Empty States

- No text detected: "No Japanese text found. Try a clearer image."
- Dictionary miss: "Reading unknown" (still show character)

## Acceptance Criteria

- [ ] Image displays with text overlay
- [ ] Characters render in tappable cards
- [ ] Tap plays pronunciation
- [ ] Detail panel shows reading + meaning
- [ ] Character types color-coded
- [ ] Panel dismisses on outside tap/swipe
- [ ] "Scan Again" returns to camera
- [ ] Loading states shown appropriately
- [ ] Empty state handles no-text case
