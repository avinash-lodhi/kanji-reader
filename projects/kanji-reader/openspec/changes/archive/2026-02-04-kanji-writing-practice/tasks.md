# Tasks: Add Kanji Writing Practice

## 1. Data Layer
- [ ] 1.1 Pre-process KanjiVG data into compressed JSON lookup (build-time script)
- [ ] 1.2 Bundle hiragana + katakana + JLPT N5–N3 kanji stroke data as app asset
- [ ] 1.3 Create stroke data service (`src/services/strokeData.ts`) with tiered loading (bundled → cache → fetch)
- [ ] 1.4 Create practice store (Zustand slice: `PracticeWord[]` + `Record<string, CharacterProgress>`)
- [ ] 1.5 Wire AsyncStorage persistence for practice store

## 2. Learn Mode
- [ ] 2.1 Create StrokeGuide component (renders strokes one at a time using SVG paths)
- [ ] 2.2 Add stroke animation (draw-on effect for each stroke)
- [ ] 2.3 Add playback controls (next, previous, replay all, auto-play)
- [ ] 2.4 Show stroke number overlay per stroke

## 3. Practice Mode
- [ ] 3.1 Create DrawingCanvas component (gesture-handler touch input → SVG polylines)
- [ ] 3.2 Implement stroke validation logic (start region, direction, end region, path similarity)
- [ ] 3.3 Add real-time visual feedback (green = correct, red = wrong)
- [ ] 3.4 Handle stroke lifecycle (validate on stroke end → advance or prompt retry)
- [ ] 3.5 Add "clear canvas" action for retrying

## 4. Progressive Hint System
- [ ] 4.1 Create HintButton component with progressive reveal levels
- [ ] 4.2 Hint Level 1: Show stroke count
- [ ] 4.3 Hint Level 2: Show first stroke as ghost overlay
- [ ] 4.4 Hint Level 3: Prompt switch to Learn Mode
- [ ] 4.5 Track hint usage in CharacterProgress (for future SRS weighting)

## 5. Writing Practice Screen
- [ ] 5.1 Create WritingPracticeScreen with Learn/Practice toggle
- [ ] 5.2 Display character info header (character, type, reading, meaning)
- [ ] 5.3 Accept `characters: string[]` param (v1: single element; future: sequential)
- [ ] 5.4 Wire navigation from word popup → WritingPracticeScreen
- [ ] 5.5 Add "Add to Practice List" action

## 6. Practice Word List
- [ ] 6.1 Create PracticeListScreen (displays saved words grouped by type: kanji/hiragana/katakana)
- [ ] 6.2 Add navigation from list item → WritingPracticeScreen
- [ ] 6.3 Add delete/manage functionality (swipe to delete or edit mode)
- [ ] 6.4 Add entry point from main app navigation (tab or menu item)

## 7. Character Support
- [ ] 7.1 Detect character type (kanji/hiragana/katakana) from unicode range
- [ ] 7.2 Ensure stroke data service handles all three types
- [ ] 7.3 Handle edge cases: kanji not in KanjiVG → graceful "data unavailable" state

## 8. Integration
- [ ] 8.1 Add practice icon to existing word popup component
- [ ] 8.2 Update React Navigation config with new screens
- [ ] 8.3 Update CharacterProgress on each practice attempt (attempts, successes, lastPracticed)

## 9. Testing
- [ ] 9.1 Unit tests: stroke validation logic (correct, wrong direction, wrong order)
- [ ] 9.2 Unit tests: practice store (add word, update progress, persistence)
- [ ] 9.3 Unit tests: character type detection
- [ ] 9.4 Component tests: DrawingCanvas (touch → path rendering)
- [ ] 9.5 Integration test: popup → practice screen → save word → practice list flow
