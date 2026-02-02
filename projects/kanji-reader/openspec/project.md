# KanjiReader Project Context

## Overview

KanjiReader is a mobile-first app that helps Japanese learners recognize and pronounce Kanji characters through camera scanning and screenshot analysis. Instead of providing English translations that bypass learning, it focuses on building character recognition through audio-visual connection.

## Tech Stack

### Platform & Distribution
- **Primary Device:** iOS (iPhone)
- **Secondary Device:** Android
- **Distribution:** Local install only (no App Store submission)
  - iOS: TestFlight (up to 100 testers) or direct .ipa via EAS
  - Android: .apk sideload
- **Why local:** Faster iteration, no review delays, personal use

### Frontend
- **Framework:** React Native + Expo (managed workflow)
- **Language:** TypeScript
- **State Management:** Zustand (lightweight, ADHD-friendly simplicity)
- **UI Components:** React Native Paper or NativeWind (Tailwind for RN)

### Backend / Services
- **OCR:** Google Cloud Vision API (Japanese text recognition)
- **Translation:** Google Cloud Translation API v2 (Neural Machine Translation)
- **Dictionary:** Jisho API (free) or local SQLite dictionary
- **TTS:** Google Cloud Text-to-Speech (Japanese voices)
- **Optional:** Firebase for analytics / crash reporting

### Development
- **Package Manager:** pnpm
- **Testing:** Jest + React Native Testing Library
- **Linting:** ESLint + Prettier
- **Build:** EAS Build (Expo Application Services)
- **Local Testing:** Expo Go (quick iteration), Dev Client (native modules)

## Project Structure

```
kanji-reader/
├── src/
│   ├── screens/          # Main app screens
│   ├── components/       # Reusable UI components
│   ├── services/         # OCR, TTS, Dictionary, Translation APIs
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   └── constants/        # App constants
├── assets/               # Images, fonts, sounds
├── openspec/             # Specifications
└── proposal.md           # Product proposal
```

## Conventions

### Code Style
- Functional components with hooks
- Async/await over promises
- Descriptive variable names
- Small, focused functions

### Naming
- Components: PascalCase (`KanjiCard.tsx`)
- Utilities: camelCase (`parseJapaneseText.ts`)
- Constants: SCREAMING_SNAKE_CASE
- Types: PascalCase with `I` prefix for interfaces

### File Organization
- One component per file
- Co-locate tests with components (`Component.test.tsx`)
- Index exports for folders

## Key Decisions

1. **React Native over Flutter** - Better TypeScript support, familiar ecosystem
2. **Cloud OCR over local** - Accuracy matters more than offline for MVP
3. **Zustand over Redux** - Simpler mental model, less boilerplate
4. **Expo managed workflow** - Faster iteration, easier camera access

## Target Users

Primary user: Avinash (developer learning Japanese, has ADHD)
- Needs quick interactions
- Prefers audio + visual learning
- Consumes Japanese media (anime, manga, books)

## MVP Scope

1. Camera scan with region selection
2. Screenshot upload
3. Japanese OCR (Kanji, Hiragana, Katakana)
4. Per-character/word pronunciation (TTS)
5. Romaji display
6. Optional English meaning

## Out of Scope (MVP)

- Offline mode
- Writing practice
- Flashcards / SRS
- User accounts
- Progress tracking
