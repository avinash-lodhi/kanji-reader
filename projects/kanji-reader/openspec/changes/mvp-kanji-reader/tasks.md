# Implementation Tasks: MVP Kanji Reader

## Phase 1: Project Setup

### 1.1 Initialize React Native Project
- [ ] Create Expo project with TypeScript template
- [ ] Configure ESLint + Prettier
- [ ] Set up folder structure (src/, components/, services/, etc.)
- [ ] Install core dependencies (react-navigation, zustand)
- [ ] Create app entry point with navigation shell

### 1.2 Configure Development Environment
- [ ] Set up environment variables (.env)
- [ ] Configure API keys placeholder
- [ ] Create constants file for app config
- [ ] Set up TypeScript paths/aliases

### 1.3 Configure EAS Build (Local Distribution)
- [ ] Install eas-cli globally
- [ ] Run `eas init` to configure project
- [ ] Create eas.json with build profiles:
  - `development` - for Expo Go testing
  - `preview` - for local .ipa/.apk builds
  - `production` - for final builds
- [ ] Configure iOS provisioning (ad-hoc for local install)
- [ ] Test build: `eas build --platform ios --profile preview`
- [ ] Test build: `eas build --platform android --profile preview`

### 1.4 Create Base Components
- [ ] Create theme provider (colors, typography)
- [ ] Create base Button component
- [ ] Create base Card component
- [ ] Create Loading indicator component
- [ ] Create Error boundary wrapper

---

## Phase 2: Camera & Image Input

### 2.1 Camera Screen
- [ ] Install expo-camera
- [ ] Create CameraScreen component
- [ ] Implement permission request flow
- [ ] Add camera preview with full-screen view
- [ ] Add optional guide frame overlay (visual hint for text alignment)
- [ ] Create capture button with animation
- [ ] Add flash toggle functionality
- [ ] Create permission denied fallback UI

### 2.2 Image Processing (Post-Capture)
- [ ] Install expo-image-manipulator
- [ ] Resize large images before OCR (max 1920px)
- [ ] Convert to appropriate format for API
- [ ] Handle image orientation/rotation

### 2.3 Image Upload
- [ ] Install expo-image-picker
- [ ] Create UploadScreen component
- [ ] Implement gallery picker
- [ ] Create image preview modal
- [ ] Add crop functionality
- [ ] Validate image format and size
- [ ] Handle picker cancellation

### 2.4 Navigation Setup
- [ ] Create tab navigator (Camera / Upload)
- [ ] Create stack navigator for results
- [ ] Implement navigation between screens
- [ ] Add transition animations

---

## Phase 3: OCR Service

### 3.1 Google Cloud Vision Integration
- [ ] Create OCR service module
- [ ] Implement image-to-base64 conversion
- [ ] Create Vision API request function
- [ ] Parse API response into structured data
- [ ] Extract text blocks and bounding boxes
- [ ] Handle API errors gracefully

### 3.2 Text Processing
- [ ] Create character type detection function
- [ ] Implement Kanji/Hiragana/Katakana classification
- [ ] Map bounding boxes to image coordinates
- [ ] Calculate confidence scores

### 3.3 Word Segmentation
- [ ] Research Japanese segmentation libraries (TinySegmenter, Kuromoji, Budoux)
- [ ] Install chosen library (recommend: Budoux - lightweight, works in browser/RN)
- [ ] Create segmentation service wrapper
- [ ] Segment OCR text into words/phrases
- [ ] Handle mixed Japanese/English text
- [ ] Test with various sentence patterns

### 3.4 OCR State Management
- [ ] Create OCR store (Zustand)
- [ ] Implement loading state
- [ ] Store OCR results
- [ ] Store segmented words
- [ ] Handle error state
- [ ] Add retry functionality

---

## Phase 4: Dictionary Service

### 4.1 Jisho API Integration
- [ ] Create dictionary service module
- [ ] Implement word lookup function
- [ ] Implement single kanji lookup function
- [ ] Parse Jisho response format
- [ ] Extract readings and meanings

### 4.2 Romaji Conversion
- [ ] Install wanakana library
- [ ] Create romaji conversion utility
- [ ] Handle edge cases (mixed scripts)
- [ ] Add hiragana-to-romaji function

### 4.3 Dictionary Caching
- [ ] Create cache interface
- [ ] Implement in-memory LRU cache
- [ ] Add AsyncStorage persistence
- [ ] Create cache invalidation logic

---

## Phase 5: Text-to-Speech Service

### 5.1 TTS Implementation (Expo Speech - Primary)
- [ ] Create TTS service module
- [ ] Install expo-speech
- [ ] Implement speak function with Japanese voice
- [ ] Configure default options (language: ja-JP)
- [ ] Implement stop function
- [ ] Handle rapid tap queue (stop previous, play new)
- [ ] Test Japanese pronunciation quality on iOS/Android

