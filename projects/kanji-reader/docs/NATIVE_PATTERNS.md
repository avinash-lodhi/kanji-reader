# Native Patterns & Best Practices

## React Native Reanimated
*   **Threading:** Reanimated runs on the UI thread. You cannot call JS functions (like React state setters or navigation) directly from worklets or callbacks.
    *   ❌ **Wrong:** `withTiming(1, {}, () => onComplete())`
    *   ✅ **Right:** `withTiming(1, {}, () => runOnJS(onComplete)())`
*   **Linting:** Ensure `eslint-plugin-react-native-reanimated` is active.

## React Native Gesture Handler
*   **Root View:** Every app using RNGH must have a `<GestureHandlerRootView style={{ flex: 1 }}>` wrapping the entire application (usually in `App.tsx` or `_layout.tsx`).
    *   *Symptom:* Crashes on touch, or gestures silently failing.
*   **Mocking:** When testing components with gestures, do not just mock the View. Use the library's official testing utilities or verify the *mock* matches the *native requirement* (though this is hard).

## Animation & UX
*   **Durations:**
    *   **UI Transitions:** 200ms - 300ms (Snap, Slide, Fade).
    *   **Instructional/Content:** 1000ms+ (Stroke order, Tutorials).
    *   *Rule:* Never use inline magic numbers for duration. Define them in `src/constants/animation.ts` or similar.

## Native Modules
*   **Error Boundaries:** Native modules can crash the JS thread. Always wrap native-dependent features (Camera, Audio) in `<ErrorBoundary>`.
*   **Initialization:** Services like `Kuromoji` (dictionary) are heavy. Initialize them asynchronously on app launch and handle failure states gracefully (disable features, show toast) rather than crashing.
