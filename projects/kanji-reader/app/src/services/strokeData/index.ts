/**
 * Stroke Data Service
 * 
 * Provides stroke data for Japanese characters with tiered loading:
 * 1. Bundled tier1/tier2 data (sync, always available)
 * 2. Local cache (AsyncStorage)
 * 3. Remote fetch (tier3 data from hosted CDN)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWritingCharacterType, getCodePointHex, WritingCharacterType } from '../../utils/characterType';

export interface Stroke {
  path: string;
  startX: number;
  startY: number;
}

export interface StrokeData {
  character: string;
  type: WritingCharacterType;
  strokeCount: number;
  strokes: Stroke[];
}

interface RawStrokeEntry {
  character: string;
  strokeCount: number;
  strokes: Stroke[];
}

type StrokeLookup = Record<string, RawStrokeEntry>;

const CACHE_PREFIX = 'stroke_data_';
const TIER3_BASE_URL = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/';

let tier1Data: StrokeLookup | null = null;
let tier2Data: StrokeLookup | null = null;
let indexData: Record<string, number> | null = null;

async function loadBundledData(): Promise<void> {
  if (tier1Data && tier2Data) return;
  
  try {
    tier1Data = require('../../../assets/stroke-data/tier1.json');
    tier2Data = require('../../../assets/stroke-data/tier2.json');
    indexData = require('../../../assets/stroke-data/index.json');
  } catch (error) {
    console.warn('Failed to load bundled stroke data:', error);
    tier1Data = {};
    tier2Data = {};
    indexData = {};
  }
}

function getBundledStrokeData(codePointHex: string): RawStrokeEntry | null {
  if (!tier1Data || !tier2Data) return null;
  
  return tier1Data[codePointHex] || tier2Data[codePointHex] || null;
}

async function getCachedStrokeData(codePointHex: string): Promise<RawStrokeEntry | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${codePointHex}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to read stroke cache:', error);
  }
  return null;
}

async function cacheStrokeData(codePointHex: string, data: RawStrokeEntry): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${codePointHex}`, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache stroke data:', error);
  }
}

function parseSVGPath(svgContent: string): RawStrokeEntry | null {
  const strokes: Stroke[] = [];
  
  const withoutNumbers = svgContent.replace(/<g[^>]*id="kvg:StrokeNumbers[^"]*"[^>]*>[\s\S]*?<\/g>/gi, '');
  const pathRegex = /<path[^>]*\sd="([^"]+)"[^>]*>/gi;
  let match;
  
  while ((match = pathRegex.exec(withoutNumbers)) !== null) {
    const pathData = match[1].trim();
    if (!pathData) continue;
    
    const startMatch = pathData.match(/^[Mm]\s*([-\d.]+)[,\s]+([-\d.]+)/);
    let startX = 0, startY = 0;
    
    if (startMatch) {
      startX = parseFloat(startMatch[1]) / 109;
      startY = parseFloat(startMatch[2]) / 109;
    }
    
    strokes.push({
      path: pathData,
      startX: Math.round(startX * 1000) / 1000,
      startY: Math.round(startY * 1000) / 1000
    });
  }
  
  if (strokes.length === 0) return null;
  
  return {
    character: '',
    strokeCount: strokes.length,
    strokes
  };
}

async function fetchRemoteStrokeData(codePointHex: string, character: string): Promise<RawStrokeEntry | null> {
  try {
    const paddedHex = codePointHex.padStart(5, '0');
    const url = `${TIER3_BASE_URL}${paddedHex}.svg`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Remote stroke data not found: ${url}`);
      return null;
    }
    
    const svgContent = await response.text();
    const parsed = parseSVGPath(svgContent);
    
    if (parsed) {
      parsed.character = character;
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch remote stroke data:', error);
    return null;
  }
}

export async function getStrokeData(character: string): Promise<StrokeData | null> {
  if (!character || character.length === 0) return null;
  
  const type = getWritingCharacterType(character);
  if (type === 'unknown') return null;
  
  const codePointHex = getCodePointHex(character);
  if (!codePointHex) return null;
  
  await loadBundledData();
  
  const bundled = getBundledStrokeData(codePointHex);
  if (bundled) {
    return {
      ...bundled,
      type
    };
  }
  
  const cached = await getCachedStrokeData(codePointHex);
  if (cached) {
    return {
      ...cached,
      type
    };
  }
  
  const remote = await fetchRemoteStrokeData(codePointHex, character);
  if (remote) {
    await cacheStrokeData(codePointHex, remote);
    return {
      ...remote,
      type
    };
  }
  
  return null;
}

export async function preloadStrokeData(characters: string[]): Promise<void> {
  await loadBundledData();
  
  const toFetch: string[] = [];
  
  for (const char of characters) {
    const type = getWritingCharacterType(char);
    if (type === 'unknown') continue;
    
    const codePointHex = getCodePointHex(char);
    const bundled = getBundledStrokeData(codePointHex);
    
    if (!bundled) {
      const cached = await getCachedStrokeData(codePointHex);
      if (!cached) {
        toFetch.push(char);
      }
    }
  }
  
  await Promise.all(toFetch.map(char => getStrokeData(char)));
}

export function isStrokeDataBundled(character: string): boolean {
  const codePointHex = getCodePointHex(character);
  if (!indexData) return false;
  const tier = indexData[codePointHex];
  return tier === 1 || tier === 2;
}

export async function clearStrokeCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const strokeKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(strokeKeys);
  } catch (error) {
    console.warn('Failed to clear stroke cache:', error);
  }
}
