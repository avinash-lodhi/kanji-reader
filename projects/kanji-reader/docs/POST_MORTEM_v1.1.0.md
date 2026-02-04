# Post-Mortem: Kanji Writing Practice (v1.1.0)

## The Incident
Upon release of the Kanji Writing Practice feature, three critical issues were identified:
1.  **Crash on Animation:** App crashed when stroke animation completed.
2.  **Crash on Interaction:** App crashed when touching the drawing canvas.
3.  **Usability:** Animation speed (500ms) was too fast to follow.

## Root Cause Analysis (RCA)

### 1. The Reanimated Threading Crash
*   **What happened:** We called a JavaScript function (`setState` via `onAnimationComplete`) directly from the UI thread within a Reanimated `withTiming` callback. Reanimated executes animations on a separate thread to ensure smoothness, and calling JS without bridging causes an immediate native crash.
*   **Why it was missed:** Our unit tests (Jest) run in a Node.js environment where "threads" don't exist in the same way. The code logically worked in the test harness but failed in the native runtime environment.

### 2. The Gesture Handler Crash
*   **What happened:** `GestureDetector` was used without a `GestureHandlerRootView` at the app root.
*   **Why it was missed:** This is a silent dependency. The compiler doesn't enforce it, and unit tests mocking the library (which we did to make tests pass) bypassed the check entirely. We mocked the *interface* but not the *native requirement*.

### 3. The Usability (Speed) Issue
*   **What happened:** We used a standard UI transition duration (500ms) for an instructional animation.
*   **Why it was missed:** "Magic numbers" in code. We treated the duration as a technical parameter rather than a user experience variable. Automated tests check "does it animate?", not "is it watchable?".

## Preventive Measures

### 1. Tooling (Static Analysis)
While plugins exist (e.g., `eslint-plugin-reanimated`), they are often community-maintained and may lag behind the official library. We will rely on strict **Coding Guidelines** and **Manual Review**.

*   **Action:** Removed plugin installation step. Focus on `docs/NATIVE_PATTERNS.md` as the source of truth.

### 2. Coding Guidelines (The "Native Contract")
We need a reference for the "Gotchas" of our specific tech stack.

*   **Action:** Created `docs/NATIVE_PATTERNS.md` (see below). This file documents non-negotiable boilerplate for our libraries.
    *   *Rule:* All Reanimated callbacks must use `runOnJS`.
    *   *Rule:* All Apps must wrap root in `GestureHandlerRootView`.
    *   *Rule:* Animation durations for "content" (not UI transitions) must be configured via constants, not inline magic numbers.

### 3. Testing Strategy Update
We must acknowledge the gap between Jest (Logic) and Device (Runtime).

*   **New Rule:** For any feature involving **Native Modules** (Camera, Gyro, Reanimated, GestureHandler) or **Complex Interactions**:
    *   Unit tests are *insufficient*.
    *   We must add a **"Smoke Test"** step to the PR description: "Verify on Simulator/Device: [ ] Does it crash on mount? [ ] Does it crash on interaction?"
    *   If we cannot verify (agent limitation), we must explicitly flag "REQUIRES NATIVE TESTING" in the handover.

## Implementation Plan
1.  Add `eslint-plugin-react-native-reanimated` to dev dependencies.
2.  Update `.eslintrc.js`.
3.  Commit `docs/NATIVE_PATTERNS.md`.
