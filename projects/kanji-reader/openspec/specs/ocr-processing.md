# Spec: OCR Processing

## Summary

Japanese text recognition using Google Cloud Vision API. Extracts text and bounding boxes for interactive display.

## Service Interface

```typescript
interface OCRService {
  recognizeText(imageUri: string): Promise<OCRResult>;
}

interface OCRResult {
  fullText: string;
  blocks: TextBlock[];
  language: string;
  confidence: number;
}

interface TextBlock {
  text: string;
  boundingBox: BoundingBox;
  characters: CharacterInfo[];
}

interface CharacterInfo {
  char: string;
  type: 'kanji' | 'hiragana' | 'katakana' | 'romaji' | 'punctuation' | 'other';
  boundingBox: BoundingBox;
  confidence: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Technical Implementation

### Google Cloud Vision Setup
```typescript
// services/ocr/cloudVision.ts

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

async function recognizeText(imageUri: string): Promise<OCRResult> {
  // Convert image to base64
  const base64 = await imageToBase64(imageUri);
  
  // Call Vision API
  const response = await fetch(`${VISION_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: base64 },
        features: [
          { type: 'TEXT_DETECTION' },
          { type: 'DOCUMENT_TEXT_DETECTION' }
        ],
        imageContext: {
          languageHints: ['ja', 'en']
        }
      }]
    })
  });
  
  return parseVisionResponse(response);
}
```

### Character Type Detection
```typescript
function detectCharacterType(char: string): CharacterType {
  const code = char.charCodeAt(0);
  
  // Hiragana: U+3040 - U+309F
  if (code >= 0x3040 && code <= 0x309F) return 'hiragana';
  
  // Katakana: U+30A0 - U+30FF
  if (code >= 0x30A0 && code <= 0x30FF) return 'katakana';
  
  // CJK Unified Ideographs (Kanji): U+4E00 - U+9FFF
  if (code >= 0x4E00 && code <= 0x9FFF) return 'kanji';
  
  // Basic Latin: U+0000 - U+007F
  if (code >= 0x0041 && code <= 0x007A) return 'romaji';
  
  // Japanese punctuation
  if ('。、！？「」『』（）'.includes(char)) return 'punctuation';
  
  return 'other';
}
```

### Text Segmentation
```typescript
// Segment text into words/phrases for better dictionary lookup
function segmentJapaneseText(text: string): string[] {
  // Use TinySegmenter or similar for Japanese word segmentation
  // Or call external API for more accurate results
  return segments;
}
```

## API Configuration

```typescript
// Environment variables
GOOGLE_CLOUD_VISION_API_KEY=xxx

// Rate limits
const RATE_LIMIT = 10; // requests per minute
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
```

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| API key invalid | "Service unavailable" | Check config |
| Rate limited | "Too many requests, try again" | Retry with backoff |
| No text found | "No Japanese text detected" | Suggest better image |
| Network error | "Check your connection" | Retry button |

## Performance

- Resize large images before upload (max 1920px)
- Show loading indicator during processing
- Target response time: <3 seconds
- Cache recent results locally

## Acceptance Criteria

- [ ] API call succeeds with valid image
- [ ] Japanese text is correctly extracted
- [ ] Character types are correctly identified
- [ ] Bounding boxes map to image coordinates
- [ ] Error states handled gracefully
- [ ] Loading state shown during processing
- [ ] Rate limiting prevents API abuse
