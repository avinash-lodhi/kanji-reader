## ADDED Requirements

### Requirement: Writing Practice Entry Point
The system SHALL provide a practice writing icon in the word detail popup. When tapped, the system SHALL navigate to the Writing Practice Screen for the selected character.

#### Scenario: User initiates writing practice from word popup
- **WHEN** user taps the practice writing icon on a word popup
- **THEN** the system navigates to the Writing Practice Screen
- **AND** the selected character, its type (kanji/hiragana/katakana), reading, and meaning are passed to the screen

---

### Requirement: Character Type Support
The system SHALL support writing practice for all three Japanese writing systems: kanji, hiragana, and katakana. The system SHALL detect the character type automatically based on Unicode range.

#### Scenario: Kanji character detected
- **WHEN** a character in the CJK Unified Ideographs range (U+4E00–U+9FFF) is selected for practice
- **THEN** the system classifies it as kanji and loads kanji stroke data

#### Scenario: Hiragana character detected
- **WHEN** a character in the Hiragana range (U+3040–U+309F) is selected for practice
- **THEN** the system classifies it as hiragana and loads hiragana stroke data

#### Scenario: Katakana character detected
- **WHEN** a character in the Katakana range (U+30A0–U+30FF) is selected for practice
- **THEN** the system classifies it as katakana and loads katakana stroke data

---

### Requirement: Learn Mode — Stroke-by-Stroke Guide
The system SHALL provide a Learn Mode that displays an animated stroke-by-stroke guide for the selected character. Each stroke SHALL be rendered sequentially with its stroke number visible.

#### Scenario: User views stroke guide
- **WHEN** the Writing Practice Screen loads in Learn Mode
- **THEN** the system displays the character with strokes rendered one at a time
- **AND** each stroke shows its order number

#### Scenario: User controls stroke playback
- **WHEN** user interacts with playback controls
- **THEN** the system allows advancing to next stroke, going to previous stroke, replaying all strokes, or auto-playing the full sequence

---

### Requirement: Practice Mode — Stroke Tracking and Validation
The system SHALL provide a Practice Mode with a drawing canvas that tracks user-drawn strokes. The system SHALL validate each stroke against the reference stroke data for correct order and approximate direction/path. The drawing canvas SHALL present a blank surface by default — no stroke counts or guides shown unless hints are used.

#### Scenario: User draws a correct stroke
- **WHEN** user draws a stroke that matches the expected next stroke (within tolerance for start position, direction, and end position)
- **THEN** the system marks the stroke as correct (green visual feedback)
- **AND** advances to the next expected stroke

#### Scenario: User draws an incorrect stroke
- **WHEN** user draws a stroke that does not match the expected next stroke
- **THEN** the system marks the stroke as incorrect (red visual feedback)
- **AND** clears the incorrect stroke and prompts the user to retry

#### Scenario: User completes all strokes
- **WHEN** user successfully draws all strokes in the correct order
- **THEN** the system displays a completion indicator
- **AND** updates the character's progress record (attempts +1, successes +1)

#### Scenario: Practice canvas is blank by default
- **WHEN** Practice Mode is activated
- **THEN** the canvas shows only the target character for reference (small, in corner) and a blank drawing area
- **AND** no stroke count, stroke guides, or hints are visible until user requests them

---

### Requirement: Progressive Hint System
The system SHALL provide a progressive hint system during Practice Mode. Hints are user-initiated (not automatic) and reveal information in escalating levels to support memory recall before providing full guidance.

#### Scenario: User requests first hint (stroke count)
- **WHEN** user taps the hint button for the first time on a character
- **THEN** the system displays the total stroke count for the character

#### Scenario: User requests second hint (first stroke)
- **WHEN** user taps the hint button a second time on the same character
- **THEN** the system displays the first stroke as a ghost overlay on the canvas

#### Scenario: User requests third hint (learn mode prompt)
- **WHEN** user taps the hint button a third time on the same character
- **THEN** the system prompts the user to switch to Learn Mode for the full stroke guide

#### Scenario: Hint usage is tracked
- **WHEN** user uses any hint during practice
- **THEN** the system records hint usage for that character's progress data

---

### Requirement: Learn/Practice Mode Toggle
The system SHALL provide a toggle between Learn Mode and Practice Mode. The two modes MUST be mutually exclusive — only one is visible at a time.

#### Scenario: User switches from Learn to Practice
- **WHEN** user activates the Practice toggle
- **THEN** Learn Mode is hidden and Practice Mode (blank drawing canvas) is displayed

#### Scenario: User switches from Practice to Learn
- **WHEN** user activates the Learn toggle
- **THEN** Practice Mode is hidden and Learn Mode (stroke guide) is displayed
- **AND** any in-progress practice drawing is cleared

---

### Requirement: Practice Word List — Persistent Storage
The system SHALL allow users to save words to a persistent practice list. The list SHALL survive app restarts. Users SHALL access the practice list from the main navigation without needing to scan text.

#### Scenario: User adds a word to practice list
- **WHEN** user taps "Add to Practice List" on the Writing Practice Screen
- **THEN** the word (characters, reading, meaning, source) is saved to persistent storage
- **AND** a confirmation is shown

#### Scenario: User views practice list
- **WHEN** user navigates to the Practice List Screen
- **THEN** the system displays all saved practice words
- **AND** words are organized showing kanji, reading, and meaning

#### Scenario: User starts practice from list
- **WHEN** user taps a word in the Practice List
- **THEN** the system navigates to the Writing Practice Screen for that word

#### Scenario: User removes a word from practice list
- **WHEN** user deletes a word from the Practice List
- **THEN** the word is removed from persistent storage

---

### Requirement: Per-Character Progress Tracking
The system SHALL track practice progress per character (not per word). Progress data SHALL include attempt count, success count, last practiced timestamp, and hint usage. The schema SHALL include nullable fields for future spaced-repetition scheduling.

#### Scenario: Progress updated after successful practice
- **WHEN** user completes writing a character correctly
- **THEN** the system increments attempts and successes, and updates lastPracticed

#### Scenario: Progress updated after failed practice
- **WHEN** user abandons or fails a character practice
- **THEN** the system increments attempts (but not successes)

#### Scenario: Character appears in multiple words
- **WHEN** the same character exists in multiple practice words
- **THEN** progress is shared — practicing "食" in "食べる" also updates progress for "食" in "食事"

---

### Requirement: Stroke Data Availability
The system SHALL bundle stroke data for hiragana (46), katakana (46), and common kanji (JLPT N5–N3, ~1,000 characters). For kanji not in the bundled set, the system SHALL fetch and cache stroke data on demand. If stroke data is unavailable, the system SHALL gracefully disable practice for that character.

#### Scenario: Bundled character stroke data loaded
- **WHEN** user selects a character that exists in the bundled dataset
- **THEN** stroke data loads immediately with no network request

#### Scenario: Non-bundled kanji stroke data fetched
- **WHEN** user selects a kanji not in the bundled dataset
- **THEN** the system fetches stroke data from the remote source
- **AND** caches it permanently for future offline use

#### Scenario: Stroke data unavailable
- **WHEN** stroke data cannot be found or fetched for a character
- **THEN** the system displays a "stroke data unavailable" message
- **AND** the practice icon is disabled or hidden for that character
