# KanjiReader v1.1.0 Archive — Writing Practice (Post-Crash-Fix)

## 1. Version Description

v1.1.0 introduced the **Kanji Writing Practice** feature — the first major feature addition after the stable v1.0.0 OCR core. Users can practice writing kanji, hiragana, and katakana with progressive hints, learn mode with animated stroke guides, and a practice list for saving words.

This archive captures the state **after** fixing the critical touch-crash bug but **before** fixing the four UX/logic issues discovered during real-device testing.

## 2. What Shipped (Working)

### 2.1 Writing Practice Screen
- Navigate to practice from scan results (word popup) or practice list
- Learn/Practice mode toggle
- Character info header with reading + meaning
- Multi-character navigation (arrows to move between chars in a word)

### 2.2 Learn Mode
- StrokeGuide renders strokes progressively using KanjiVG SVG paths
- Animated stroke drawing effect (AnimatedStroke with Reanimated)
- Playback controls: prev/next/replay/auto-play
- Stroke numbers displayed at midpoints

### 2.3 Practice Mode
- DrawingCanvas with PanResponder touch input
- Geometric stroke validation (start point, direction, end point, shape)
- Per-stroke feedback (correct/incorrect with haptics)
- Completion detection and celebration

### 2.4 Hint System
- 3-level progressive hints: stroke count → ghost first stroke → switch to learn mode
- Hint usage tracking (marks session as "hint-assisted")

### 2.5 Practice List & Persistence
- Auto-save words when entering practice
- Zustand store persisted via AsyncStorage
- Character progress tracking (attempts, successes, hints used)
- SRS-ready schema (nullable interval/easeFactor/nextReview fields)

### 2.6 Stroke Data Pipeline
- Tiered loading: bundled tier1/tier2 → AsyncStorage cache → remote KanjiVG fetch
- SVG path parsing from raw KanjiVG files
- Character type detection (kanji/hiragana/katakana)

## 3. Critical Bug Fixed

### 3.1 Touch Crash (KanjiReader-8f3)
- **Symptom:** App closed immediately on touching the drawing canvas. No JS errors in Expo terminal.
- **Root Causes:**
  1. **Nested `GestureHandlerRootView`** — `App.tsx` had one at root, `WritingPracticeScreen` added a second. On Android with New Architecture (Fabric), this caused a native crash.
  2. **RNGH `Gesture.Pan()` incompatibility** — With New Architecture + Reanimated 4.x + RNGH 2.28, the gesture handler caused silent native crashes on touch.
- **Fix:** Removed nested `GestureHandlerRootView`, replaced RNGH `Gesture.Pan()` with React Native's built-in `PanResponder`.
- **Lesson:** Can't test native crashes from server — need device/emulator access or `adb logcat`. Don't claim "fixed" without testing.

## 4. Known Issues (Open — To Fix in v1.2.0)

### 4.1 Practice Mode: Stuck After First Stroke
- **Symptom:** Can draw the first stroke, but can't progress to stroke 2+.
- **Root Cause:** `usePracticeSession.handleStrokeComplete` has stale closure issues — `useCallback` dependencies include `state.currentStrokeIndex` and `state.practiceState`, but the `expectedStroke` memo and callback closure don't reliably update between the state transition and the next user interaction. Additionally, stroke validation may be too strict for subsequent strokes (0.25 startTolerance = 25% of canvas).

### 4.2 Hints Only Show First Stroke
- **Symptom:** "More help" hint at level 2 always shows stroke 1's ghost, even when user is on stroke 2+.
- **Root Cause:** `HintOverlay` at level 2 renders `strokeData.strokes[0]` — hardcoded index, not current stroke index.

### 4.3 Learn Mode: First Stroke Invisible
- **Symptom:** When entering learn mode, the first stroke doesn't animate — it appears as a static (potentially hard-to-see) path.
- **Root Cause:** `StrokeGuide` animation triggers on `currentStroke > prevCurrentStroke`. On initial render both are 0, so no animation fires. The static stroke renders in `colors.primary` but without the drawing animation, users don't register it.

### 4.4 Auto-Play Too Fast
- **Symptom:** Subsequent strokes in auto-play appear almost instantly (300ms gap, no animation wait).
- **Root Cause:** `PlaybackControls` checks `!isAnimating` before firing next stroke, but `isAnimating` is never set to `true` on the parent — `WritingPracticeScreen` only has `setIsAnimating(false)` in `onStrokeAnimationComplete`. The state is never toggled on, so auto-play thinks animation is always done.

### 4.5 Vertical Strokes Cause Page Scroll
- **Symptom:** Drawing vertical strokes on the canvas causes the ScrollView to scroll instead.
- **Root Cause:** `DrawingCanvas` is inside a `ScrollView`. The `PanResponder` has `onPanResponderTerminationRequest: () => false`, but `ScrollView` can capture the initial vertical pan before the responder is granted. Need to either disable scrolling during canvas interaction or use capture-phase responders.

## 5. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| PanResponder over RNGH | RNGH Gesture.Pan() crashed on Fabric + Reanimated 4.x. PanResponder is core RN, no native module dependency for touch. |
| Geometric validation over ML | Deterministic, offline, zero latency. No model to ship or update. |
| Zustand + AsyncStorage | Lightweight persistence, SRS-ready schema from day one. |
| Tiered stroke data loading | Bundled common chars for offline, lazy-load rare ones from KanjiVG CDN. |

## 6. Tech Stack

- React Native 0.81.5
- Expo SDK 54 (New Architecture / Fabric enabled)
- react-native-reanimated 4.1.6
- react-native-gesture-handler 2.28.0 (still in deps, used elsewhere)
- react-native-svg 15.15.2
- zustand (state management + persistence)

## 7. Retro

### What went well
- Writing practice feature shipped end-to-end: learn mode, practice mode, hints, persistence, stroke data pipeline
- OpenSpec proposal + 35 beads gave excellent structure for implementation
- SRS-ready schema means no future migrations when we add spaced repetition

### What went wrong
- **Pushed "fixes" twice without testing on a real device.** Both times said "fixed" based on code analysis alone. The crash was a native issue that no amount of code reading could verify.
- **Stale closure patterns everywhere.** `useCallback` with state dependencies is a footgun in React — the writing practice code is riddled with it. Should have used `useRef` for state accessed in callbacks from the start.
- **No Android/iOS testing infra on the server.** Can't run emulators, no adb access. Need to establish a testing workflow (either set up Android SDK or always test through Avinash's device).

### Lessons learned
1. **Never claim a bug is fixed without testing it.** Code review is hypothesis; testing is proof.
2. **PanResponder > RNGH for simple drawing surfaces** on Fabric/New Arch setups.
3. **`isAnimating` state must be a two-way toggle** — setting it to false on completion is useless if nobody sets it to true on start.
4. **Hint overlays must track the current stroke index**, not hardcode `strokes[0]`.
5. **ScrollView + drawing canvas = gesture conflict.** Must handle at the responder level, not hope PanResponder wins the race.
