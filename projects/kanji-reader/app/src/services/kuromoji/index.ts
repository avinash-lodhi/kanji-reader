/**
 * Kuromoji Service
 * 
 * Singleton service for Japanese tokenization using kuromoji.
 * Uses @fotone/react-native-kuromoji with Expo assets for dictionary loading.
 */

import { Asset } from 'expo-asset';
import kuromoji from '@fotone/react-native-kuromoji';
import type { KuromojiToken, KuromojiState, KuromojiTokenizer } from './types';

export type { KuromojiToken, KuromojiState } from './types';

// Keys must match what DictionaryLoader expects (.dat.gz suffixes)
const DICT_FILES = [
  'base.dat.gz',
  'check.dat.gz',
  'tid.dat.gz',
  'tid_pos.dat.gz',
  'tid_map.dat.gz',
  'cc.dat.gz',
  'unk.dat.gz',
  'unk_pos.dat.gz',
  'unk_map.dat.gz',
  'unk_char.dat.gz',
  'unk_compat.dat.gz',
  'unk_invoke.dat.gz',
] as const;

class KuromojiService {
  private static instance: KuromojiService;
  
  private tokenizer: KuromojiTokenizer | null = null;
  private state: KuromojiState = 'idle';
  private error: Error | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): KuromojiService {
    if (!KuromojiService.instance) {
      KuromojiService.instance = new KuromojiService();
    }
    return KuromojiService.instance;
  }

  /**
   * Initialize the tokenizer by loading dictionary assets.
   * Safe to call multiple times - will only initialize once.
   */
  async initialize(): Promise<void> {
    if (this.state === 'ready') {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.state = 'loading';
    this.error = null;

    try {
      const assets = await this.loadDictionaryAssets();
      this.tokenizer = await this.buildTokenizer(assets);
      this.state = 'ready';
    } catch (err) {
      this.state = 'error';
      this.error = err instanceof Error ? err : new Error(String(err));
      this.initPromise = null;
      throw this.error;
    }
  }

  private async loadDictionaryAssets(): Promise<Record<string, Asset>> {
    // Map .dat.gz keys to decompressed .dat asset files
    /* eslint-disable @typescript-eslint/no-require-imports */
    const assetModules: Record<string, number> = {
      'base.dat.gz': require('../../../assets/kuromoji-dict/base.dat'),
      'check.dat.gz': require('../../../assets/kuromoji-dict/check.dat'),
      'tid.dat.gz': require('../../../assets/kuromoji-dict/tid.dat'),
      'tid_pos.dat.gz': require('../../../assets/kuromoji-dict/tid_pos.dat'),
      'tid_map.dat.gz': require('../../../assets/kuromoji-dict/tid_map.dat'),
      'cc.dat.gz': require('../../../assets/kuromoji-dict/cc.dat'),
      'unk.dat.gz': require('../../../assets/kuromoji-dict/unk.dat'),
      'unk_pos.dat.gz': require('../../../assets/kuromoji-dict/unk_pos.dat'),
      'unk_map.dat.gz': require('../../../assets/kuromoji-dict/unk_map.dat'),
      'unk_char.dat.gz': require('../../../assets/kuromoji-dict/unk_char.dat'),
      'unk_compat.dat.gz': require('../../../assets/kuromoji-dict/unk_compat.dat'),
      'unk_invoke.dat.gz': require('../../../assets/kuromoji-dict/unk_invoke.dat'),
    };
    /* eslint-enable @typescript-eslint/no-require-imports */

    const assets: Record<string, Asset> = {};

    await Promise.all(
      DICT_FILES.map(async (filename) => {
        const asset = Asset.fromModule(assetModules[filename]);
        await asset.downloadAsync();
        assets[filename] = asset;
      })
    );

    return assets;
  }

  private buildTokenizer(assets: Record<string, Asset>): Promise<KuromojiTokenizer> {
    return new Promise((resolve, reject) => {
      kuromoji.builder({ assets }).build((err: Error | null, tokenizer: KuromojiTokenizer) => {
        if (err) {
          reject(err);
        } else {
          resolve(tokenizer);
        }
      });
    });
  }

  /**
   * Check if the tokenizer is ready for use.
   */
  isReady(): boolean {
    return this.state === 'ready' && this.tokenizer !== null;
  }

  /**
   * Get the current state of the service.
   */
  getState(): KuromojiState {
    return this.state;
  }

  /**
   * Get the initialization error, if any.
   */
  getError(): Error | null {
    return this.error;
  }

  /**
   * Tokenize Japanese text into words with readings and part-of-speech info.
   * @throws Error if tokenizer is not initialized
   */
  tokenize(text: string): KuromojiToken[] {
    if (!this.tokenizer) {
      throw new Error('Kuromoji tokenizer not initialized. Call initialize() first.');
    }

    if (!text || text.trim().length === 0) {
      return [];
    }

    const rawTokens = this.tokenizer.tokenize(text);
    
    return rawTokens.map((token: KuromojiToken) => ({
      surface_form: token.surface_form ?? '',
      reading: token.reading ?? '',
      word_position: token.word_position ?? 0,
      pos: token.pos ?? '',
      basic_form: token.basic_form ?? '',
    }));
  }
}

export const kuromojiService = KuromojiService.getInstance();
