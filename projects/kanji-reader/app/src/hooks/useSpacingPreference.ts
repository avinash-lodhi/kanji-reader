import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPACING_PREFERENCE_KEY = '@kanjireader:compact_spacing';

export function useSpacingPreference() {
  const [compactMode, setCompactMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SPACING_PREFERENCE_KEY)
      .then((value) => {
        if (value !== null) {
          setCompactMode(value === 'true');
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const toggleCompactMode = useCallback(async () => {
    const newValue = !compactMode;
    setCompactMode(newValue);
    await AsyncStorage.setItem(SPACING_PREFERENCE_KEY, String(newValue));
  }, [compactMode]);

  return { compactMode, toggleCompactMode, isLoaded };
}
