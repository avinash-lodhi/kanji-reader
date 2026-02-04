/**
 * DrawingCanvas Component
 * 
 * Touch-input drawing surface for stroke practice.
 * Uses React Native's PanResponder (not RNGH) to avoid native gesture
 * handler crashes on New Architecture + Reanimated setups.
 */

import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent } from 'react-native';
import Svg, { Polyline, Path, Line } from 'react-native-svg';
import { colors } from '../../constants/colors';

export interface Point {
  x: number;
  y: number;
}

export interface RenderedStroke {
  points: Point[];
  color: string;
  isCorrect?: boolean;
}

interface DrawingCanvasProps {
  size: number;
  onStrokeComplete: (points: Point[]) => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  currentStrokes?: RenderedStroke[];
  activeColor?: string;
  disabled?: boolean;
  showGrid?: boolean;
}

export function DrawingCanvas({
  size,
  onStrokeComplete,
  onDrawingStateChange,
  currentStrokes = [],
  activeColor = colors.primary,
  disabled = false,
  showGrid = true,
}: DrawingCanvasProps) {
  const [activePoints, setActivePoints] = useState<Point[]>([]);
  
  // Refs to hold current values for PanResponder callbacks (created once via useMemo)
  const activePointsRef = useRef<Point[]>([]);
  const onStrokeCompleteRef = useRef(onStrokeComplete);
  const disabledRef = useRef(disabled);
  const sizeRef = useRef(size);
  const onDrawingStateChangeRef = useRef(onDrawingStateChange);
  onStrokeCompleteRef.current = onStrokeComplete;
  onDrawingStateChangeRef.current = onDrawingStateChange;
  disabledRef.current = disabled;
  sizeRef.current = size;

  const normalizePoint = (x: number, y: number): Point => {
    const s = sizeRef.current;
    return {
      x: Math.max(0, Math.min(1, x / s)),
      y: Math.max(0, Math.min(1, y / s)),
    };
  };

  const extractLocation = (e: GestureResponderEvent): { x: number; y: number } => {
    return {
      x: e.nativeEvent.locationX,
      y: e.nativeEvent.locationY,
    };
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabledRef.current,
        onMoveShouldSetPanResponder: () => !disabledRef.current,
        // Capture phase: intercept touch BEFORE ScrollView can claim it
        onStartShouldSetPanResponderCapture: () => !disabledRef.current,
        onMoveShouldSetPanResponderCapture: () => !disabledRef.current,
        onPanResponderTerminationRequest: () => false, // don't let ScrollView steal the gesture

        onPanResponderGrant: (e) => {
          const { x, y } = extractLocation(e);
          const point = normalizePoint(x, y);
          activePointsRef.current = [point];
          setActivePoints([point]);
          onDrawingStateChangeRef.current?.(true);
        },

        onPanResponderMove: (e) => {
          const { x, y } = extractLocation(e);
          const point = normalizePoint(x, y);
          activePointsRef.current = [...activePointsRef.current, point];
          setActivePoints([...activePointsRef.current]);
        },

        onPanResponderRelease: () => {
          if (activePointsRef.current.length > 0) {
            onStrokeCompleteRef.current(activePointsRef.current);
          }
          activePointsRef.current = [];
          setActivePoints([]);
          onDrawingStateChangeRef.current?.(false);
        },

        onPanResponderTerminate: () => {
          activePointsRef.current = [];
          setActivePoints([]);
          onDrawingStateChangeRef.current?.(false);
        },
      }),
    [] // stable — reads current values from refs
  );

  const pointsToSvgString = (points: Point[]): string => {
    return points.map(p => `${p.x * size},${p.y * size}`).join(' ');
  };

  const pointsToPath = (points: Point[]): string => {
    if (points.length < 2) return '';
    
    const scaledPoints = points.map(p => ({
      x: p.x * size,
      y: p.y * size,
    }));
    
    let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
    for (let i = 1; i < scaledPoints.length; i++) {
      path += ` L ${scaledPoints[i].x} ${scaledPoints[i].y}`;
    }
    return path;
  };

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      {...panResponder.panHandlers}
    >
      <Svg width={size} height={size}>
        {showGrid && (
          <>
            <Line
              x1={size / 2}
              y1={0}
              x2={size / 2}
              y2={size}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
            <Line
              x1={0}
              y1={size / 2}
              x2={size}
              y2={size / 2}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
            <Line
              x1={0}
              y1={0}
              x2={size}
              y2={size}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="5,5"
              opacity={0.5}
            />
            <Line
              x1={size}
              y1={0}
              x2={0}
              y2={size}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="5,5"
              opacity={0.5}
            />
          </>
        )}

        {currentStrokes.map((stroke, index) => (
          <Path
            key={index}
            d={pointsToPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}

        {activePoints.length > 0 && (
          <Polyline
            points={pointsToSvgString(activePoints)}
            stroke={activeColor}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
      
      {disabled && <View style={styles.disabledOverlay} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default DrawingCanvas;
