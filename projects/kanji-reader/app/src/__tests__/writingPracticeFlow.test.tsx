/**
 * Writing Practice Integration Flow (KanjiReader-e8c.8.5)
 *
 * Tests the full user journey:
 * 1. Open word popup
 * 2. Navigate to practice screen
 * 3. Complete strokes (simulated)
 * 4. Add to practice list
 * 5. Verify persistence
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { usePracticeStore } from '../store/practiceStore';
import { WritingPracticeScreen } from '../screens/WritingPracticeScreen';
import { PracticeListScreen } from '../screens/PracticeListScreen';
import { DetailPanel } from '../components/DetailPanel';
import { View, Text, Button } from 'react-native';

// --- Mocks -----------------------------------------------------------------

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Stroke Data Service
jest.mock('../services/strokeData', () => ({
  getStrokeData: jest.fn(() => Promise.resolve({
    character: '日',
    strokeCount: 1,
    strokes: [{ path: 'M 0 0 L 100 100', startX: 0, startY: 0 }],
    type: 'kanji',
  })),
}));

// Mock DrawingCanvas to allow simulating stroke completion
// We replace the real canvas with a fake one that has a button to "Draw"
jest.mock('../components/writing/DrawingCanvas', () => {
  const { View, Button } = require('react-native');
  return {
    DrawingCanvas: ({ onStrokeComplete, disabled }: any) => (
      <View testID="DrawingCanvas">
        <Button
          testID="SimulateStroke"
          title="Draw Stroke"
          onPress={() => onStrokeComplete([{ x: 0, y: 0 }, { x: 1, y: 1 }])}
          disabled={disabled}
        />
      </View>
    ),
  };
});

// Mock Stroke Validation to always pass
jest.mock('../utils/strokeValidation', () => ({
  validateStroke: () => ({
    isValid: true,
    confidence: 1,
    feedback: 'correct',
  }),
}));

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: (props: any) => <View {...props} />,
    PanGestureHandler: (props: any) => <View {...props} />,
    State: {},
    Directions: {},
  };
});

// Mock Bottom Sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({ children }: any, ref: any) => (
      <View testID="BottomSheet">{children}</View>
    )),
    BottomSheetView: (props: any) => <View {...props} />,
    BottomSheetBackdrop: (props: any) => <View {...props} />,
    useBottomSheet: () => ({
      expand: jest.fn(),
      close: jest.fn(),
      collapse: jest.fn(),
    }),
  };
});

// Setup Navigation
const Stack = createStackNavigator();

function TestNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WritingPractice" component={WritingPracticeScreen} />
        <Stack.Screen name="PracticeList" component={PracticeListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Dummy Home Screen that hosts the DetailPanel
function HomeScreen({ navigation }: any) {
  return (
    <View>
      <DetailPanel
        word={{ text: '日本', reading: 'にほん', romaji: 'nihon' }}
        entry={{ 
          reading: 'にほん', 
          meanings: ['Japan'], 
          partsOfSpeech: ['noun'],
          isCommon: true 
        }}
        isLoading={false}
        onClose={() => {}}
        onPlayAudio={() => {}}
      />
      <Button 
        title="Go to List" 
        onPress={() => navigation.navigate('PracticeList')} 
      />
    </View>
  );
}

describe('Writing Practice Integration Flow', () => {
  beforeEach(() => {
    // Reset store
    usePracticeStore.setState({
      words: [],
      characterProgress: {},
      _hasHydrated: true,
    });
  });

  it('completes the full practice flow', async () => {
    const { getByText, getByLabelText, findByText, getByTestId } = render(<TestNavigator />);

    // 1. Open Practice from Popup
    const practiceButton = getByLabelText('Practice writing this character');
    fireEvent.press(practiceButton);

    // 2. Verify navigation to WritingPracticeScreen
    // Should see the character "日" (first char of 日本)
    await findByText('日');
    
    // 3. Complete a stroke
    // The mocked DrawingCanvas has a button to simulate this
    const drawButton = getByTestId('SimulateStroke');
    fireEvent.press(drawButton);

    // 4. Verify completion state
    // "Complete!" badge should appear
    await findByText('Complete!');

    // 5. Add to Practice List
    const addButton = getByText('Add to Practice List');
    fireEvent.press(addButton);

    // Verify store updated first
    await waitFor(() => {
      const state = usePracticeStore.getState();
      expect(state.words.length).toBe(1);
    });

    // 6. Verify "In Practice List" badge appears
    await findByText('In Practice List');

    // 7. Check Store State
    const store = usePracticeStore.getState();
    expect(store.words[0].word).toBe('日');
    expect(store.characterProgress['日'].successes).toBe(1);
  });
});
