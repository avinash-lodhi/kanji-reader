/**
 * StrokeGuide Component
 * 
 * Renders a character's strokes progressively using SVG.
 * Core visual component for Learn Mode.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { StrokeData } from '../../services/strokeData';
import { colors } from '../../constants/colors';

interface StrokeGuideProps {
  strokeData: StrokeData;
  currentStroke: number;
  showNumbers?: boolean;
  size?: number;
  showGrid?: boolean;
}

const VIEWBOX_SIZE = 109;

function getStrokeMidpoint(pathData: string): { x: number; y: number } {
  const startMatch = pathData.match(/^[Mm]\s*([-\d.]+)[,\s]+([-\d.]+)/);
  if (!startMatch) {
    return { x: VIEWBOX_SIZE / 2, y: VIEWBOX_SIZE / 2 };
  }
  
  const startX = parseFloat(startMatch[1]);
  const startY = parseFloat(startMatch[2]);
  
  const curveMatch = pathData.match(/[CcSsQqTtAa]\s*([-\d.,\s]+)/g);
  if (curveMatch && curveMatch.length > 0) {
    const lastCurve = curveMatch[curveMatch.length - 1];
    const points = lastCurve.match(/-?[\d.]+/g);
    if (points && points.length >= 2) {
      const endX = parseFloat(points[points.length - 2]);
      const endY = parseFloat(points[points.length - 1]);
      return { x: (startX + endX) / 2, y: (startY + endY) / 2 };
    }
  }
  
  return { x: startX + 10, y: startY + 10 };
}

export function StrokeGuide({
  strokeData,
  currentStroke,
  showNumbers = false,
  size = 200,
  showGrid = false,
}: StrokeGuideProps) {
  const { strokes } = strokeData;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      >
        {showGrid && (
          <>
            <Path
              d={`M ${VIEWBOX_SIZE / 2} 0 V ${VIEWBOX_SIZE}`}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="3,3"
            />
            <Path
              d={`M 0 ${VIEWBOX_SIZE / 2} H ${VIEWBOX_SIZE}`}
              stroke={colors.border}
              strokeWidth={0.5}
              strokeDasharray="3,3"
            />
          </>
        )}
        
        {strokes.map((stroke, index) => {
          if (index > currentStroke) return null;
          
          const isCurrentStroke = index === currentStroke;
          const isPreviousStroke = index < currentStroke;
          
          return (
            <Path
              key={index}
              d={stroke.path}
              stroke={isCurrentStroke ? colors.primary : colors.text}
              strokeWidth={isCurrentStroke ? 4 : 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={isPreviousStroke ? 0.6 : 1}
            />
          );
        })}
        
        {showNumbers && strokes.map((stroke, index) => {
          if (index > currentStroke) return null;
          
          const midpoint = getStrokeMidpoint(stroke.path);
          const isCurrentStroke = index === currentStroke;
          
          return (
            <React.Fragment key={`num-${index}`}>
              <Circle
                cx={midpoint.x}
                cy={midpoint.y}
                r={8}
                fill={isCurrentStroke ? colors.primary : colors.surface}
                stroke={isCurrentStroke ? colors.primary : colors.border}
                strokeWidth={1}
              />
              <SvgText
                x={midpoint.x}
                y={midpoint.y + 3}
                textAnchor="middle"
                fontSize={10}
                fontWeight="bold"
                fill={isCurrentStroke ? colors.textInverse : colors.text}
              >
                {index + 1}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default StrokeGuide;
