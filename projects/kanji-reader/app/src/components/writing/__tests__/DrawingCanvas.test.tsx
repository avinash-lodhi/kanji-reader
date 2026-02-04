/**
 * DrawingCanvas Component Tests (KanjiReader-e8c.8.4)
 *
 * Tests the touch drawing surface, ensuring touch events are captured
 * and propagated as strokes.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { DrawingCanvas } from '../DrawingCanvas';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// --- Mocks -----------------------------------------------------------------

// Mock React Native SVG
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} testID="Svg" />,
    Path: (props: any) => <View {...props} testID="Path" />,
    Polyline: (props: any) => <View {...props} testID="Polyline" />,
    Line: (props: any) => <View {...props} testID="Line" />,
  };
});

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: (props: any) => <View {...props} />,
    GestureDetector: (props: any) => <View {...props} />,
    Gesture: {
      Pan: () => ({
        enabled: () => ({
          onStart: () => ({
            onUpdate: () => ({
              onEnd: () => ({
                onFinalize: () => ({
                  minDistance: () => ({
                    shouldCancelWhenOutside: () => ({}),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    },
  };
});

describe('DrawingCanvas', () => {
  const mockOnStrokeComplete = jest.fn();

  beforeEach(() => {
    mockOnStrokeComplete.mockClear();
  });

  it('renders correctly', () => {
    const { toJSON } = render(
      <GestureHandlerRootView>
        <DrawingCanvas
          size={300}
          onStrokeComplete={mockOnStrokeComplete}
        />
      </GestureHandlerRootView>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders existing strokes', () => {
    const currentStrokes = [
      {
        points: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 }],
        color: 'red',
      },
    ];

    const { getAllByTestId } = render(
      <GestureHandlerRootView>
        <DrawingCanvas
          size={300}
          onStrokeComplete={mockOnStrokeComplete}
          currentStrokes={currentStrokes}
        />
      </GestureHandlerRootView>
    );

    // Should find Paths for existing strokes
    const paths = getAllByTestId('Path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('shows grid when showGrid is true', () => {
    const { getAllByTestId } = render(
      <GestureHandlerRootView>
        <DrawingCanvas
          size={300}
          onStrokeComplete={mockOnStrokeComplete}
          showGrid={true}
        />
      </GestureHandlerRootView>
    );

    // Grid lines are Lines
    const lines = getAllByTestId('Line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('does not show grid when showGrid is false', () => {
    const { queryAllByTestId } = render(
      <GestureHandlerRootView>
        <DrawingCanvas
          size={300}
          onStrokeComplete={mockOnStrokeComplete}
          showGrid={false}
        />
      </GestureHandlerRootView>
    );

    const lines = queryAllByTestId('Line');
    expect(lines.length).toBe(0);
  });

  it('renders disabled overlay when disabled is true', () => {
    const { toJSON } = render(
      <GestureHandlerRootView>
        <DrawingCanvas
          size={300}
          onStrokeComplete={mockOnStrokeComplete}
          disabled={true}
        />
      </GestureHandlerRootView>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
