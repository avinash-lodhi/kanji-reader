export interface DictionaryEntry {
  word: string;
  reading: string;
  meanings: string[];
  partsOfSpeech: string[];
  isCommon: boolean;
  jlptLevel: number | null;
}

export interface JishoJapanese {
  word?: string;
  reading: string;
}

export interface JishoSense {
  english_definitions: string[];
  parts_of_speech: string[];
}

export interface JishoEntry {
  slug: string;
  japanese: JishoJapanese[];
  senses: JishoSense[];
  is_common: boolean;
  jlpt: string[];
}

export interface JishoResponse {
  data: JishoEntry[];
}
