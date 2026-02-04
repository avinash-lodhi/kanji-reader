/**
 * KanjiReader App
 * 
 * Japanese Kanji learning app through camera scanning and pronunciation.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Navigation } from './src/navigation';
import { ErrorBoundary } from './src/components';
import { kuromojiService } from './src/services/kuromoji';

export default function App() {
  useEffect(() => {
    kuromojiService.initialize().catch((error) => {
      console.warn('Kuromoji initialization failed:', error);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Navigation />
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
