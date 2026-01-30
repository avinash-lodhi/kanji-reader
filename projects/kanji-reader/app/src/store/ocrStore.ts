import { create } from 'zustand';
import { performOCR } from '../services/ocrService';
import { segmentText, SegmentedWord } from '../services/segmentation';

interface OCRState {
  imageUri: string | null;
  isProcessing: boolean;
  error: string | null;
  rawText: string | null;
  words: SegmentedWord[];

  setImage: (uri: string) => void;
  processImage: () => Promise<void>;
  clearResults: () => void;
  retry: () => Promise<void>;
}

export const useOCRStore = create<OCRState>((set, get) => ({
  imageUri: null,
  isProcessing: false,
  error: null,
  rawText: null,
  words: [],

  setImage: (uri: string) => {
    set({ imageUri: uri, error: null, rawText: null, words: [] });
  },

  processImage: async () => {
    const { imageUri } = get();
    if (!imageUri) {
      set({ error: 'No image selected' });
      return;
    }

    set({ isProcessing: true, error: null });

    try {
      const text = await performOCR(imageUri);
      const words = segmentText(text);

      set({
        rawText: text,
        words,
        isProcessing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'OCR processing failed',
        isProcessing: false,
      });
    }
  },

  clearResults: () => {
    set({
      imageUri: null,
      isProcessing: false,
      error: null,
      rawText: null,
      words: [],
    });
  },

  retry: async () => {
    await get().processImage();
  },
}));
