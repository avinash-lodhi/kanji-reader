import * as Speech from 'expo-speech';

interface TTSOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

type TTSState = 'idle' | 'speaking';

type StateChangeCallback = (state: TTSState) => void;

const defaultOptions: TTSOptions = {
  language: 'ja-JP',
  rate: 1.0,
  pitch: 1.0,
};

let currentState: TTSState = 'idle';
let currentText: string | null = null;
const stateListeners: Set<StateChangeCallback> = new Set();

function notifyStateChange(state: TTSState) {
  currentState = state;
  stateListeners.forEach(cb => cb(state));
}

export const ttsService = {
  async speak(text: string, options?: TTSOptions): Promise<void> {
    Speech.stop();
    currentText = text;

    const opts = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      notifyStateChange('speaking');
      
      Speech.speak(text, {
        language: opts.language,
        rate: opts.rate,
        pitch: opts.pitch,
        onDone: () => {
          currentText = null;
          notifyStateChange('idle');
          resolve();
        },
        onError: (error) => {
          currentText = null;
          notifyStateChange('idle');
          reject(error);
        },
        onStopped: () => {
          currentText = null;
          notifyStateChange('idle');
        },
      });
    });
  },

  stop(): void {
    Speech.stop();
    currentText = null;
    notifyStateChange('idle');
  },

  isSpeaking(): boolean {
    return currentState === 'speaking';
  },

  getState(): TTSState {
    return currentState;
  },

  getCurrentText(): string | null {
    return currentText;
  },

  onStateChange(callback: StateChangeCallback): () => void {
    stateListeners.add(callback);
    return () => stateListeners.delete(callback);
  },

  async isJapaneseAvailable(): Promise<boolean> {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => v.language.startsWith('ja'));
  },

  async speakJapanese(text: string, rate: number = 1.0): Promise<void> {
    return this.speak(text, { language: 'ja-JP', rate });
  },
};
