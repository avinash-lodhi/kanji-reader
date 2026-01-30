import * as Speech from 'expo-speech';

interface TTSOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

const defaultOptions: TTSOptions = {
  language: 'ja-JP',
  rate: 1.0,
  pitch: 1.0,
};

export const ttsService = {
  async speak(text: string, options?: TTSOptions): Promise<void> {
    Speech.stop();

    const opts = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: opts.language,
        rate: opts.rate,
        pitch: opts.pitch,
        onDone: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  },

  stop(): void {
    Speech.stop();
  },

  async isJapaneseAvailable(): Promise<boolean> {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => v.language.startsWith('ja'));
  },

  async speakJapanese(text: string, rate: number = 1.0): Promise<void> {
    return this.speak(text, { language: 'ja-JP', rate });
  },
};
