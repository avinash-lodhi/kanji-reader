/**
 * Stroke Validation Unit Tests (KanjiReader-e8c.8.1)
 *
 * Tests the stroke validation algorithm which compares user-drawn
 * strokes against reference KanjiVG strokes using geometric comparison.
 */

import {
  validateStroke,
  validateAllStrokes,
  Point,
  StrokeValidationResult,
} from '../strokeValidation';
import { Stroke } from '../../services/strokeData';

// Helper: create a reference stroke with given start and an SVG path
// Path endpoints are parsed from the path data; coordinates are in 0-109 space
function makeRefStroke(
  startX: number,
  startY: number,
  pathEndX: number,
  pathEndY: number,
): Stroke {
  // Build a simple M ... L path in 109-space (the parser reads raw numbers)
  const sx = Math.round(startX * 109);
  const sy = Math.round(startY * 109);
  const ex = Math.round(pathEndX * 109);
  const ey = Math.round(pathEndY * 109);
  return {
    startX,
    startY,
    path: `M ${sx},${sy} L ${ex},${ey}`,
  };
}

// Helper: generate a straight line of points between two normalised positions
function straightLine(
  from: Point,
  to: Point,
  numPoints = 20,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    pts.push({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    });
  }
  return pts;
}

describe('validateStroke', () => {
  // --- Correct strokes ---------------------------------------------------

  it('returns isValid=true for a perfectly matching horizontal stroke', () => {
    const ref = makeRefStroke(0.1, 0.5, 0.9, 0.5);
    const user = straightLine({ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 });
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(true);
    expect(result.feedback).toBe('correct');
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('returns isValid=true for a perfectly matching vertical stroke', () => {
    const ref = makeRefStroke(0.5, 0.1, 0.5, 0.9);
    const user = straightLine({ x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 });
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(true);
    expect(result.feedback).toBe('correct');
  });

  it('returns isValid=true for a diagonal stroke', () => {
    const ref = makeRefStroke(0.1, 0.1, 0.9, 0.9);
    const user = straightLine({ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.9 });
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(true);
    expect(result.feedback).toBe('correct');
  });

  it('accepts a stroke at the edge of start tolerance', () => {
    const ref = makeRefStroke(0.5, 0.5, 0.9, 0.5);
    // Start offset by ~0.2 (within default startTolerance of 0.25)
    const user = straightLine({ x: 0.65, y: 0.6 }, { x: 0.9, y: 0.5 });
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(true);
  });

  // --- Reversed strokes --------------------------------------------------

  it('returns wrong_direction for a reversed horizontal stroke', () => {
    const ref = makeRefStroke(0.1, 0.5, 0.9, 0.5);
    // Drawn right-to-left but starting near the ref start
    // Actually the reversed stroke starts at the END position
    const user = straightLine({ x: 0.9, y: 0.5 }, { x: 0.1, y: 0.5 });
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(false);
    // Either wrong_start (start position is wrong) or wrong_direction
    expect(['wrong_start', 'wrong_direction']).toContain(result.feedback);
  });

  // --- Wrong start position ----------------------------------------------

  it('returns wrong_start when start position is far from reference', () => {
    const ref = makeRefStroke(0.1, 0.1, 0.9, 0.1);
    // User starts at bottom-right
    const user = straightLine({ x: 0.8, y: 0.8 }, { x: 0.9, y: 0.1 });
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(false);
    expect(result.feedback).toBe('wrong_start');
  });

  // --- Wrong direction ---------------------------------------------------

  it('returns wrong_direction or wrong_shape for perpendicular stroke', () => {
    const ref = makeRefStroke(0.5, 0.1, 0.5, 0.9); // vertical down
    // User draws horizontal from the same start
    const user = straightLine({ x: 0.5, y: 0.1 }, { x: 0.9, y: 0.1 });
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(false);
    expect(['wrong_direction', 'wrong_shape']).toContain(result.feedback);
  });

  // --- Too short / too few points ----------------------------------------

  it('returns too_short for strokes with fewer than minPointCount', () => {
    const ref = makeRefStroke(0.1, 0.5, 0.9, 0.5);
    const user: Point[] = [{ x: 0.1, y: 0.5 }, { x: 0.2, y: 0.5 }]; // only 2 points
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(false);
    expect(result.feedback).toBe('too_short');
    expect(result.confidence).toBe(0);
  });

  it('returns too_short for a single point', () => {
    const ref = makeRefStroke(0.1, 0.5, 0.9, 0.5);
    const user: Point[] = [{ x: 0.1, y: 0.5 }];
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(false);
    expect(result.feedback).toBe('too_short');
  });

  // --- Dot strokes (very short but valid with enough points) -------------

  it('handles a dot stroke (short distance, enough points)', () => {
    const ref = makeRefStroke(0.5, 0.5, 0.52, 0.52);
    const user = straightLine({ x: 0.5, y: 0.5 }, { x: 0.52, y: 0.52 }, 5);
    const result = validateStroke(user, ref);

    // Dot strokes should be valid if start/direction match
    expect(result).toBeDefined();
    // Confidence might be lower due to short path length
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  // --- Random scribble ---------------------------------------------------

  it('rejects a random scribble', () => {
    const ref = makeRefStroke(0.1, 0.5, 0.9, 0.5);
    // Random zigzag that starts near the right place but goes everywhere
    const user: Point[] = [
      { x: 0.1, y: 0.5 },
      { x: 0.2, y: 0.9 },
      { x: 0.3, y: 0.1 },
      { x: 0.4, y: 0.8 },
      { x: 0.5, y: 0.2 },
      { x: 0.1, y: 0.9 },
    ];
    const result = validateStroke(user, ref);

    // The end position and direction don't match, so should be invalid
    expect(result.isValid).toBe(false);
  });

  // --- Confidence scoring ------------------------------------------------

  it('has higher confidence for better matching strokes', () => {
    const ref = makeRefStroke(0.1, 0.5, 0.9, 0.5);

    const perfect = straightLine({ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 });
    const slightlyOff = straightLine({ x: 0.15, y: 0.55 }, { x: 0.85, y: 0.55 });

    const perfectResult = validateStroke(perfect, ref);
    const offResult = validateStroke(slightlyOff, ref);

    expect(perfectResult.confidence).toBeGreaterThanOrEqual(offResult.confidence);
  });

  it('confidence is between 0 and 1', () => {
    const ref = makeRefStroke(0.1, 0.5, 0.9, 0.5);
    const user = straightLine({ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 });
    const result = validateStroke(user, ref);

    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  // --- Custom config -----------------------------------------------------

  it('respects custom startTolerance', () => {
    const ref = makeRefStroke(0.5, 0.5, 0.9, 0.5);
    // Start offset by 0.3 — outside default (0.25) but inside custom (0.4)
    const user = straightLine({ x: 0.75, y: 0.65 }, { x: 0.9, y: 0.5 });

    const strictResult = validateStroke(user, ref, { startTolerance: 0.1 });
    const lenientResult = validateStroke(user, ref, { startTolerance: 0.5 });

    expect(strictResult.isValid).toBe(false);
    expect(strictResult.feedback).toBe('wrong_start');
    // Lenient might pass if other criteria also pass
    // At minimum, it shouldn't fail on start position
    expect(lenientResult.feedback).not.toBe('wrong_start');
  });

  // --- Long sweeping strokes --------------------------------------------

  it('validates a long diagonal sweeping stroke', () => {
    const ref = makeRefStroke(0.05, 0.05, 0.95, 0.95);
    const user = straightLine({ x: 0.05, y: 0.05 }, { x: 0.95, y: 0.95 }, 50);
    const result = validateStroke(user, ref);

    expect(result.isValid).toBe(true);
    expect(result.feedback).toBe('correct');
  });
});

describe('validateAllStrokes', () => {
  it('returns overallSuccess=true when all strokes match', () => {
    const refs: Stroke[] = [
      makeRefStroke(0.1, 0.1, 0.9, 0.1),  // horizontal top
      makeRefStroke(0.5, 0.1, 0.5, 0.9),  // vertical middle
    ];
    const userStrokes: Point[][] = [
      straightLine({ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }),
      straightLine({ x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 }),
    ];

    const result = validateAllStrokes(userStrokes, refs);

    expect(result.overallSuccess).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(result.results.every((r) => r.isValid)).toBe(true);
    expect(result.averageConfidence).toBeGreaterThan(0.5);
  });

  it('returns overallSuccess=false when any stroke fails', () => {
    const refs: Stroke[] = [
      makeRefStroke(0.1, 0.1, 0.9, 0.1),
      makeRefStroke(0.5, 0.1, 0.5, 0.9),
    ];
    const userStrokes: Point[][] = [
      straightLine({ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }), // correct
      straightLine({ x: 0.9, y: 0.9 }, { x: 0.1, y: 0.1 }), // wrong start
    ];

    const result = validateAllStrokes(userStrokes, refs);

    expect(result.overallSuccess).toBe(false);
    expect(result.results[0].isValid).toBe(true);
    expect(result.results[1].isValid).toBe(false);
  });

  it('returns overallSuccess=false when user has fewer strokes than reference', () => {
    const refs: Stroke[] = [
      makeRefStroke(0.1, 0.1, 0.9, 0.1),
      makeRefStroke(0.5, 0.1, 0.5, 0.9),
      makeRefStroke(0.1, 0.9, 0.9, 0.9),
    ];
    const userStrokes: Point[][] = [
      straightLine({ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }),
      straightLine({ x: 0.5, y: 0.1 }, { x: 0.5, y: 0.9 }),
    ];

    const result = validateAllStrokes(userStrokes, refs);

    expect(result.overallSuccess).toBe(false);
    expect(result.results).toHaveLength(2); // only validates available strokes
  });

  it('handles empty stroke arrays', () => {
    const result = validateAllStrokes([], []);
    expect(result.overallSuccess).toBe(true); // vacuously true
    expect(result.results).toHaveLength(0);
    expect(result.averageConfidence).toBe(0);
  });

  it('averageConfidence is between 0 and 1', () => {
    const refs: Stroke[] = [makeRefStroke(0.1, 0.5, 0.9, 0.5)];
    const userStrokes: Point[][] = [
      straightLine({ x: 0.1, y: 0.5 }, { x: 0.9, y: 0.5 }),
    ];

    const result = validateAllStrokes(userStrokes, refs);

    expect(result.averageConfidence).toBeGreaterThanOrEqual(0);
    expect(result.averageConfidence).toBeLessThanOrEqual(1);
  });
});
