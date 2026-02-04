/**
 * usePracticeSession Hook
 * 
 * Manages the stroke lifecycle for practice mode.
 * Orchestrates drawing, validation, feedback, and state transitions.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { StrokeData, Stroke } from '../services/strokeData';
import { Point, validateStroke, StrokeValidationResult } from '../utils/strokeValidation';
import { RenderedStroke } from '../components/writing/DrawingCanvas';
import { colors } from '../constants/colors';
import { usePracticeStore } from '../store/practiceStore';
import * as Haptics from 'expo-haptics';

export type PracticeState = 
  | 'idle' 
  | 'validating' 
  | 'feedback_correct' 
  | 'feedback_incorrect' 
  | 'complete';

interface PracticeSessionState {
  currentStrokeIndex: number;
  validatedStrokes: RenderedStroke[];
  practiceState: PracticeState;
  hintsUsedThisSession: boolean;
  attemptsThisStroke: number;
}

interface PracticeSessionActions {
  handleStrokeComplete: (points: Point[]) => void;
  clearCanvas: () => void;
  reset: () => void;
  markHintUsed: () => void;
}

interface PracticeSessionResult extends PracticeSessionState, PracticeSessionActions {
  expectedStroke: Stroke | null;
  isComplete: boolean;
  totalStrokes: number;
  lastValidationResult: StrokeValidationResult | null;
}

export function usePracticeSession(
  strokeData: StrokeData | null,
  character: string
): PracticeSessionResult {
  const updateProgress = usePracticeStore((state) => state.updateProgress);
  
  const [state, setState] = useState<PracticeSessionState>({
    currentStrokeIndex: 0,
    validatedStrokes: [],
    practiceState: 'idle',
    hintsUsedThisSession: false,
    attemptsThisStroke: 0,
  });
  
  const [lastValidationResult, setLastValidationResult] = useState<StrokeValidationResult | null>(null);

  const strokes = strokeData?.strokes ?? [];
  const totalStrokes = strokes.length;
  
  const expectedStroke = useMemo(() => {
    if (state.currentStrokeIndex >= strokes.length) return null;
    return strokes[state.currentStrokeIndex];
  }, [strokes, state.currentStrokeIndex]);

  const isComplete = state.practiceState === 'complete';

  // Refs to avoid stale closures in handleStrokeComplete
  const stateRef = useRef(state);
  stateRef.current = state;
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const totalStrokesRef = useRef(totalStrokes);
  totalStrokesRef.current = totalStrokes;
  const characterRef = useRef(character);
  characterRef.current = character;
  const updateProgressRef = useRef(updateProgress);
  updateProgressRef.current = updateProgress;

  const handleStrokeComplete = useCallback((points: Point[]) => {
    const currentState = stateRef.current;
    const currentStrokes = strokesRef.current;
    const currentTotalStrokes = totalStrokesRef.current;
    
    // Read the expected stroke directly from the ref'd strokes array
    const currentExpectedStroke = currentState.currentStrokeIndex < currentStrokes.length 
      ? currentStrokes[currentState.currentStrokeIndex] 
      : null;

    if (!currentExpectedStroke || currentState.practiceState !== 'idle') return;

    setState((prev) => ({ ...prev, practiceState: 'validating' }));

    const result = validateStroke(points, currentExpectedStroke);
    setLastValidationResult(result);

    if (result.isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const newStroke: RenderedStroke = {
        points,
        color: colors.success,
        isCorrect: true,
      };

      const newIndex = currentState.currentStrokeIndex + 1;
      const isNowComplete = newIndex >= currentTotalStrokes;

      setState((prev) => ({
        ...prev,
        currentStrokeIndex: newIndex,
        validatedStrokes: [...prev.validatedStrokes, newStroke],
        practiceState: isNowComplete ? 'complete' : 'feedback_correct',
        attemptsThisStroke: 0,
      }));

      if (isNowComplete) {
        updateProgressRef.current(characterRef.current, true, currentState.hintsUsedThisSession);
      }

      if (!isNowComplete) {
        setTimeout(() => {
          setState((prev) => ({ ...prev, practiceState: 'idle' }));
        }, 200);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      setState((prev) => ({
        ...prev,
        practiceState: 'feedback_incorrect',
        attemptsThisStroke: prev.attemptsThisStroke + 1,
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, practiceState: 'idle' }));
      }, 500);
    }
  }, []); // Stable callback — reads current values from refs

  const clearCanvas = useCallback(() => {
    setState({
      currentStrokeIndex: 0,
      validatedStrokes: [],
      practiceState: 'idle',
      hintsUsedThisSession: state.hintsUsedThisSession,
      attemptsThisStroke: 0,
    });
    setLastValidationResult(null);
  }, [state.hintsUsedThisSession]);

  const reset = useCallback(() => {
    setState({
      currentStrokeIndex: 0,
      validatedStrokes: [],
      practiceState: 'idle',
      hintsUsedThisSession: false,
      attemptsThisStroke: 0,
    });
    setLastValidationResult(null);
  }, []);

  const markHintUsed = useCallback(() => {
    setState((prev) => ({ ...prev, hintsUsedThisSession: true }));
  }, []);

  return {
    ...state,
    handleStrokeComplete,
    clearCanvas,
    reset,
    markHintUsed,
    expectedStroke,
    isComplete,
    totalStrokes,
    lastValidationResult,
  };
}

export default usePracticeSession;
