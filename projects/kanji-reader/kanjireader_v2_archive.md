# KanjiReader Version 2 Archive (Post-amp Run)

## 1. Version Description
This document archives the state of KanjiReader after the `amp` run that implemented features from the KanjiReader-dls epic. It captures the progress made and new issues identified, serving as the baseline for the next development iteration.

## 2. Implemented Features (Working as Expected)

### 2.1. Feature: Crop Image Capture to Bounding Box
-   **Description:** Implemented logic to crop captured images to the scan frame before sending to OCR, eliminating noise from surrounding text.
-   **Status:** Working as expected.

### 2.2. Feature: Pronunciation Visibility Toggle
-   **Description:** Implemented an eye icon toggle button to show/hide all pronunciations.
-   **Status:** Working as expected.

## 3. Identified Issues / Areas for Improvement (Not Working as Expected)

### 3.1. Default Visibility of Inline Text
-   **Issue:** The inline pronunciation text is currently **on by default**, but it should be **off by default** to trigger recall.

### 3.2. Pronunciation Alignment
-   **Issue:** The alignment of inline pronunciations still has problems.
    -   **Example 1:** Romaji for "手帳" (てちょう) is incorrectly positioned above "年".
    -   **Example 2:** Romaji for "年" (ねん) is completely missing.

### 3.3. Romaji for Hiragana/Katakana
-   **Issue:** Romaji is currently shown for hiragana and katakana, but the user explicitly stated that this is **not needed** and "seems extra."

### 3.4. "5 年" Extraction (Acknowledged, to be ignored for now)
-   **Issue:** "5 年" was not extracted from the image.
-   **Note:** This is acknowledged by the user, and they are okay with ignoring this for now, suspecting it might be due to vertical text.

## 4. Summary
Version 2 successfully introduced image cropping and a pronunciation toggle. However, key pronunciation display bugs (alignment, missing romaji for hiragana/katakana, default visibility) remain and require attention in the next iteration. The "5 年" extraction issue is noted but de-prioritized.
