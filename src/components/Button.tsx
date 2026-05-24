import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../config/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        styles[variant],
        isDisabled && variant === 'primary' && styles.primaryDisabled,
        isDisabled && styles.disabledOpacity,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.textDark : theme.colors.buttonPrimary}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    width: 342,
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  primary: {
    backgroundColor: theme.colors.buttonPrimary,
    ...theme.shadows.button,
  },
  primaryDisabled: {
    backgroundColor: theme.colors.buttonPrimaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondary: {
    backgroundColor: theme.colors.buttonSecondary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabledOpacity: {
    opacity: 0.7,
  },
  label: {
    ...theme.typography.buttonLabel,
  },
  primaryLabel: {
    color: theme.colors.textDark,
  },
  secondaryLabel: {
    color: theme.colors.textDark,
  },
  ghostLabel: {
    color: theme.colors.buttonPrimary,
  },
});
