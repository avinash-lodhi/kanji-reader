import type { DictionaryEntry, JishoEntry, JishoResponse } from './types';
import { dictionaryCache } from './cache';

const JISHO_API = 'https://jisho.org/api/v1/search/words';

function parseJlptLevel(jlpt: string[]): number | null {
  if (!jlpt || jlpt.length === 0) return null;
  const match = jlpt[0].match(/jlpt-n(\d)/);
  return match ? parseInt(match[1], 10) : null;
}

function parseEntry(entry: JishoEntry): DictionaryEntry {
  const jp = entry.japanese[0];
  return {
    word: jp.word || jp.reading,
    reading: jp.reading,
    meanings: entry.senses.flatMap((s) => s.english_definitions),
    partsOfSpeech: entry.senses.flatMap((s) => s.parts_of_speech),
    isCommon: entry.is_common ?? false,
    jlptLevel: parseJlptLevel(entry.jlpt),
  };
}

export async function lookupWord(word: string): Promise<DictionaryEntry[]> {
  const cached = await dictionaryCache.get(word);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${JISHO_API}?keyword=${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      throw new Error(`Jisho API error: ${response.status} ${response.statusText}`);
    }

    const data: JishoResponse = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('Jisho returned malformed response:', data);
      return [];
    }

    const entries = data.data.map(parseEntry);
    await dictionaryCache.set(word, entries);
    return entries;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Network')) {
      throw new Error('Network error: Unable to reach Jisho API');
    }
    throw error;
  }
}

export async function lookupFirst(word: string): Promise<DictionaryEntry | null> {
  const entries = await lookupWord(word);
  return entries.length > 0 ? entries[0] : null;
}
