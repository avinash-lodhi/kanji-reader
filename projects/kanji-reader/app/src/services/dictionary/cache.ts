import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DictionaryEntry } from './types';

const CACHE_KEY = 'dictionary_cache';
const MAX_ENTRIES = 500;

class DictionaryCache {
  private memory: Map<string, DictionaryEntry[]> = new Map();
  private accessOrder: string[] = [];

  async get(word: string): Promise<DictionaryEntry[] | null> {
    if (this.memory.has(word)) {
      this.updateAccessOrder(word);
      return this.memory.get(word)!;
    }

    try {
      const stored = await AsyncStorage.getItem(`${CACHE_KEY}:${word}`);
      if (stored) {
        const entries = JSON.parse(stored);
        this.memory.set(word, entries);
        this.updateAccessOrder(word);
        return entries;
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  async set(word: string, entries: DictionaryEntry[]): Promise<void> {
    this.memory.set(word, entries);
    this.updateAccessOrder(word);

    if (this.memory.size > MAX_ENTRIES) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.memory.delete(lruKey);
        try {
          await AsyncStorage.removeItem(`${CACHE_KEY}:${lruKey}`);
        } catch (error) {
          console.warn('Cache eviction error:', error);
        }
      }
    }

    try {
      await AsyncStorage.setItem(`${CACHE_KEY}:${word}`, JSON.stringify(entries));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  private updateAccessOrder(word: string): void {
    const index = this.accessOrder.indexOf(word);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(word);
  }

  async clear(): Promise<void> {
    this.memory.clear();
    this.accessOrder = [];
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_KEY));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }
}

export const dictionaryCache = new DictionaryCache();
