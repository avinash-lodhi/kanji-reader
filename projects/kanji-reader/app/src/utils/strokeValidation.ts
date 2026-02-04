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
  startTolerance: 0.30,   // 30% of canvas — slightly more forgiving for finger input
  endTolerance: 0.40,     // 40% — end position is less precise on touch
  directionTolerance: 50,  // 50° — accommodate natural finger arc variation
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

/**
 * Trace an SVG path to find its endpoint.
 * Handles both absolute (MCLSQTA) and relative (mclsqta) commands,
 * which KanjiVG paths frequently mix.
 */
const VIEWBOX = 109;

// SVG number regex: handles "1-0.61" → ["1", "-0.61"] and "1.88-1.67" → ["1.88", "-1.67"]
const SVG_TOKEN_RE = /([a-zA-Z])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;

function tokenizeSVGPath(pathData: string): (string | number)[] {
  const tokens: (string | number)[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = SVG_TOKEN_RE.exec(pathData)) !== null) {
    if (match[1]) {
      tokens.push(match[1]); // command letter
    } else if (match[2]) {
      tokens.push(parseFloat(match[2])); // number
    }
  }
  
  return tokens;
}

function parseStrokeEndpoint(stroke: Stroke): Point {
  const tokens = tokenizeSVGPath(stroke.path);

  let x = 0, y = 0;       // current point
  let startX = 0, startY = 0; // start of current subpath (for Z)
  let i = 0;
  let cmd = '';

  const num = (): number => {
    while (i < tokens.length && typeof tokens[i] === 'string') i++; // skip unexpected letters
    return (i < tokens.length ? tokens[i++] : 0) as number;
  };

  while (i < tokens.length) {
    const token = tokens[i];

    // If it's a letter, it's a new command
    if (typeof token === 'string') {
      cmd = token;
      i++;
    }
    // Otherwise, repeat the previous command (implicit lineto after M/m)

    switch (cmd) {
      case 'M': x = num(); y = num(); startX = x; startY = y; cmd = 'L'; break;
      case 'm': x += num(); y += num(); startX = x; startY = y; cmd = 'l'; break;

      case 'L': x = num(); y = num(); break;
      case 'l': x += num(); y += num(); break;

      case 'H': x = num(); break;
      case 'h': x += num(); break;

      case 'V': y = num(); break;
      case 'v': y += num(); break;

      case 'C': num(); num(); num(); num(); x = num(); y = num(); break;
      case 'c': { num(); num(); num(); num(); const dx = num(), dy = num(); x += dx; y += dy; break; }

      case 'S': num(); num(); x = num(); y = num(); break;
      case 's': { num(); num(); const dx = num(), dy = num(); x += dx; y += dy; break; }

      case 'Q': num(); num(); x = num(); y = num(); break;
      case 'q': { num(); num(); const dx = num(), dy = num(); x += dx; y += dy; break; }

      case 'T': x = num(); y = num(); break;
      case 't': x += num(); y += num(); break;

      case 'A': num(); num(); num(); num(); num(); x = num(); y = num(); break;
      case 'a': { num(); num(); num(); num(); num(); const dx = num(), dy = num(); x += dx; y += dy; break; }

      case 'Z': case 'z': x = startX; y = startY; break;

      default:
        // Unknown command — skip
        i++;
        break;
    }
  }

  return { x: x / VIEWBOX, y: y / VIEWBOX };
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

  const isValid = startOk && directionOk && overallConfidence >= 0.4;

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
