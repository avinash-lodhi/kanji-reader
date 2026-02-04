# Tasks: Writing Practice UX Fixes

## Execution Order

Dependencies form a natural execution order. Fixes 1-4 are independent of each other at the feature level, but within each fix there are sequential dependencies.

```
Epic: Writing Practice UX Fixes (v1.2.0)
├── Feature 1: Multi-Stroke Practice Progression
│   ├── Task 1.1: Refactor usePracticeSession to ref-based callbacks
│   ├── Task 1.2: Add dev-only validation logging
│   ├── Task 1.3: Tune validation thresholds (if needed after 1.2)
│   └── Task 1.4: Device verification — multi-stroke kanji
├── Feature 2: Hint Overlay Current Stroke
│   ├── Task 2.1: Add currentStrokeIndex prop to HintOverlay
│   ├── Task 2.2: Wire currentStrokeIndex from WritingPracticeScreen
│   └── Task 2.3: Device verification — hint on stroke 3+
├── Feature 3: Learn Mode Animation Fixes
│   ├── Task 3.1: Animate first stroke on mount in StrokeGuide
│   ├── Task 3.2: Wire isAnimating two-way (start + complete)
│   ├── Task 3.3: Verify auto-play pacing respects animation
│   └── Task 3.4: Device verification — learn mode + auto-play
├── Feature 4: Vertical Stroke Scroll Fix
│   ├── Task 4.1: Add capture-phase responders to DrawingCanvas
│   ├── Task 4.2: Add onDrawingStateChange callback
│   ├── Task 4.3: Disable ScrollView during canvas touch
│   └── Task 4.4: Device verification — vertical strokes
└── Task 5: Final Integration Verification
    └── Full flow test on device: scan → practice → all strokes → hints → learn mode → vertical strokes
```

## Acceptance Criteria (Epic-level)

1. User can complete all strokes of a 5+ stroke kanji in practice mode
2. Hints show ghost for the current stroke being attempted, not always stroke 1
3. Learn mode animates the first stroke on entry, auto-play plays at animation speed
4. Vertical strokes can be drawn without page scrolling
5. All fixes verified on a real Android device
