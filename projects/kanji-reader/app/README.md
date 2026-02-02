# KanjiReader

A mobile app for learning Japanese Kanji through camera scanning and pronunciation.

## Features

- 📷 Scan Japanese text with camera or upload images
- 🔤 Automatic word segmentation (no spaces in Japanese!)
- 📖 Dictionary lookup with meanings, readings, and JLPT level
- 🔊 Text-to-speech pronunciation
- 🎨 Color-coded character types (Kanji, Hiragana, Katakana)

## Tech Stack

- **React Native** + **Expo** (SDK 54)
- **Google Cloud Vision API** for OCR
- **Google Cloud Translation API** for Japanese → English translation
- **Jisho.org API** for dictionary
- **Expo Speech** for TTS
- **Zustand** for state management
- **TypeScript** for type safety

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Google Cloud Vision API key

### Installation

```bash
cd app
npm install
```

### Environment Variables

Create `.env` file in the `app` directory:

```
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_api_key_here
```

### Development

```bash
npm start
```

Scan the QR code with Expo Go app on your device.

## Testing

```bash
npm test
```

## Building for Devices

### Android APK

```bash
# Login to EAS (first time only)
eas login

# Build APK
eas build --platform android --profile preview

# Download APK from the link provided after build completes
```

Install APK on Android device by:
1. Enable "Install from unknown sources" in settings
2. Transfer APK to device
3. Open and install

### iOS (Requires Apple Developer Account)

```bash
# Build for iOS
eas build --platform ios --profile preview
```

Install on iOS device via:
- TestFlight (recommended)
- Apple Configurator 2
- diawi.com (upload IPA, scan QR)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # API/business logic
│   ├── dictionary/   # Jisho API integration
│   ├── translation/  # Google Cloud Translation (with caching)
│   ├── tts/          # Text-to-speech
│   └── segmentation/ # Word segmentation
├── store/          # Zustand stores
├── constants/      # Colors, spacing, typography
├── utils/          # Helper functions
└── navigation/     # React Navigation setup
```

## API Keys

### Google Cloud APIs (Vision + Translation)

A single API key is used for both OCR and translation:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Cloud Vision API** (for OCR)
3. Enable **Cloud Translation API** (for translations)
4. Create an API key (APIs & Services → Credentials → Create Credentials → API Key)
5. **Recommended:** Restrict the key to only Vision and Translation APIs
6. Add to `.env` file

**Free tiers:**
- Vision API: 1,000 requests/month
- Translation API: 500,000 characters/month

### Jisho API

No API key required - uses public unofficial API.

## Known Limitations

- Jisho API is unofficial and may change
- TTS quality depends on device's Japanese voice availability
- OCR accuracy varies with image quality

## License

MIT