### 5.2 TTS Enhancements (Optional)
- [ ] Install expo-av (for future audio caching)
- [ ] Add speed adjustment support
- [ ] Store user speed preference in AsyncStorage
- [ ] (Future) Google Cloud TTS integration for premium voices

### 5.3 TTS Options
- [ ] Add speed adjustment (0.5x - 2x)
- [ ] Store user preference
- [ ] Create settings interface

---

## Phase 6: Results Display

### 6.1 Results Screen
- [ ] Create ResultsScreen component
- [ ] Display original scanned image (thumbnail/preview)
- [ ] Show full extracted text (complete sentence/paragraph)
- [ ] Create scrollable word list below
- [ ] Add "Scan Again" button
- [ ] Handle empty state (no text found)

### 6.2 Word Card Component
- [ ] Create WordCard component (not character-level)
- [ ] Display word with reading preview
- [ ] Implement tap handler
- [ ] Add selection state styling
- [ ] Color-code by primary character type (kanji/hiragana/katakana)
- [ ] Add loading shimmer state for dictionary lookup

### 6.3 Detail Panel
- [ ] Create DetailPanel bottom sheet
- [ ] Display character large
- [ ] Show reading (hiragana)
- [ ] Show romaji
- [ ] List meanings
- [ ] Add audio play button
- [ ] Show JLPT level if available
- [ ] Implement swipe-to-dismiss

### 6.4 Interactions
- [ ] Implement tap-to-select
- [ ] Auto-play audio on selection
- [ ] Implement outside-tap dismiss
- [ ] Add haptic feedback

---

## Phase 7: Integration & Polish

### 7.1 End-to-End Flow
- [ ] Connect camera capture to OCR
- [ ] Connect upload to OCR
- [ ] Connect OCR results to display
- [ ] Connect character tap to dictionary
- [ ] Connect selection to TTS
- [ ] Test full flow on device

### 7.2 Error Handling
- [ ] Add error boundaries
- [ ] Create error display components
- [ ] Implement retry logic
- [ ] Add offline detection
- [ ] Create fallback states

### 7.3 Performance
- [ ] Optimize image resizing
- [ ] Add result caching
- [ ] Lazy load dictionary lookups
- [ ] Profile and fix bottlenecks

### 7.4 Polish
- [ ] Add loading animations
- [ ] Implement smooth transitions
- [ ] Add empty state illustrations
- [ ] Review and fix accessibility
- [ ] Test on multiple screen sizes

---

## Phase 8: Testing & Documentation

### 8.1 Testing
- [ ] Write unit tests for services
- [ ] Write component tests
- [ ] Test permission flows
- [ ] Test error states
- [ ] Manual E2E testing

### 8.2 Documentation
- [ ] Update README with setup instructions
- [ ] Document API key configuration
- [ ] Create user guide
- [ ] Document known limitations

---

## Phase 9: Build & Install

### 9.1 iOS Build & Install
- [ ] Configure Apple Developer account in EAS
- [ ] Set up ad-hoc provisioning profile
- [ ] Register test device UDID
- [ ] Build .ipa: `eas build --platform ios --profile preview`
- [ ] Download and install via:
  - Option A: Apple Configurator
  - Option B: Diawi/similar service
  - Option C: TestFlight (if preferred)
- [ ] Test on physical iPhone

### 9.2 Android Build & Install
- [ ] Build .apk: `eas build --platform android --profile preview`
- [ ] Download .apk file
- [ ] Transfer to Android device
- [ ] Install via sideload (enable "Unknown sources")
- [ ] Test on physical Android device

### 9.3 Update Workflow
- [ ] Document build commands in README
- [ ] Create build script for quick rebuilds
- [ ] Set up OTA updates via Expo (optional, for quick fixes)

---

## Beads Task Mapping

*Tasks suitable for local AI agents (small, well-defined):*

| Task | Model | Complexity |
|------|-------|------------|
| Create base Button component | llama3 | Simple |
| Create character type detection | llama3 | Simple |
| Implement romaji conversion (wanakana wrapper) | llama3 | Simple |
| Create loading indicator | llama3 | Simple |
| Create WordCard component | llama3 | Simple |
| Write unit tests for utils | deepseek-coder | Medium |
| Parse Jisho response | deepseek-coder | Medium |
| Create TypeScript interfaces | deepseek-coder | Simple |
| Word segmentation wrapper | deepseek-coder | Medium |
| Image resize utility | deepseek-coder | Simple |

*Tasks requiring heavy model (complex, architectural):*
- Service architecture design
- State management setup
- Navigation structure
- Error handling strategy
- OCR → Segmentation → Display flow integration
- Performance optimization
