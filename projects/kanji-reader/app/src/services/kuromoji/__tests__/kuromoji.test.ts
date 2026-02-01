/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: 'file:///mock/path',
    })),
  },
}));

jest.mock('@fotone/react-native-kuromoji', () => ({
  builder: jest.fn(() => ({
    build: jest.fn((callback) => {
      callback(null, {
        tokenize: jest.fn(() => []),
      });
    }),
  })),
}));

describe('KuromojiService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('singleton pattern', () => {
    it('getInstance() returns the same instance', () => {
      const { kuromojiService } = require('../index');
      const { kuromojiService: kuromojiService2 } = require('../index');
      expect(kuromojiService).toBe(kuromojiService2);
    });
  });

  describe('initial state', () => {
    it('getState() returns idle', () => {
      const { kuromojiService } = require('../index');
      expect(kuromojiService.getState()).toBe('idle');
    });

    it('isReady() returns false', () => {
      const { kuromojiService } = require('../index');
      expect(kuromojiService.isReady()).toBe(false);
    });
  });

  describe('tokenize()', () => {
    it('throws when not initialized', () => {
      const { kuromojiService } = require('../index');
      expect(() => kuromojiService.tokenize('テスト')).toThrow(
        'Kuromoji tokenizer not initialized. Call initialize() first.'
      );
    });
  });
});
