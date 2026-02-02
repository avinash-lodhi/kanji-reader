import { useState, useEffect, useCallback } from 'react';
import { ttsService } from '../services/tts';

interface UseAudioControlOptions {
  text: string;
  rate?: number;
}

interface UseAudioControlReturn {
  isPlaying: boolean;
  play: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useAudioControl({ text, rate = 1.0 }: UseAudioControlOptions): UseAudioControlReturn {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = ttsService.onStateChange((state) => {
      const currentText = ttsService.getCurrentText();
      setIsPlaying(state === 'speaking' && currentText === text);
    });

    return unsubscribe;
  }, [text]);

  useEffect(() => {
    return () => {
      if (ttsService.getCurrentText() === text) {
        ttsService.stop();
      }
    };
  }, [text]);

  const play = useCallback(() => {
    ttsService.speakJapanese(text, rate);
  }, [text, rate]);

  const stop = useCallback(() => {
    ttsService.stop();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  return { isPlaying, play, stop, toggle };
}

export function useAudioCleanup() {
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);
}
