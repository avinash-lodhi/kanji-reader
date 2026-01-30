# Spec: Camera Capture

## Summary

Camera interface for capturing Japanese text in real-time with region selection.

## User Flow

1. User opens app → lands on camera view
2. Camera shows live preview with optional guide frame
3. User frames Japanese text in view
4. User taps capture button
5. Full image captured and sent to OCR processing
6. Navigate to results screen

**Note:** Region selection deferred to v2. Google Vision API is smart enough to find text in full images.

## UI Components

### CameraScreen
```typescript
interface CameraScreenProps {
  onCapture: (imageUri: string) => void;
}
```

**Elements:**
- Full-screen camera preview
- Semi-transparent overlay with scan region hint
- Capture button (bottom center, large)
- Gallery button (bottom left, to switch to upload)
- Flash toggle (top right)
- Region selection overlay (optional drag)

### GuideFrame (Optional Visual Aid)
```typescript
interface GuideFrameProps {
  visible: boolean;
}
```

**Behavior:**
- Static centered frame (no interaction)
- Helps user align text visually
- Semi-transparent overlay
- Can be toggled on/off

**Note:** Full drag-to-select region selection deferred to v2.

## Technical Implementation

### Camera Setup
```typescript
import { Camera } from 'expo-camera';

// Request permissions on mount
const [permission, requestPermission] = Camera.useCameraPermissions();

// Camera config
<Camera
  style={styles.camera}
  type={CameraType.back}
  ratio="16:9"
  ref={cameraRef}
/>
```

### Capture Logic
```typescript
async function captureImage() {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: false,
      exif: false,
    });
    
    // Crop to region if selected
    if (selectedRegion) {
      const croppedUri = await ImageService.crop(photo.uri, selectedRegion);
      onCapture(croppedUri);
    } else {
      onCapture(photo.uri);
    }
  }
}
```

## Permissions

- `camera` - Required for capture
- `media-library` - Optional, for saving captures

## Edge Cases

- Permission denied → Show permission request screen
- Camera unavailable → Show error with upload fallback
- Low light → Consider flash suggestion
- Blurry capture → Hint to hold steady

## Acceptance Criteria

- [ ] Camera preview displays on screen
- [ ] Capture button takes photo
- [ ] Photo is passed to OCR service
- [ ] Region selection crops image before OCR
- [ ] Permission flow handles denied state
- [ ] Flash toggle works
- [ ] Gallery button navigates to upload mode
