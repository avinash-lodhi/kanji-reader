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

describe('joinMorphemes', () => {
  describe('verb + auxiliary verb joining', () => {
    it('should join 食べ + た → 食べた (past tense)', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('た', '助動詞', 'タ', 'た'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('食べた');
      expect(result[0].reading).toBe('タベタ');
    });

    it('should join 感じ + た → 感じた', () => {
      const tokens = [
        createToken('感じ', '動詞', 'カンジ', '感じる'),
        createToken('た', '助動詞', 'タ', 'た'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('感じた');
    });

    it('should join 食べ + ない → 食べない (negative)', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('ない', '助動詞', 'ナイ', 'ない'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('食べない');
    });

    it('should join 書こ + う → 書こう (volitional)', () => {
      const tokens = [
        createToken('書こ', '動詞', 'カコ', '書く'),
        createToken('う', '助動詞', 'ウ', 'う'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('書こう');
    });

    it('should join 行き + ます → 行きます (polite)', () => {
      const tokens = [
        createToken('行き', '動詞', 'イキ', '行く'),
        createToken('ます', '助動詞', 'マス', 'ます'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('行きます');
    });

    it('should join 食べ + たい → 食べたい (want to)', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('たい', '助動詞', 'タイ', 'たい'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('食べたい');
    });
  });

  describe('verb + joining particle', () => {
    it('should join 飲ん + で → 飲んで (te-form)', () => {
      const tokens = [
        createToken('飲ん', '動詞', 'ノン', '飲む'),
        createToken('で', '助詞', 'デ', 'で'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('飲んで');
    });

    it('should join 食べ + て → 食べて (te-form)', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('て', '助詞', 'テ', 'て'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('食べて');
    });

    it('should join 行け + ば → 行けば (conditional)', () => {
      const tokens = [
        createToken('行け', '動詞', 'イケ', '行く'),
        createToken('ば', '助詞', 'バ', 'ば'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('行けば');
    });
  });

  describe('compound verb chains', () => {
    it('should join 思い出し + て → 思い出して', () => {
      const tokens = [
        createToken('思い出し', '動詞', 'オモイダシ', '思い出す'),
        createToken('て', '助詞', 'テ', 'て'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('思い出して');
    });

    it('should join 食べ + て + いる → 食べている', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('て', '助詞', 'テ', 'て'),
        createToken('いる', '動詞', 'イル', 'いる'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('食べている');
    });

    it('should join 食べ + て + い + た → 食べていた', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('て', '助詞', 'テ', 'て'),
        createToken('い', '動詞', 'イ', 'いる'),
        createToken('た', '助動詞', 'タ', 'た'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('食べていた');
    });

    it('should join 行き + ませ + ん → 行きません', () => {
      const tokens = [
        createToken('行き', '動詞', 'イキ', '行く'),
        createToken('ませ', '助動詞', 'マセ', 'ます'),
        createToken('ん', '助動詞', 'ン', 'ん'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('行きません');
    });
  });

  describe('i-adjective joining', () => {
    it('should join 高 + かっ + た → 高かった (past i-adjective)', () => {
      const tokens = [
        createToken('高', '形容詞', 'タカ', '高い'),
        createToken('かっ', '助動詞', 'カッ', 'た'),
        createToken('た', '助動詞', 'タ', 'た'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('高かった');
    });

    it('should join 寒 + く + ない → 寒くない', () => {
      const tokens = [
        createToken('寒', '形容詞', 'サム', '寒い'),
        createToken('く', '助動詞', 'ク', 'く'),
        createToken('ない', '助動詞', 'ナイ', 'ない'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('寒くない');
    });
  });

  describe('non-joining cases', () => {
    it('should NOT join noun + particle (猫 + は)', () => {
      const tokens = [
        createToken('猫', '名詞', 'ネコ', '猫'),
        createToken('は', '助詞', 'ハ', 'は'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(2);
      expect(result[0].surface_form).toBe('猫');
      expect(result[1].surface_form).toBe('は');
    });

    it('should NOT join noun + を', () => {
      const tokens = [
        createToken('本', '名詞', 'ホン', '本'),
        createToken('を', '助詞', 'ヲ', 'を'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(2);
      expect(result[0].surface_form).toBe('本');
      expect(result[1].surface_form).toBe('を');
    });

    it('should NOT join noun + が', () => {
      const tokens = [
        createToken('水', '名詞', 'ミズ', '水'),
        createToken('が', '助詞', 'ガ', 'が'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(2);
      expect(result[0].surface_form).toBe('水');
      expect(result[1].surface_form).toBe('が');
    });

    it('should keep unrelated tokens separate', () => {
      const tokens = [
        createToken('私', '名詞', 'ワタシ', '私'),
        createToken('は', '助詞', 'ハ', 'は'),
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('た', '助動詞', 'タ', 'た'),
      ];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(3);
      expect(result[0].surface_form).toBe('私');
      expect(result[1].surface_form).toBe('は');
      expect(result[2].surface_form).toBe('食べた');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const result = joinMorphemes([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single token', () => {
      const tokens = [createToken('猫', '名詞', 'ネコ', '猫')];
      const result = joinMorphemes(tokens);
      expect(result).toHaveLength(1);
      expect(result[0].surface_form).toBe('猫');
    });

    it('should preserve original POS after joining', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる'),
        createToken('た', '助動詞', 'タ', 'た'),
      ];
      const result = joinMorphemes(tokens);
      expect(result[0].pos).toBe('動詞');
      expect(result[0].basic_form).toBe('食べる');
    });

    it('should preserve word_position of first token', () => {
      const tokens = [
        createToken('食べ', '動詞', 'タベ', '食べる', 5),
        createToken('た', '助動詞', 'タ', 'た', 7),
      ];
      const result = joinMorphemes(tokens);
      expect(result[0].word_position).toBe(5);
    });
  });
});
