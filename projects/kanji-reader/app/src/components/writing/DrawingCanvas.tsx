/**
 * DrawingCanvas Component
 * 
 * Touch-input drawing surface for stroke practice.
 * Captures finger movements and renders them as SVG polylines.
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
  currentStrokes?: RenderedStroke[];
  activeColor?: string;
  disabled?: boolean;
  showGrid?: boolean;
}

export function DrawingCanvas({
  size,
  onStrokeComplete,
  currentStrokes = [],
  activeColor = colors.primary,
  disabled = false,
  showGrid = true,
}: DrawingCanvasProps) {
  const [activePoints, setActivePoints] = useState<Point[]>([]);
  
  // Use refs to avoid stale closures in gesture callbacks.
  // Gesture handlers capture callbacks at gesture start and don't update mid-gesture,
  // so reading state directly in onUpdate/onEnd gives stale values.
  const activePointsRef = useRef<Point[]>([]);
  const onStrokeCompleteRef = useRef(onStrokeComplete);
  onStrokeCompleteRef.current = onStrokeComplete;

  const normalizePoint = useCallback((x: number, y: number): Point => {
    return {
      x: Math.max(0, Math.min(1, x / size)),
      y: Math.max(0, Math.min(1, y / size)),
    };
  }, [size]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart((event) => {
      const point = normalizePoint(event.x, event.y);
      activePointsRef.current = [point];
      setActivePoints([point]);
    })
    .onUpdate((event) => {
      const point = normalizePoint(event.x, event.y);
      activePointsRef.current = [...activePointsRef.current, point];
      setActivePoints([...activePointsRef.current]);
    })
    .onEnd(() => {
      if (activePointsRef.current.length > 0) {
        onStrokeCompleteRef.current(activePointsRef.current);
      }
      activePointsRef.current = [];
      setActivePoints([]);
    })
    .onFinalize(() => {
      activePointsRef.current = [];
      setActivePoints([]);
    })
    .minDistance(0)
    .shouldCancelWhenOutside(false);

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
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { width: size, height: size }]}>
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
    </GestureDetector>
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
