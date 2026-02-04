# Design: Writing Practice UX Fixes

## Architecture Context

The writing practice feature has three layers:
1. **Screen layer** — `WritingPracticeScreen.tsx` orchestrates modes, state, navigation
2. **Component layer** — `DrawingCanvas`, `StrokeGuide`, `HintOverlay`, `PlaybackControls`, `StrokeFeedback`, `AnimatedStroke`
3. **Logic layer** — `usePracticeSession` hook, `strokeValidation` utility, `practiceStore`

All four fixes stay within existing architecture. No new components, hooks, or services needed.

---

## Fix 1: Multi-Stroke Practice Progression

### Current Flow (Broken)
```
User draws stroke 1
→ onStrokeComplete(points) called
→ handleStrokeComplete validates against expectedStroke (stroke 0) ✓
→ setState: currentStrokeIndex = 1, practiceState = 'feedback_correct'
→ 200ms timeout → practiceState = 'idle'
→ User draws stroke 2
→ handleStrokeComplete called — but useCallback closure may still reference old expectedStroke
→ Even if expectedStroke updates, validation startTolerance (0.25) may reject valid strokes
```

### Fix Design
**A. Eliminate stale closures in usePracticeSession:**
- Replace `useCallback` with a stable callback that reads current state from a ref
- Pattern: `const stateRef = useRef(state); stateRef.current = state;`
- The callback function itself stays stable (no dependency array churn)
- `expectedStroke` computation stays as `useMemo` but the callback reads `stateRef.current.currentStrokeIndex` to pick the right stroke

**B. Tune stroke validation thresholds:**
- Current: `startTolerance: 0.25` (25% of canvas = ~75px on a 300px canvas)
- This is actually generous for stroke 1 but may compound with coordinate normalization issues
- Add logging (dev-only) to see what validation scores strokes are getting
- If validation itself is fine, the issue is purely the stale closure

### Files Changed
- `src/hooks/usePracticeSession.ts` — ref-based callback pattern
- `src/utils/strokeValidation.ts` — potential threshold tuning (TBD after testing)

---

## Fix 2: Hint Overlay Tracks Current Stroke

### Current (Broken)
```tsx
// HintOverlay.tsx line ~45
{hintLevel >= 2 && strokeData.strokes.length > 0 && (
  <GhostStrokeHint stroke={strokeData.strokes[0]} size={size} />  // Always stroke 0!
)}
```

### Fix Design
- Add `currentStrokeIndex` prop to `HintOverlay`
- Use `strokeData.strokes[currentStrokeIndex]` instead of `strokes[0]`
- Bounds check: if `currentStrokeIndex >= strokes.length`, don't render ghost
- In `WritingPracticeScreen`, pass `practiceSession.currentStrokeIndex` to `HintOverlay`
- Level 1 hint (stroke count) should also show "Stroke X of Y" context, not just total count

### Files Changed
- `src/components/writing/HintOverlay.tsx` — new prop, dynamic stroke index
- `src/screens/WritingPracticeScreen.tsx` — pass currentStrokeIndex

---

## Fix 3: Learn Mode First Stroke & Animation Timing

### Current (Broken)
Two sub-issues:

**A. First stroke never animates:**
```tsx
// StrokeGuide.tsx
useEffect(() => {
  if (animated && currentStroke > prevCurrentStroke && currentStroke >= 0) {
    setAnimatingStroke(currentStroke);  // Never fires when both are 0
  }
  setPrevCurrentStroke(currentStroke);
}, [currentStroke, animated, prevCurrentStroke]);
```

**B. isAnimating never becomes true:**
```tsx
// WritingPracticeScreen.tsx
const [isAnimating, setIsAnimating] = useState(false);
// ...
<StrokeGuide
  onStrokeAnimationComplete={() => setIsAnimating(false)}  // Only ever sets false
/>
```
Nobody calls `setIsAnimating(true)`, so `PlaybackControls` always thinks animation is done → 300ms gaps.

### Fix Design

**A. Animate first stroke on mount:**
- Add an `initialAnimate` flag: when `currentStroke === 0` and `animated === true`, trigger animation on first render
- Use a `hasAnimatedFirst` ref to prevent re-triggering
- Alternative (simpler): change condition to `currentStroke >= prevCurrentStroke` on first render only

**B. Wire isAnimating properly:**
- `StrokeGuide` needs an `onStrokeAnimationStart` callback (or rename to `onAnimatingChange(boolean)`)
- When a new stroke starts animating → call `onAnimatingChange(true)`
- When animation completes → call `onAnimatingChange(false)`
- `WritingPracticeScreen` passes this to both `StrokeGuide` and `PlaybackControls`
- `PlaybackControls` auto-play waits for `isAnimating === false` before advancing (already does this, just needs real data)

### Files Changed
- `src/components/writing/StrokeGuide.tsx` — first-stroke animation trigger, onAnimatingChange callback
- `src/screens/WritingPracticeScreen.tsx` — wire isAnimating two-way
- `src/components/writing/PlaybackControls.tsx` — no changes needed (already checks isAnimating)

---

## Fix 4: Vertical Stroke Scroll Conflict

### Current (Broken)
```tsx
// WritingPracticeScreen.tsx
<ScrollView style={styles.scrollView} ...>
  ...
  <DrawingCanvas ... />  // PanResponder inside ScrollView
  ...
</ScrollView>
```
`ScrollView` intercepts vertical pans before `PanResponder` gets a chance. `onPanResponderTerminationRequest: () => false` only prevents termination *after* the responder is granted, but doesn't help if ScrollView captures the gesture first.

### Fix Design

**A. Capture-phase responder:**
- Add `onStartShouldSetPanResponderCapture: () => !disabled` — this fires in the *capture* phase, before ScrollView gets the event
- Add `onMoveShouldSetPanResponderCapture: () => !disabled` — same for moves

**B. Disable ScrollView during drawing:**
- `DrawingCanvas` takes an `onDrawingStateChange(isDrawing: boolean)` callback
- On `PanResponderGrant` → `onDrawingStateChange(true)`
- On `PanResponderRelease/Terminate` → `onDrawingStateChange(false)`
- `WritingPracticeScreen` uses this to set `scrollEnabled={!isDrawing}` on the `ScrollView`
- Belt-and-suspenders: capture phase + scroll disable = reliable vertical strokes

### Files Changed
- `src/components/writing/DrawingCanvas.tsx` — capture phase handlers, onDrawingStateChange callback
- `src/screens/WritingPracticeScreen.tsx` — scrollEnabled state, wire callback

---

## Testing Strategy

**Every fix must be verified on a real device.** Server-side code review is hypothesis, not proof.

Per-fix verification:
1. **Multi-stroke:** Practice a 5+ stroke kanji (e.g., 漢). All strokes should validate and progress.
2. **Hints:** On stroke 3, tap hint twice. Ghost should show stroke 3, not stroke 1.
3. **Learn mode:** Enter learn mode. First stroke should animate on load. Auto-play should show each stroke with full animation.
4. **Vertical strokes:** Draw 一 (horizontal) and 丨 (vertical). Neither should cause page scroll.
