# Change Proposal: MVP Kanji Reader

## Change ID
`mvp-kanji-reader`

## Summary

Build the minimum viable product for KanjiReader - a mobile app that helps learn Japanese Kanji through camera scanning and pronunciation.

## Motivation

Learning Japanese Kanji is difficult because translation tools provide English meanings without teaching character recognition or pronunciation. Users need a tool that bridges the gap between seeing Kanji and being able to read/pronounce it.

## Scope

### In Scope
- React Native app setup with Expo
- Camera capture with region selection
- Image upload from gallery
- Japanese OCR via Google Cloud Vision
- Dictionary lookup via Jisho API
- Text-to-speech pronunciation
- Results display with tappable characters
- Romaji display for readings

### Out of Scope (Future)
- User accounts
- Vocabulary saving
- Flashcard/SRS system
- Offline mode
- Writing practice
- Progress tracking

## User Stories

1. **As a learner**, I can scan Japanese text with my camera so that I can learn to read unfamiliar Kanji.

2. **As a learner**, I can upload a screenshot of subtitles so that I can learn Kanji while watching shows.

3. **As a learner**, I can tap any character to hear its pronunciation so that I learn the correct reading.

4. **As a learner**, I can see the romaji and meaning of characters so that I understand what I'm reading.

## Technical Approach

### Platform
- **Primary:** iOS (iPhone) — main development target
- **Secondary:** Android — also supported
- **Distribution:** Local install only
  - iOS: TestFlight or .ipa via EAS Build
  - Android: .apk sideload
- **No App Store:** Personal use, faster iteration

### Architecture
- **Frontend:** React Native + Expo (managed workflow)
- **State:** Zustand for simple state management
- **Services:** Modular service layer (OCR, TTS, Dictionary)

### External APIs
- Google Cloud Vision API (OCR)
- Jisho.org API (Dictionary)
- Google Cloud TTS or Expo Speech (Pronunciation)

### Key Components
1. CameraScreen - Live capture with region selection
2. UploadScreen - Gallery picker + preview
3. ResultsScreen - Interactive character display
4. CharacterCard - Tappable character with info
5. DetailPanel - Bottom sheet with full character details

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OCR accuracy on handwritten/stylized text | Start with printed text, iterate |
| API costs | Cache aggressively, use free tiers |
| TTS quality | Fall back to native TTS if needed |
| Complex word segmentation | Use established libraries (TinySegmenter) |

## Success Criteria

- [ ] App builds and runs on iOS/Android
- [ ] Camera capture works with permission flow
- [ ] Image upload works from gallery
- [ ] OCR correctly identifies Japanese text
- [ ] Dictionary returns readings for common Kanji
- [ ] TTS pronounces Japanese correctly
- [ ] Results screen displays interactive characters
- [ ] Full flow: capture → OCR → display → pronounce works end-to-end

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Project setup | 1 day |
| Camera/Upload | 2 days |
| OCR integration | 1 day |
| Dictionary service | 1 day |
| TTS service | 1 day |
| Results UI | 2 days |
| Integration & polish | 2 days |
| **Total** | ~10 days |

## Approval

- [ ] Product approved by: Avinash
- [ ] Technical approach reviewed
- [ ] Ready for implementation
