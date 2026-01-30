# Spec: Image Upload

## Summary

Upload screenshots or photos from device gallery for OCR processing. Primary use case: TV subtitle screenshots.

## User Flow

1. User taps "Upload" / gallery icon
2. System image picker opens
3. User selects image
4. Preview shown with optional crop
5. User confirms
6. Image sent to OCR
7. Navigate to results

## UI Components

### UploadScreen
```typescript
interface UploadScreenProps {
  onImageSelected: (imageUri: string) => void;
}
```

**Elements:**
- Large upload zone (tap or drag)
- "Select from Gallery" button
- Recent uploads (last 3-5)
- Preview modal after selection

### ImagePreview
```typescript
interface ImagePreviewProps {
  imageUri: string;
  onConfirm: () => void;
  onCrop: () => void;
  onCancel: () => void;
}
```

**Elements:**
- Full image preview
- Crop button
- Confirm button
- Cancel/back button

## Technical Implementation

### Image Picker
```typescript
import * as ImagePicker from 'expo-image-picker';

async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,  // Built-in crop
    quality: 0.8,
  });

  if (!result.canceled) {
    onImageSelected(result.assets[0].uri);
  }
}
```

### Image Validation
```typescript
function validateImage(uri: string): ValidationResult {
  // Check file exists
  // Check format (jpg, png, webp)
  // Check minimum resolution (300x300)
  // Check maximum size (10MB)
  return { valid: true, errors: [] };
}
```

## Supported Formats

- JPEG
- PNG
- WebP
- HEIC (iOS)

## Edge Cases

- No images in gallery → Show helpful message
- Corrupted image → Show error, allow retry
- Very large image → Resize before upload
- Very small image → Warn about OCR accuracy

## Acceptance Criteria

- [ ] Gallery picker opens on button tap
- [ ] Selected image shows in preview
- [ ] Crop functionality works
- [ ] Confirm sends image to OCR
- [ ] Cancel returns to previous screen
- [ ] Invalid images show appropriate error
- [ ] Large images are resized automatically
