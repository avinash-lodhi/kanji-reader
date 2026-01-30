# Spec: Text-to-Speech (Pronunciation)

## Summary

Japanese pronunciation audio using Google Cloud TTS or device native TTS. Core learning feature - hear how characters are pronounced.

## Service Interface

```typescript
interface TTSService {
  speak(text: string, options?: TTSOptions): Promise<void>;
  preload(texts: string[]): Promise<void>;
  stop(): void;
  isPlaying(): boolean;
}

interface TTSOptions {
  language?: 'ja-JP' | 'en-US';
  speed?: number;       // 0.5 - 2.0, default 1.0
  pitch?: number;       // 0.5 - 2.0, default 1.0
  voice?: string;       // Voice ID
}
```

## Technical Implementation

### Primary: Expo Speech (MVP)
```typescript
// services/tts/index.ts
import * as Speech from 'expo-speech';

async function speak(text: string, options: TTSOptions): Promise<void> {
  // Stop any currently playing speech
  Speech.stop();
  
  return Speech.speak(text, {
    language: options.language || 'ja-JP',
    rate: options.speed || 1.0,
    pitch: options.pitch || 1.0,
    onDone: () => console.log('Done speaking'),
    onError: (error) => console.error('TTS error:', error)
  });
}

function stop(): void {
  Speech.stop();
}

async function isAvailable(): Promise<boolean> {
  // Check if Japanese voice is available on device
  const voices = await Speech.getAvailableVoicesAsync();
  return voices.some(v => v.language.startsWith('ja'));
}
```

**Why Expo Speech for MVP:**
- Free (no API costs)
- Works offline
- No API key needed
- Good enough quality for learning
- Instant playback (no network latency)

### Future (v2): Google Cloud TTS
```typescript
// services/tts/googleTTS.ts - Premium option for higher quality voices
// Deferred to v2 as optional upgrade
```

### Audio Caching
```typescript
// Cache synthesized audio to reduce API calls
interface AudioCache {
  get(text: string): string | null;  // Returns cached audio URI
  set(text: string, audioUri: string): void;
  preload(texts: string[]): Promise<void>;
}

// Cache structure
// ~/.cache/kanji-reader/tts/
//   - [hash].mp3
//   - index.json (text → hash mapping)
```

### Playback
```typescript
import { Audio } from 'expo-av';

async function playAudio(base64Audio: string): Promise<void> {
  const sound = new Audio.Sound();
  await sound.loadAsync({ uri: `data:audio/mp3;base64,${base64Audio}` });
  await sound.playAsync();
}
```

## Voice Options

### Japanese Voices (Google Cloud)
| Voice ID | Gender | Description |
|----------|--------|-------------|
| ja-JP-Neural2-B | Female | Natural, clear |
| ja-JP-Neural2-C | Male | Natural, clear |
| ja-JP-Wavenet-A | Female | High quality |
| ja-JP-Wavenet-B | Female | High quality |

### Recommendation
- Default: `ja-JP-Neural2-B` (female, natural)
- Allow user preference in settings
- Fall back to native TTS if API unavailable

## User Interaction

1. Tap character/word → Immediate playback
2. Long press → Show speed options
3. Settings → Default speed, voice preference

## Edge Cases

- No network → Use native TTS fallback
- API error → Retry once, then fallback
- Empty text → No-op
- Very long text → Truncate to 200 chars

## Acceptance Criteria

- [ ] Tapping character plays pronunciation
- [ ] Japanese text pronounced correctly
- [ ] Audio caching reduces repeat calls
- [ ] Offline fallback to native TTS works
- [ ] Speed adjustment works
- [ ] Multiple rapid taps don't overlap (queue or cancel)
- [ ] Loading indicator during synthesis
