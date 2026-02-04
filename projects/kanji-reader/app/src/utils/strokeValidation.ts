/**
 * Stroke Validation Logic
 * 
 * Compares user-drawn strokes against reference KanjiVG strokes.
 * Uses geometric comparison for deterministic, offline validation.
 */

import { Stroke } from '../services/strokeData';

export interface Point {
  x: number;
  y: number;
}

export type StrokeFeedback = 
  | 'correct' 
  | 'wrong_direction' 
  | 'wrong_start' 
  | 'wrong_shape'
  | 'too_short';

export interface StrokeValidationResult {
  isValid: boolean;
  confidence: number;
  feedback: StrokeFeedback;
}

interface ValidationConfig {
  startTolerance: number;
  endTolerance: number;
  directionTolerance: number;
  shapeTolerance: number;
  minPointCount: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  startTolerance: 0.25,
  endTolerance: 0.35,
  directionTolerance: 45,
  shapeTolerance: 0.35,
  minPointCount: 3,
};

function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function angle(from: Point, to: Point): number {
  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

function angleDifference(a1: number, a2: number): number {
  let diff = Math.abs(a1 - a2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function parseStrokeEndpoint(stroke: Stroke): Point {
  const pathData = stroke.path;
  
  const matches = pathData.match(/-?[\d.]+/g);
  if (!matches || matches.length < 2) {
    return { x: stroke.startX, y: stroke.startY };
  }
  
  const lastX = parseFloat(matches[matches.length - 2]) / 109;
  const lastY = parseFloat(matches[matches.length - 1]) / 109;
  
  return { x: lastX, y: lastY };
}

function samplePoints(points: Point[], sampleCount: number): Point[] {
  if (points.length <= sampleCount) return [...points];
  
  const result: Point[] = [];
  const step = (points.length - 1) / (sampleCount - 1);
  
  for (let i = 0; i < sampleCount; i++) {
    const index = Math.min(Math.round(i * step), points.length - 1);
    result.push(points[index]);
  }
  
  return result;
}

function computePathLength(points: Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }
  return length;
}

export function validateStroke(
  userPoints: Point[],
  referenceStroke: Stroke,
  config: Partial<ValidationConfig> = {}
): StrokeValidationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (userPoints.length < cfg.minPointCount) {
    return {
      isValid: false,
      confidence: 0,
      feedback: 'too_short',
    };
  }

  const userStart = userPoints[0];
  const userEnd = userPoints[userPoints.length - 1];
  
  const refStart: Point = { x: referenceStroke.startX, y: referenceStroke.startY };
  const refEnd = parseStrokeEndpoint(referenceStroke);

  const startDist = distance(userStart, refStart);
  const startOk = startDist <= cfg.startTolerance;
  
  if (!startOk) {
    const confidence = Math.max(0, 1 - startDist / cfg.startTolerance);
    return {
      isValid: false,
      confidence: confidence * 0.3,
      feedback: 'wrong_start',
    };
  }

  const userAngle = angle(userStart, userEnd);
  const refAngle = angle(refStart, refEnd);
  const angleDiff = angleDifference(userAngle, refAngle);
  
  const directionOk = angleDiff <= cfg.directionTolerance;
  
  if (!directionOk) {
    const isReversed = angleDiff > 135;
    const confidence = Math.max(0, 1 - angleDiff / 180);
    return {
      isValid: false,
      confidence: confidence * 0.5,
      feedback: isReversed ? 'wrong_direction' : 'wrong_shape',
    };
  }

  const endDist = distance(userEnd, refEnd);
  const endOk = endDist <= cfg.endTolerance;

  const startScore = 1 - Math.min(startDist / cfg.startTolerance, 1);
  const endScore = endOk ? 1 - Math.min(endDist / cfg.endTolerance, 1) : 0.5;
  const directionScore = 1 - Math.min(angleDiff / cfg.directionTolerance, 1);
  
  const pathLength = computePathLength(userPoints);
  const lengthScore = Math.min(pathLength * 5, 1);

  const overallConfidence = (
    startScore * 0.3 +
    endScore * 0.25 +
    directionScore * 0.3 +
    lengthScore * 0.15
  );

  const isValid = startOk && directionOk && overallConfidence >= 0.5;

  return {
    isValid,
    confidence: Math.round(overallConfidence * 100) / 100,
    feedback: isValid ? 'correct' : 'wrong_shape',
  };
}

export function validateAllStrokes(
  userStrokes: Point[][],
  referenceStrokes: Stroke[],
  config: Partial<ValidationConfig> = {}
): { results: StrokeValidationResult[]; overallSuccess: boolean; averageConfidence: number } {
  const results: StrokeValidationResult[] = [];
  
  const count = Math.min(userStrokes.length, referenceStrokes.length);
  
  for (let i = 0; i < count; i++) {
    results.push(validateStroke(userStrokes[i], referenceStrokes[i], config));
  }
  
  const allValid = results.every(r => r.isValid);
  const avgConfidence = results.length > 0 
    ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
    : 0;
  
  return {
    results,
    overallSuccess: allValid && results.length === referenceStrokes.length,
    averageConfidence: Math.round(avgConfidence * 100) / 100,
  };
}
