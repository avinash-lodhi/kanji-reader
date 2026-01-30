/**
 * KanjiReader App
 * 
 * Japanese Kanji learning app through camera scanning and pronunciation.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { ErrorBoundary } from './src/components';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Navigation />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
