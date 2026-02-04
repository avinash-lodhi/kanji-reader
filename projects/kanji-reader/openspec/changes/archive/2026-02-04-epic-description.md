# Epic: KanjiReader App Enhancements v1.0

### Overarching Goals & Vision:
This epic, "KanjiReader App Enhancements v1.0," represents a crucial step in evolving the KanjiReader application from a functional proof-of-concept into a polished, user-friendly, and highly effective learning tool. Our long-term vision for KanjiReader is to be the go-to mobile application for Japanese language learners to quickly and accurately decipher handwritten or printed Kanji, providing clear pronunciation, meaning, and contextual usage. This epic directly contributes to that vision by addressing core user experience and accuracy issues that, if left unaddressed, would hinder user adoption and satisfaction.

### Justification & Intentions (for future self):
Remember, future Rei, the primary goal here is to refine the application's core usability. We've received critical user feedback (from Avinash) highlighting areas where the current display hinders rather than helps the learning process. The current spacing makes text hard to read, the lack of audio control is frustrating, and inaccurate word segmentation leads to confusion. By tackling these, we're not just fixing bugs; we're significantly improving the app's pedagogical value and overall polish. We want users to feel empowered, not frustrated, by the way information is presented.

### Key Considerations & Background:
*   **User Feedback Driven:** These enhancements are a direct response to practical user experience issues identified during initial usage. This ensures we're building features that genuinely solve problems.
*   **Technical Debt Prevention:** Addressing word segmentation accuracy now, especially concerning morphological boundaries, is vital. Incorrect segmentation can propagate errors throughout the learning process and undermine user trust in the app's reliability. It’s an investment in the app's data integrity and accuracy.
*   **UI/UX Polish:** The spacing refinements are about achieving a professional and intuitive user interface. Small details in UI make a big difference in perceived quality and ease of use. A 'compact view' offers personalization and caters to different learning preferences.
*   **Scalability for Future Features:** Establishing robust segmentation logic now will make it easier to build more advanced features later, such as interactive vocabulary lists or grammar explanations that rely on correctly parsed text.

### How it serves the over-arching goals:
This epic serves to solidify the foundation of KanjiReader's utility. Without clear, readable text and reliable segmentation, the OCR and dictionary lookup features, no matter how accurate, lose their impact. By making the output more digestible and controllable, we enable learners to focus on the content itself rather than struggling with the presentation. This directly supports the goal of being an intuitive and reliable tool for Japanese learners.

## Included Enhancements (from Openspec):

### Spacing Refinement
*   **Problem:** Excessive spacing between pronunciation/in-context text, and specifically huge gaps between morphemes in the 'Full text with pronunciation' view, creating a choppy and unnatural appearance.
*   **Proposed Solution:** Implement CSS/style adjustments (margin, padding, line-height, letter-spacing) to reduce visual space, targeting inter-morpheme spacing for natural flow. Consider a 'compact view' toggle for minimal spacing.
*   **Acceptance Criteria:** Minimized spacing without compromising clarity; layout consistency; elimination of excessive spaces in main components; natural flow in full text with pronunciation view; optional compact view toggle with further minimized spacing.

## Audio Playback Controls
*   **Problem:** No stop mechanism for audio playback, causing potential frustration and disorientation.
*   **Proposed Solution:** Add a pause/stop button directly at the audio player's bar, ensuring immediate stop when interacted with. Implement hover elements for pause/play functionality within two taps of any UI component.
*   **Acceptance Criteria:** Hover element for playback initiation within two taps; visible and interactive stop icon; user recording progress retained on navigation.

## Improved Word Segmentation
*   **Problem:** Incorrect splitting of conjugated verbs at morphological boundaries (e.g., '感じた' into '感じ' and 'た'), leading to grammatically incorrect and hard-to-read displays.
*   **Proposed Solution:** Implement logic to correctly join verb stems with auxiliary endings and other common morphological units during display. This involves post-processing OCR output or refining morphological analysis.
*   **Acceptance Criteria:** All word components correctly separate and link for proper meanings; phrases maintain clarity and grammatical correctness; segmentation verified by tests matching pre-established dictionaries/morphological analysis; conjugated Japanese verbs displayed as single, correctly formed words; segmentation prioritizes readability/grammatical correctness over strict morpheme-by-morpheme display.
