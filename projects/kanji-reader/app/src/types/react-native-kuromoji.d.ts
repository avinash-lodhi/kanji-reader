declare module '@fotone/react-native-kuromoji' {
  import type { Asset } from 'expo-asset';

  export interface KuromojiToken {
    surface_form: string;
    reading: string;
    word_position: number;
    pos: string;
    basic_form: string;
    pos_detail_1?: string;
    pos_detail_2?: string;
    pos_detail_3?: string;
    conjugated_type?: string;
    conjugated_form?: string;
    pronunciation?: string;
  }

  export interface KuromojiTokenizer {
    tokenize(text: string): KuromojiToken[];
  }

  export interface BuilderOptions {
    assets: Record<string, Asset>;
  }

  export interface TokenizerBuilder {
    build(callback: (err: Error | null, tokenizer: KuromojiTokenizer) => void): void;
  }

  export function builder(options: BuilderOptions): TokenizerBuilder;

  const kuromoji: {
    builder(options: BuilderOptions): TokenizerBuilder;
  };

  export default kuromoji;
}
