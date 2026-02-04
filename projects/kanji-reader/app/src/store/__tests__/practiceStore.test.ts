/**
 * Practice Store Unit Tests (KanjiReader-e8c.8.2)
 *
 * Tests the Zustand practice store: word management, duplicate prevention,
 * progress tracking, and character decomposition.
 */

import { usePracticeStore } from '../practiceStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Helper to reset the store between tests
function resetStore() {
  usePracticeStore.setState({
    words: [],
    characterProgress: {},
    _hasHydrated: true,
  });
}

describe('practiceStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // --- Word Management ---------------------------------------------------

  describe('addWord', () => {
    it('adds a word to the store', () => {
      const store = usePracticeStore.getState();
      const result = store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      expect(result).toBe(true);
      const { words } = usePracticeStore.getState();
      expect(words).toHaveLength(1);
      expect(words[0].word).toBe('食べる');
      expect(words[0].reading).toBe('たべる');
      expect(words[0].meaning).toBe('to eat');
      expect(words[0].source).toBe('scan');
    });

    it('generates a unique id and addedAt timestamp', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '日本',
        characters: ['日', '本'],
        reading: 'にほん',
        meaning: 'Japan',
        source: 'manual',
      });

      const { words } = usePracticeStore.getState();
      expect(words[0].id).toBeDefined();
      expect(typeof words[0].id).toBe('string');
      expect(words[0].id.length).toBeGreaterThan(0);
      expect(words[0].addedAt).toBeGreaterThan(0);
    });

    it('rejects duplicate words', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      const result = usePracticeStore.getState().addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'manual',
      });

      expect(result).toBe(false);
      expect(usePracticeStore.getState().words).toHaveLength(1);
    });

    it('extracts practiceable characters and creates progress entries', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '食べる',
        characters: ['食', 'べ', 'る'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      const { characterProgress } = usePracticeStore.getState();
      // The store internally extracts practiceable characters from the word
      // '食' is kanji, 'べ' and 'る' are hiragana — all are practiceable
      expect(characterProgress['食']).toBeDefined();
      expect(characterProgress['食'].attempts).toBe(0);
      expect(characterProgress['食'].successes).toBe(0);
    });

    it('records source correctly for scan-added words', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '漢字',
        characters: ['漢', '字'],
        reading: 'かんじ',
        meaning: 'kanji',
        source: 'scan',
      });

      expect(usePracticeStore.getState().words[0].source).toBe('scan');
    });
  });

  describe('removeWord', () => {
    it('removes a word by id', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      const wordId = usePracticeStore.getState().words[0].id;
      usePracticeStore.getState().removeWord(wordId);

      expect(usePracticeStore.getState().words).toHaveLength(0);
    });

    it('preserves CharacterProgress when removing a word', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      // Record some progress
      usePracticeStore.getState().updateProgress('食', true, false);

      const wordId = usePracticeStore.getState().words[0].id;
      usePracticeStore.getState().removeWord(wordId);

      // Word is gone but progress is preserved
      expect(usePracticeStore.getState().words).toHaveLength(0);
      expect(usePracticeStore.getState().characterProgress['食']).toBeDefined();
      expect(usePracticeStore.getState().characterProgress['食'].successes).toBe(1);
    });

    it('does nothing for non-existent id', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '日本',
        characters: ['日', '本'],
        reading: 'にほん',
        meaning: 'Japan',
        source: 'scan',
      });

      usePracticeStore.getState().removeWord('non-existent-id');
      expect(usePracticeStore.getState().words).toHaveLength(1);
    });
  });

  describe('updateWord', () => {
    it('updates reading and meaning', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      const wordId = usePracticeStore.getState().words[0].id;
      usePracticeStore.getState().updateWord(wordId, {
        reading: 'updated reading',
        meaning: 'updated meaning',
      });

      const word = usePracticeStore.getState().words[0];
      expect(word.reading).toBe('updated reading');
      expect(word.meaning).toBe('updated meaning');
    });
  });

  describe('hasWord', () => {
    it('returns true for existing word', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      expect(usePracticeStore.getState().hasWord('食べる')).toBe(true);
    });

    it('returns false for non-existing word', () => {
      expect(usePracticeStore.getState().hasWord('存在しない')).toBe(false);
    });
  });

  describe('getWordById', () => {
    it('returns the word for valid id', () => {
      const store = usePracticeStore.getState();
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      const wordId = usePracticeStore.getState().words[0].id;
      const found = usePracticeStore.getState().getWordById(wordId);
      expect(found).toBeDefined();
      expect(found?.word).toBe('食べる');
    });

    it('returns undefined for invalid id', () => {
      expect(usePracticeStore.getState().getWordById('nope')).toBeUndefined();
    });
  });

  // --- Progress Tracking -------------------------------------------------

  describe('updateProgress', () => {
    it('creates CharacterProgress on first practice attempt', () => {
      const store = usePracticeStore.getState();
      store.updateProgress('食', true, false);

      const progress = usePracticeStore.getState().characterProgress['食'];
      expect(progress).toBeDefined();
      expect(progress.character).toBe('食');
      expect(progress.attempts).toBe(1);
      expect(progress.successes).toBe(1);
      expect(progress.hintsUsed).toBe(0);
      expect(progress.lastPracticed).toBeGreaterThan(0);
    });

    it('increments successes on successful practice', () => {
      const store = usePracticeStore.getState();
      store.updateProgress('食', true, false);
      usePracticeStore.getState().updateProgress('食', true, false);

      const progress = usePracticeStore.getState().characterProgress['食'];
      expect(progress.attempts).toBe(2);
      expect(progress.successes).toBe(2);
    });

    it('increments attempts but not successes on failed practice', () => {
      const store = usePracticeStore.getState();
      store.updateProgress('食', false, false);

      const progress = usePracticeStore.getState().characterProgress['食'];
      expect(progress.attempts).toBe(1);
      expect(progress.successes).toBe(0);
    });

    it('increments hintsUsed when hint is used', () => {
      const store = usePracticeStore.getState();
      store.updateProgress('食', true, true);

      const progress = usePracticeStore.getState().characterProgress['食'];
      expect(progress.hintsUsed).toBe(1);
    });

    it('does not increment hintsUsed when hint is not used', () => {
      const store = usePracticeStore.getState();
      store.updateProgress('食', true, false);

      const progress = usePracticeStore.getState().characterProgress['食'];
      expect(progress.hintsUsed).toBe(0);
    });

    it('shares progress for the same character across different words', () => {
      const store = usePracticeStore.getState();
      // Add two words that share the character '食'
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });
      usePracticeStore.getState().addWord({
        word: '食事',
        characters: ['食', '事'],
        reading: 'しょくじ',
        meaning: 'meal',
        source: 'scan',
      });

      // Practice '食' from either word context
      usePracticeStore.getState().updateProgress('食', true, false);

      const progress = usePracticeStore.getState().characterProgress['食'];
      expect(progress.attempts).toBe(1);
      expect(progress.successes).toBe(1);
      // Both words share this same progress
    });

    it('updates lastPracticed timestamp', () => {
      const before = Date.now();
      const store = usePracticeStore.getState();
      store.updateProgress('日', true, false);
      const after = Date.now();

      const progress = usePracticeStore.getState().characterProgress['日'];
      expect(progress.lastPracticed).toBeGreaterThanOrEqual(before);
      expect(progress.lastPracticed).toBeLessThanOrEqual(after);
    });
  });

  describe('getProgress', () => {
    it('returns progress for existing character', () => {
      const store = usePracticeStore.getState();
      store.updateProgress('食', true, false);

      const progress = usePracticeStore.getState().getProgress('食');
      expect(progress).toBeDefined();
      expect(progress?.character).toBe('食');
    });

    it('returns undefined for character with no progress', () => {
      expect(usePracticeStore.getState().getProgress('存')).toBeUndefined();
    });
  });

  // --- Store Initialization with Defaults --------------------------------

  describe('store defaults', () => {
    it('initializes with empty words array', () => {
      expect(usePracticeStore.getState().words).toEqual([]);
    });

    it('initializes with empty characterProgress', () => {
      expect(usePracticeStore.getState().characterProgress).toEqual({});
    });
  });

  // --- Multiple operations -----------------------------------------------

  describe('complex scenarios', () => {
    it('handles add → practice → remove → re-add cycle', () => {
      const store = usePracticeStore.getState();
      
      // Add
      store.addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'scan',
      });

      // Practice
      usePracticeStore.getState().updateProgress('食', true, false);
      usePracticeStore.getState().updateProgress('食', true, false);

      // Remove
      const wordId = usePracticeStore.getState().words[0].id;
      usePracticeStore.getState().removeWord(wordId);

      // Progress preserved
      expect(usePracticeStore.getState().characterProgress['食'].successes).toBe(2);

      // Re-add
      usePracticeStore.getState().addWord({
        word: '食べる',
        characters: ['食'],
        reading: 'たべる',
        meaning: 'to eat',
        source: 'manual',
      });

      // Word is back, progress still intact
      expect(usePracticeStore.getState().words).toHaveLength(1);
      expect(usePracticeStore.getState().characterProgress['食'].successes).toBe(2);
    });

    it('handles multiple words with overlapping characters', () => {
      const store = usePracticeStore.getState();
      
      store.addWord({
        word: '日本',
        characters: ['日', '本'],
        reading: 'にほん',
        meaning: 'Japan',
        source: 'scan',
      });

      usePracticeStore.getState().addWord({
        word: '日記',
        characters: ['日', '記'],
        reading: 'にっき',
        meaning: 'diary',
        source: 'scan',
      });

      // '日' progress should be shared
      usePracticeStore.getState().updateProgress('日', true, false);
      
      const progress = usePracticeStore.getState().characterProgress;
      expect(progress['日'].attempts).toBe(1);
      expect(progress['本']).toBeDefined();
      expect(progress['記']).toBeDefined();
    });
  });
});
