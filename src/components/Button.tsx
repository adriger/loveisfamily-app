import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1.0,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
    </Animated.View>
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
