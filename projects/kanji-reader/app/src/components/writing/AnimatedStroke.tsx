/**
 * AnimatedStroke Component
 * 
 * Animates a single SVG stroke being drawn using strokeDasharray/dashoffset.
 * Creates a "pen writing" effect showing stroke direction.
 */

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedStrokeProps {
  d: string;
  stroke: string;
  strokeWidth: number;
  animate: boolean;
  duration?: number;
  pathLength?: number;
  onAnimationComplete?: () => void;
}

const DEFAULT_PATH_LENGTH = 600; // Increased to cover longer strokes safely
const DEFAULT_DURATION = 1500;   // Slower default speed

export function AnimatedStroke({
  d,
  stroke,
  strokeWidth,
  animate,
  duration = DEFAULT_DURATION,
  pathLength = DEFAULT_PATH_LENGTH,
  onAnimationComplete,
}: AnimatedStrokeProps) {
  const strokeDashoffset = useSharedValue(animate ? pathLength : 0);

  useEffect(() => {
    if (animate) {
      strokeDashoffset.value = pathLength;
      strokeDashoffset.value = withTiming(0, {
        duration,
        easing: Easing.inOut(Easing.ease),
      }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    } else {
      strokeDashoffset.value = 0;
    }
  }, [animate, pathLength, duration, onAnimationComplete]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  return (
    <AnimatedPath
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength}
      fill="none"
      animatedProps={animatedProps}
    />
  );
}

export default AnimatedStroke;
