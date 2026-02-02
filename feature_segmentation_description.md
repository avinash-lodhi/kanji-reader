# Feature: Improved Word Segmentation

### Problem:
The current app struggles with accurate word segmentation for complex Japanese text. While basic words like '感じ' (to perceive) are handled correctly, conjugated verbs are incorrectly split at morphological boundaries. Examples include:
- '感じた' split into '感じ' and 'た'
- '思い出して' split into '思い出し' and 'て'
- '書こう' split into '書こ' and 'う'

This results in grammatically incorrect and visually fragmented displays, significantly hindering readability and comprehension for Japanese language learners. The core issue is that the current tokenization/segmentation logic treats each morpheme as a separate display unit, which is technically correct but pedagogically unhelpful.

### Proposed Solution:
Implement intelligent post-processing logic that correctly joins verb stems with their auxiliary endings and other morphologically linked units during display. This solution will involve:
1. **Dictionary Lookup Enhancement:** Cross-reference segmented tokens against a dictionary of common verb conjugations and compound forms.
2. **Morphological Analysis Refinement:** Improve the morphological analysis step to recognize when adjacent morphemes should be displayed as a single unit.
3. **Post-OCR Processing:** Apply rules to rejoin incorrectly split conjugated verbs and other grammatical units after initial OCR processing.

The goal is to prioritize readability and grammatical correctness for the learner, even if it means deviating from a strict morpheme-by-morpheme split in the display.

### Acceptance Criteria:
1. **Correct Separation & Linking:** All word components should correctly separate and link together for their proper meanings.
2. **Maintained Context:** Phrases that are split up will maintain their correct pronunciation, meaning, and grammatical context.
3. **Robustness Testing:** The improvement in segmentation can be verified with sets of tests involving various sentence structure inputs to test its robustness. These segmentations must match pre-established dictionaries or have good morphological analysis results (e.g., correct verb stems and auxiliaries joining).
4. **Single-Word Display:** Conjugated Japanese verbs and other morphologically linked units (e.g., verb stems and auxiliary endings) must be displayed as single, correctly formed words (e.g., '感じた' instead of '感じ た').
5. **Readability Priority:** The segmentation should prioritize readability and grammatical correctness for the learner, even if it means deviating from a strict morpheme-by-morpheme split in the display.

### Background & Reasoning (for future self):
Future Rei, this is arguably the most technically challenging enhancement in this epic, but also the most impactful for learning efficacy. Avinash specifically pointed out the '感じた' → '感じ' + 'た' split issue. Remember that Japanese learners, especially beginners, rely heavily on seeing words as cohesive units to build vocabulary and grammar intuition. By fragmenting conjugated verbs, we're inadvertently teaching incorrect word boundaries.

This solution not only mitigates OCR errors but also assists in preserving more accurate and meaningful contextual relevance, thereby improving user experience overall. This feature contributes to the goals of enhancing communication understanding among learners, particularly for those who are studying Japanese language with its complex morphological structures.

### Considerations:
- **Performance:** The post-processing logic must be efficient to avoid noticeable delays in displaying results.
- **Edge Cases:** Japanese has many irregular conjugations and compound forms; a comprehensive rule set or dictionary is needed.
- **Trade-offs:** In some cases, a strict morpheme split might be pedagogically useful (e.g., for advanced learners studying grammar). Consider whether to offer a toggle for "detailed view" in the future.
- **Testing:** A robust test suite with diverse sentence structures is essential to validate segmentation accuracy.

### Contributing to Parent Epic Goals:
This feature directly addresses one of the core user experience issues identified in the "KanjiReader App Enhancements v1.0" epic. By ensuring that displayed text is grammatically correct and readable, we significantly improve the app's pedagogical value and user trust. This is foundational work that makes the OCR and dictionary lookup features truly useful for learners.
