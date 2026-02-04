/**
 * Practice Store
 * 
 * Zustand store for practice words and character progress.
 * Persisted via AsyncStorage for data survival across app restarts.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWritingCharacterType, WritingCharacterType } from '../utils/characterType';

export interface CharacterProgress {
  character: string;
  type: WritingCharacterType;
  attempts: number;
  successes: number;
  hintsUsed: number;
  lastPracticed: number | null;
  nextReview: number | null;
  interval: number | null;
  easeFactor: number | null;
}

export interface PracticeWord {
  id: string;
  word: string;
  characters: string[];
  reading: string;
  meaning: string;
  addedAt: number;
  source: 'scan' | 'manual';
}

interface PracticeState {
  words: PracticeWord[];
  characterProgress: Record<string, CharacterProgress>;
  _hasHydrated: boolean;
}

interface PracticeActions {
  addWord: (word: Omit<PracticeWord, 'id' | 'addedAt'>) => boolean;
  removeWord: (id: string) => void;
  updateWord: (id: string, updates: Partial<Pick<PracticeWord, 'reading' | 'meaning'>>) => void;
  updateProgress: (character: string, success: boolean, hintUsed: boolean) => void;
  getProgress: (character: string) => CharacterProgress | undefined;
  getWordById: (id: string) => PracticeWord | undefined;
  hasWord: (word: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

type PracticeStore = PracticeState & PracticeActions;

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function extractPracticeableCharacters(word: string): string[] {
  const chars: string[] = [];
  for (const char of word) {
    const type = getWritingCharacterType(char);
    if (type !== 'unknown') {
      chars.push(char);
    }
  }
  return chars;
}

function createDefaultProgress(character: string): CharacterProgress {
  return {
    character,
    type: getWritingCharacterType(character),
    attempts: 0,
    successes: 0,
    hintsUsed: 0,
    lastPracticed: null,
    nextReview: null,
    interval: null,
    easeFactor: null,
  };
}

export const usePracticeStore = create<PracticeStore>()(
  persist(
    (set, get) => ({
      words: [],
      characterProgress: {},
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      addWord: (wordData) => {
        const { words } = get();
        
        if (words.some(w => w.word === wordData.word)) {
          return false;
        }

        const characters = extractPracticeableCharacters(wordData.word);
        
        const newWord: PracticeWord = {
          id: generateId(),
          word: wordData.word,
          characters,
          reading: wordData.reading,
          meaning: wordData.meaning,
          addedAt: Date.now(),
          source: wordData.source,
        };

        set((state) => {
          const newProgress = { ...state.characterProgress };
          
          for (const char of characters) {
            if (!newProgress[char]) {
              newProgress[char] = createDefaultProgress(char);
            }
          }

          return {
            words: [...state.words, newWord],
            characterProgress: newProgress,
          };
        });

        return true;
      },

      removeWord: (id: string) => {
        set((state) => ({
          words: state.words.filter(w => w.id !== id),
        }));
      },

      updateWord: (id: string, updates) => {
        set((state) => ({
          words: state.words.map(w => 
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      updateProgress: (character: string, success: boolean, hintUsed: boolean) => {
        set((state) => {
          const current = state.characterProgress[character] || createDefaultProgress(character);
          
          return {
            characterProgress: {
              ...state.characterProgress,
              [character]: {
                ...current,
                attempts: current.attempts + 1,
                successes: success ? current.successes + 1 : current.successes,
                hintsUsed: hintUsed ? current.hintsUsed + 1 : current.hintsUsed,
                lastPracticed: Date.now(),
              },
            },
          };
        });
      },

      getProgress: (character: string) => {
        return get().characterProgress[character];
      },

      getWordById: (id: string) => {
        return get().words.find(w => w.id === id);
      },

      hasWord: (word: string) => {
        return get().words.some(w => w.word === word);
      },
    }),
    {
      name: 'practice-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        words: state.words,
        characterProgress: state.characterProgress,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const usePracticeHydrated = () => usePracticeStore((state) => state._hasHydrated);
