/**
 * Integration tests for segmentation with morpheme joining
 * Tests realistic OCR output scenarios
 */

import { joinMorphemes } from '../morphemeJoiner';
import type { KuromojiToken } from '../../kuromoji/types';

function createToken(
  surface_form: string,
  pos: string,
  reading = '',
  basic_form = surface_form,
  word_position = 1
): KuromojiToken {
  return { surface_form, pos, reading, basic_form, word_position };
}

describe('Integration: Real OCR output scenarios', () => {
  describe('Common verb conjugation patterns from OCR', () => {
    it('should handle "私は本を読んでいます" (I am reading a book)', () => {
      const tokens = [
        createToken('私', '名詞', 'ワタシ', '私', 1),
        createToken('は', '助詞', 'ハ', 'は', 2),
        createToken('本', '名詞', 'ホン', '本', 3),
        createToken('を', '助詞', 'ヲ', 'を', 4),
        createToken('読ん', '動詞', 'ヨン', '読む', 5),
        createToken('で', '助詞', 'デ', 'で', 7),
        createToken('い', '動詞', 'イ', 'いる', 8),
        createToken('ます', '助動詞', 'マス', 'ます', 9),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result.map(t => t.surface_form)).toEqual([
        '私', 'は', '本', 'を', '読んでいます'
      ]);
    });

    it('should handle "彼女は泣いていた" (She was crying)', () => {
      const tokens = [
        createToken('彼女', '名詞', 'カノジョ', '彼女', 1),
        createToken('は', '助詞', 'ハ', 'は', 3),
        createToken('泣い', '動詞', 'ナイ', '泣く', 4),
        createToken('て', '助詞', 'テ', 'て', 6),
        createToken('い', '動詞', 'イ', 'いる', 7),
        createToken('た', '助動詞', 'タ', 'た', 8),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result.map(t => t.surface_form)).toEqual([
        '彼女', 'は', '泣いていた'
      ]);
    });

    it('should handle "食べたくない" (don\'t want to eat)', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる', 1),
        createToken('たく', '助動詞', 'タク', 'たい', 3),
        createToken('ない', '助動詞', 'ナイ', 'ない', 5),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result.map(t => t.surface_form)).toEqual(['食べたくない']);
    });

    it('should handle "行かなければならない" (must go)', () => {
      const tokens = [
        createToken('行か', '動詞', 'イカ', '行く', 1),
        createToken('なけれ', '助動詞', 'ナケレ', 'ない', 3),
        createToken('ば', '助詞', 'バ', 'ば', 6),
        createToken('なら', '助動詞', 'ナラ', 'なる', 7),
        createToken('ない', '助動詞', 'ナイ', 'ない', 9),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result.map(t => t.surface_form)).toEqual(['行かなければならない']);
    });
  });

  describe('Mixed sentence patterns', () => {
    it('should handle "今日は暑かった" (Today was hot)', () => {
      const tokens = [
        createToken('今日', '名詞', 'キョウ', '今日', 1),
        createToken('は', '助詞', 'ハ', 'は', 3),
        createToken('暑', '形容詞', 'アツ', '暑い', 4),
        createToken('かっ', '助動詞', 'カッ', 'た', 5),
        createToken('た', '助動詞', 'タ', 'た', 7),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result.map(t => t.surface_form)).toEqual([
        '今日', 'は', '暑かった'
      ]);
    });

    it('should handle sentence with multiple verbs', () => {
      const tokens = [
        createToken('朝', '名詞', 'アサ', '朝', 1),
        createToken('起き', '動詞', 'オキ', '起きる', 2),
        createToken('て', '助詞', 'テ', 'て', 4),
        createToken('、', '記号', '', '、', 5),
        createToken('ご飯', '名詞', 'ゴハン', 'ご飯', 6),
        createToken('を', '助詞', 'ヲ', 'を', 8),
        createToken('食べ', '動詞', 'タベ', '食べる', 9),
        createToken('た', '助動詞', 'タ', 'た', 11),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result.map(t => t.surface_form)).toEqual([
        '朝', '起きて', '、', 'ご飯', 'を', '食べた'
      ]);
    });
  });

  describe('Original problem cases from issue', () => {
    it('should fix "感じた" → not "感じ" + "た"', () => {
      const tokens = [
        createToken('感じ', '動詞', 'カンジ', '感じる', 1),
        createToken('た', '助動詞', 'タ', 'た', 3),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('感じた');
    });

    it('should fix "思い出して" → not "思い出し" + "て"', () => {
      const tokens = [
        createToken('思い出し', '動詞', 'オモイダシ', '思い出す', 1),
        createToken('て', '助詞', 'テ', 'て', 5),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('思い出して');
    });

    it('should fix "書こう" → not "書こ" + "う"', () => {
      const tokens = [
        createToken('書こ', '動詞', 'カコ', '書く', 1),
        createToken('う', '助動詞', 'ウ', 'う', 3),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('書こう');
    });
  });

  describe('Readings are correctly combined', () => {
    it('should combine readings for joined morphemes', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる', 1),
        createToken('て', '助詞', 'テ', 'て', 3),
        createToken('いる', '動詞', 'イル', 'いる', 4),
      ];
      const result = joinMorphemes(tokens);
      
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('食べている');
      expect(result[0].reading).toBe('タベテイル');
    });
  });
});
