/**
 * Morpheme Joiner
 * 
 * Post-processes Kuromoji tokens to join verb stems with their auxiliary endings.
 * Fixes issues like '感じた' being split into '感じ' + 'た'.
 */

import type { KuromojiToken } from '../kuromoji/types';

/**
 * Part-of-speech categories in Japanese
 */
const POS = {
  VERB: '動詞',
  AUX_VERB: '助動詞',
  PARTICLE: '助詞',
  I_ADJECTIVE: '形容詞',
  SUFFIX: '接尾辞',
  NOUN: '名詞',
} as const;

/**
 * Particles that should join with the preceding verb (conjunctive particles)
 */
const JOINING_PARTICLES = new Set(['て', 'で', 'ば', 'たら', 'たり', 'ながら', 'つつ']);

/**
 * Auxiliary verbs that typically attach to verb stems
 */
const AUXILIARY_ENDINGS = new Set([
  'た', 'だ',      // past tense
  'ない', 'ぬ',    // negative
  'ます',          // polite
  'れる', 'られる', // passive/potential
  'せる', 'させる', // causative
  'たい',          // want to
  'う', 'よう',    // volitional
  'そう',          // seems like
  'らしい',        // appears to be
  'べき',          // should
]);

/**
 * Check if a token is a verb
 */
function isVerb(token: KuromojiToken): boolean {
  return token.pos.startsWith(POS.VERB);
}

/**
 * Check if a token is an i-adjective
 */
function isIAdjective(token: KuromojiToken): boolean {
  return token.pos.startsWith(POS.I_ADJECTIVE);
}

/**
 * Check if a token is an auxiliary verb
 */
function isAuxiliaryVerb(token: KuromojiToken): boolean {
  return token.pos.startsWith(POS.AUX_VERB);
}

/**
 * Check if a token is a suffix
 */
function isSuffix(token: KuromojiToken): boolean {
  return token.pos.startsWith(POS.SUFFIX);
}

/**
 * Check if a particle should join with the preceding verb
 */
function isJoiningParticle(token: KuromojiToken): boolean {
  if (!token.pos.startsWith(POS.PARTICLE)) {
    return false;
  }
  return JOINING_PARTICLES.has(token.surface_form);
}

/**
 * Check if the current token should join with the previous token
 */
function shouldJoinWithPrevious(
  prev: KuromojiToken,
  current: KuromojiToken
): boolean {
  // Verb + auxiliary verb (食べ + た → 食べた)
  if (isVerb(prev) && isAuxiliaryVerb(current)) {
    return true;
  }

  // Verb + joining particle (飲ん + で → 飲んで)
  if (isVerb(prev) && isJoiningParticle(current)) {
    return true;
  }

  // Verb + suffix
  if (isVerb(prev) && isSuffix(current)) {
    return true;
  }

  // I-adjective + auxiliary verb (高 + かっ + た → 高かった)
  if (isIAdjective(prev) && isAuxiliaryVerb(current)) {
    return true;
  }

  // Auxiliary verb + auxiliary verb (chained: ませ + ん → ません)
  if (isAuxiliaryVerb(prev) && isAuxiliaryVerb(current)) {
    return true;
  }

  // Auxiliary verb + joining particle (食べ + た + ら → 食べたら)
  if (isAuxiliaryVerb(prev) && isJoiningParticle(current)) {
    return true;
  }

  // Joining particle + auxiliary verb (て + いる → ている)
  if (isJoiningParticle(prev) && isAuxiliaryVerb(current)) {
    return true;
  }

  // Joining particle + verb continuation (て + い → てい as part of ている)
  if (isJoiningParticle(prev) && isVerb(current)) {
    // Only join if the verb is a common auxiliary-like verb
    const auxLikeVerbs = new Set(['いる', 'ある', 'おく', 'みる', 'しまう', 'くる', 'いく']);
    if (auxLikeVerbs.has(current.basic_form)) {
      return true;
    }
  }

  return false;
}

/**
 * Join Kuromoji tokens that form a single grammatical unit.
 * Combines verb stems with their auxiliary endings.
 */
export function joinMorphemes(tokens: KuromojiToken[]): KuromojiToken[] {
  if (tokens.length === 0) {
    return [];
  }

  const result: KuromojiToken[] = [];
  let i = 0;

  while (i < tokens.length) {
    const current = tokens[i];
    
    // Start a new potential compound
    let compound = { ...current };
    let j = i + 1;

    // Keep joining while conditions are met
    while (j < tokens.length && shouldJoinWithPrevious(tokens[j - 1], tokens[j])) {
      const next = tokens[j];
      
      // Combine surface forms and readings
      compound = {
        surface_form: compound.surface_form + next.surface_form,
        reading: (compound.reading || '') + (next.reading || ''),
        word_position: compound.word_position,
        pos: compound.pos, // Keep original POS (the main verb/adjective)
        basic_form: compound.basic_form, // Keep original basic form
      };
      
      j++;
    }

    result.push(compound);
    i = j;
  }

  return result;
}
