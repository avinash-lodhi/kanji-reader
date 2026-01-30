# Spec: Core Architecture

## Summary

Defines the foundational architecture for KanjiReader, including app structure, navigation, and service layer organization.

## Components

### App Shell
- Root navigation container
- Theme provider (light/dark mode)
- Error boundary with crash reporting
- Service initialization on app start

### Navigation Structure
```
App
├── HomeScreen (default)
│   ├── CameraMode (tab)
│   └── UploadMode (tab)
├── ResultsScreen
│   └── CharacterDetailModal
└── SettingsScreen (future)
```

### Service Layer
```typescript
// services/index.ts
export { OCRService } from './ocr';
export { DictionaryService } from './dictionary';
export { TTSService } from './tts';
export { ImageService } from './image';
```

### State Structure
```typescript
interface AppState {
  // Current scan
  currentImage: string | null;
  ocrResult: OCRResult | null;
  isProcessing: boolean;
  
  // Selected character
  selectedCharacter: CharacterInfo | null;
  
  // Settings
  showRomaji: boolean;
  showEnglish: boolean;
  autoPlayAudio: boolean;
}
```

## Data Flow

1. User captures/uploads image
2. Image sent to OCR service
3. OCR returns text + bounding boxes
4. Text parsed into character segments
5. Dictionary lookup for each segment
6. Results displayed with tap-to-pronounce

## Dependencies

- react-native
- react-navigation
- zustand
- expo-camera
- expo-image-picker
- expo-av (audio playback)

## Acceptance Criteria

- [ ] App shell renders without crash
- [ ] Navigation between screens works
- [ ] Services initialize on app start
- [ ] State persists during session
- [ ] Error boundary catches and logs errors
