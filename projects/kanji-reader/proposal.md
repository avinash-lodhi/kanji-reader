# KanjiReader - Japanese Character Learning App

## Vision

Transform passive Japanese consumption (reading, watching) into active learning. Instead of relying on English translations that bypass Kanji recognition, help learners **see, hear, and understand** Japanese characters in context.

## Problem Statement

When learning Japanese, translation tools show English meanings but don't teach you to **recognize and read** the actual Kanji characters. You understand the content but never learn to read Japanese independently.

**Current pain points:**
- Reading Japanese text → reach for translator → get English → never learn the Kanji
- Watching Japanese shows → read English subtitles → Kanji remains unrecognized
- No connection between visual character recognition and pronunciation
- Learning feels separate from consumption

## Solution

A mobile app that acts as a **Kanji recognition companion**:
1. Point camera at Japanese text OR upload screenshot
2. App identifies Japanese characters (Kanji, Hiragana, Katakana)
3. Provides **pronunciation** (audio + romaji) for each character/word
4. Optionally shows English meaning
5. Focus: Build character recognition through repeated exposure

## Target User

- **Primary:** Avinash (ADHD-friendly, learns by doing, visual + audio learner)
- **Broader:** Japanese learners who consume Japanese media and want to learn naturally

## Core Scenarios

### Scenario 1: Reading Japanese Text
> *"I'm reading a manga/article in Japanese. I see a Kanji I don't recognize."*

1. Open KanjiReader app
2. Point camera at the text
3. App highlights recognized Japanese characters
4. Tap a character/word to hear pronunciation
5. See romaji and meaning
6. Continue reading with new knowledge

### Scenario 2: Watching Japanese Media
> *"I'm watching an anime/drama with Japanese subtitles. I want to learn the Kanji shown."*

1. Pause and screenshot the subtitle
2. Open KanjiReader, upload screenshot
3. App extracts and parses the Japanese text
4. Listen to pronunciation, learn the reading
5. Resume watching

## Features

### MVP (Phase 1)
1. **Camera Scan** - Live camera view with text region selection
2. **Image Upload** - Import screenshots/photos
3. **OCR Processing** - Japanese character recognition (Kanji, Hiragana, Katakana)
4. **Character Breakdown** - Split text into individual characters/words
5. **Pronunciation Audio** - Text-to-speech for Japanese
6. **Romaji Display** - Romanized reading for each character
7. **English Translation** - Optional meaning lookup

### Future (Phase 2+)
- Vocabulary saving / flashcard integration
- Learning progress tracking
- Stroke order animations
- JLPT level tagging
- History of scanned texts
- Offline mode

## Technical Considerations

### Platform
- **Mobile-first** (camera use case)
- **Primary:** iOS (iPhone) — Avinash's main device
- **Secondary:** Android
- **Distribution:** Local install only (no App Store/Play Store)
  - iOS: TestFlight or direct .ipa install via EAS
  - Android: .apk sideload
- React Native + Expo for cross-platform

### Key Technologies
- **OCR:** Google Cloud Vision / Tesseract (Japanese) / Apple Vision Framework
- **Text Processing:** Parse Kanji, Hiragana, Katakana segments
- **Dictionary API:** Jisho.org API or local dictionary
- **TTS:** Google Cloud TTS (Japanese voice) / Native TTS

### Data Flow
```
Camera/Image → OCR → Text Extraction → Character Parsing → 
→ Dictionary Lookup → TTS Generation → Display Results
```

## Success Metrics

- **Engagement:** Daily scans per session
- **Learning:** Characters recognized without lookup over time
- **Retention:** Return usage (learning becomes habit)

## Design Principles

1. **Minimal friction** - Camera-first, one-tap pronunciation
2. **ADHD-friendly** - Quick interactions, immediate feedback, no setup walls
3. **Learn by doing** - Integrated into real content consumption
4. **Audio-visual connection** - Always pair character with sound

## Decisions Made

| Question | Decision |
|----------|----------|
| Platform | React Native + Expo (mobile native) |
| OCR | Google Cloud Vision (accuracy + free tier) |
| Dictionary | Jisho API (free, online) |
| Vertical text | Later version |
| Handwritten text | Not in MVP — printed only |

## Out of Scope (MVP)

- Writing practice / stroke order
- Gamification / points system
- Social features
- Spaced repetition system
- Handwriting recognition
- Vertical Japanese text
- Offline mode

---

## Next Steps

1. Create detailed specs with OpenSpec
2. Break down into implementation tasks
3. Prototype camera → OCR → display flow
4. Build MVP

---

*Prepared by: Rei (零) | For: Avinash | Date: 2026-01-30*
