/**
 * Kuromoji Token Types
 */

export interface KuromojiToken {
  /** The word as written in the text */
  surface_form: string;
  /** Katakana reading */
  reading: string;
  /** Position in the original text */
  word_position: number;
  /** Part of speech (e.g., "名詞", "動詞") */
  pos: string;
  /** Dictionary/base form of the word */
  basic_form: string;
}

export type KuromojiState = 'idle' | 'loading' | 'ready' | 'error';

export interface KuromojiTokenizer {
  tokenize(text: string): KuromojiToken[];
}
