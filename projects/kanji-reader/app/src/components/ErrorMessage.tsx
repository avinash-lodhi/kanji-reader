import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { fontSizes, fontWeights } from '../constants/typography';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  onGoBack,
  icon = 'alert-circle-outline',
}: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.warning} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttons}>
        {onRetry && (
          <Button title="Retry" onPress={onRetry} variant="primary" style={styles.button} />
        )}
        {onGoBack && (
          <Button title="Go Back" onPress={onGoBack} variant="secondary" style={styles.button} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    minWidth: 100,
  },
});

export default ErrorMessage;
