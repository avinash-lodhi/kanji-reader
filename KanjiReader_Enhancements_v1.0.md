# KanjiReader App Enhancements v1.0

### Introduction:
This openspec outlines proposed enhancements for the KanjiReader application, focusing on improving user experience through refined UI spacing, better audio playback control, and more accurate word segmentation. These changes aim to make the application more intuitive and reliable for Japanese language learners.

## Spacing Refinement

### Problem:
The current display of pronunciation and in-context text within the KanjiReader app exhibits excessive spacing. This leads to a visually cluttered interface, making it difficult for users to quickly parse information and creating a less aesthetic user experience. For example, the spacing around the `(soretomo)` in the screenshot provided is larger than necessary, visually distancing it from the `それとも` it describes. Furthermore, the 'Full text with pronunciation' view shows huge gaps between each morpheme (e.g., 'わたし は なに を し た の か それとも'), making the text appear choppy and unnatural.

### Proposed Solution:
Implement CSS/style adjustments to reduce the visual space between text elements, specifically targeting pronunciation guides and in-context sentence examples, as well as inter-morpheme spacing. The goal is to create a more compact and readable layout with a natural flow, without compromising clarity. This may involve adjusting `margin`, `padding`, `line-height`, or `letter-spacing` properties in the relevant UI components to subtly tighten these spaces for smoother readability. This enhancement will require careful consideration with the existing text structure and spacing. Consider introducing a 'compact view' toggle for users who prefer minimal spacing.

### Acceptance Criteria:
1. Spacing between pronunciation and reading needs to be minimised without compromising meaning or clarity.
2. The layout should not change significantly on screens that display both parts (pronunciation and kanji) together.
3. Excessive spaces must be eliminated for the most important text components including header, sidebar, and content area.
4. The default display of the full text with pronunciation should exhibit a natural flow with reduced inter-morpheme spacing, avoiding excessive visual gaps.
5. If implemented: A toggle option should be available to switch between default and compact views, where the compact view further minimizes spacing.

## Audio Playback Control
Audio playback has no stop mechanism once it starts playing. This could cause confusion or frustration for users who need to have control over their experience. An enhancement can include adding a pause/stop button directly at the audio player's bar, ensuring an immediate stop when interacted with. 

### Acceptance Criteria:
1. A hover element must be present within two taps of any UI component to initiate playback.
2. The stop icon should effectively indicate that audio is playing and can be paused or stopped immediately on tap.
3. Users' recording progress shall not lose when they navigate away from the page, ensuring continuity throughout their learning experience.

## Improved Word Segmentation
While the app manages to break down basic words like '感じ' (to perceive) into its component parts, it fails to handle more complex cases accurately. This could lead inaccuracies in pronunciation/meaning display resulting from incorrect segmentation of phrases or compounds. For example, conjugated verbs are incorrectly splitting at morphological boundaries, such as '感じた' into '感じ' and 'た', '思い出し て' into '思い出し' and 'て', and '書こ う' into '書こ' and 'う'. This leads to grammatically incorrect and hard-to-read displays. To tackle this problem, a solution can be developed that considers dictionary lookup or morphological analysis post-processing the OCR output.

### Acceptance Criteria:
1. All word components should correctly separate and link together for their proper meanings.
2. Phrases that are split up will maintain their correct pronunciation, meaning, and grammatical context.
3. The improvement in segmentation can be verified with sets of tests involving various sentence structure inputs to test its robustness. These segmentations must match our pre-established dictionaries or have good morphological analysis results (e.g., correct verb stems and auxiliaries joining).
4. Conjugated Japanese verbs and other morphologically linked units (e.g., verb stems and auxiliary endings) must be displayed as single, correctly formed words (e.g., '感じた' instead of '感じ た').
5. The segmentation should prioritize readability and grammatical correctness for the learner, even if it means deviating from a strict morpheme-by-morpheme split in the display.
