# Kanji Reader Capability

## ADDED Requirements

### Requirement: Camera Capture SHALL enable text scanning
The app SHALL allow users to capture images of Japanese text using the device camera with full-image capture.

#### Scenario: User captures Japanese text
Given the user has granted camera permissions
When the user opens the camera screen and taps the capture button
Then a full photo is taken and sent to OCR for text detection

#### Scenario: User uses guide frame
Given the user is viewing the camera preview with guide frame visible
When the user aligns text within the guide frame and captures
Then the full image is processed and OCR finds the text automatically

---

### Requirement: Image Upload SHALL support gallery import
The app SHALL allow users to upload images from their device gallery for OCR processing.

#### Scenario: User uploads screenshot
Given the user has images in their gallery
When the user taps upload and selects an image
Then the image is loaded and sent for OCR processing

#### Scenario: User crops uploaded image
Given the user has selected an image
When the user chooses to crop the image
Then a crop interface is shown and the cropped result is used

---

### Requirement: Japanese OCR SHALL recognize all character types
The app SHALL recognize Japanese text including Kanji, Hiragana, and Katakana from images.

#### Scenario: OCR processes image with Japanese text
Given an image containing Japanese text
When the OCR service processes the image
Then the Japanese characters are extracted with their positions

#### Scenario: OCR identifies character types
Given extracted Japanese text
When the text is processed
Then each character is classified as kanji, hiragana, katakana, or other

---

### Requirement: Dictionary Lookup SHALL provide readings and meanings
The app SHALL provide hiragana readings, romaji, and English meanings for Japanese characters and words.

#### Scenario: User looks up a kanji
Given a recognized kanji character
When the dictionary service is queried
Then the reading (hiragana), romaji, and English meaning are returned

#### Scenario: User looks up a word
Given a recognized multi-character word
When the dictionary service is queried
Then the word reading and meanings are returned

---

### Requirement: TTS Pronunciation SHALL speak Japanese correctly
The app SHALL pronounce Japanese text aloud using text-to-speech when a character is tapped.

#### Scenario: User taps character to hear pronunciation
Given a recognized Japanese character or word
When the user taps on it
Then the correct Japanese pronunciation is played aloud

#### Scenario: User adjusts speech speed
Given the TTS service is available
When the user changes the speed setting
Then subsequent pronunciations use the new speed

---

### Requirement: Results Display SHALL show full text and interactive words
The app SHALL display the complete scanned text plus segmented words as tappable cards for learning.

#### Scenario: User views scan results
Given OCR and word segmentation have completed
When the results screen is shown
Then the user sees: scanned image preview, full extracted text, and tappable word cards

#### Scenario: User selects a word
Given the results are displayed with word cards
When the user taps a word card
Then the pronunciation plays and a detail panel shows reading and meaning

#### Scenario: User views word details
Given a word is selected
When the detail panel is shown
Then it displays: word, hiragana reading, romaji, English meanings, and JLPT level if available
