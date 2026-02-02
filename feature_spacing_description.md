# Feature: Spacing Refinement

### Problem:
The current display of pronunciation and in-context text within the KanjiReader app exhibits excessive spacing. This leads to a visually cluttered interface, making it difficult for users to quickly parse information and creating a less aesthetic user experience. Specifically, in the 'Full text with pronunciation' view, there are huge gaps between each morpheme (e.g., 'わたし は なに を し た の か それとも'), making the text appear choppy and unnatural. This hinders readability and the natural flow of Japanese text, especially for learners who rely on clear visual presentation.

### Proposed Solution:
Implement precise CSS/style adjustments to reduce the visual space between text elements. This effort will specifically target pronunciation guides and in-context sentence examples, as well as critically address inter-morpheme spacing. The objective is to create a more compact, natural-flowing, and readable layout without compromising clarity. This may involve fine-tuning `margin`, `padding`, `line-height`, or `letter-spacing` properties in the relevant UI components. Furthermore, consider introducing a 'compact view' toggle option for users who prefer an even more minimal spacing, allowing for personalized display preferences.

### Acceptance Criteria:
1.  **Minimized Spacing:** Spacing between pronunciation and reading must be minimized without detriment to meaning or clarity.
2.  **Layout Consistency:** The overall layout and integrity of the display should not significantly change on screens that show both kanji and pronunciation parts together.
3.  **Elimination of Excessive Spaces:** All excessive spaces, particularly in prominent text components like headers, sidebars, and the main content area, must be eliminated.
4.  **Natural Flow (Default View):** The default display of the full text with pronunciation should exhibit a natural flow with significantly reduced inter-morpheme spacing, effectively avoiding the previously observed excessive visual gaps.
5.  **Compact View Toggle (If Implemented):** If a compact view toggle is introduced, it must function correctly, effectively switching between default and a compact layout where spacing is further minimized.
6.  **Readability:** The changes must enhance overall readability and reduce visual clutter for the user.

### Background, Reasoning, and Considerations (for future self):
Future Rei, remember that this bead is crucial for user satisfaction and learning efficacy. Avinash's feedback directly highlighted the visual fatigue caused by current spacing. Our previous iterations resulted in text that looked more like individual blocks than fluid sentences. The 'compact view' idea stems from the understanding that different learners have different preferences for visual density. By giving users control, we cater to a wider audience. This isn't just about aesthetics; it's about improving cognitive load for learners. Reducing inter-morpheme gaps helps in perceiving words and phrases as cohesive units, which is fundamental to language acquisition. This foundational UI improvement will make subsequent enhancements more impactful. This work is a direct contribution to the parent epic's goal of a polished, user-friendly, and effective learning tool.
