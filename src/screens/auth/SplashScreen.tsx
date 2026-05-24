import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, { transform: [{ scale }], opacity }]}>
        {/* Outer ring — echoes the app's pill / circle motif */}
        <View style={styles.logoRing}>
          <Text style={styles.logoText}>LIF</Text>
          <Text style={styles.logoHeart}>♥</Text>
        </View>
        <Text style={styles.wordmark}>LoveIsFamily</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.splashLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.logoFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontFamily: theme.fonts.fallback,
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.logoFill,
    letterSpacing: 2,
    lineHeight: 40,
  },
  logoHeart: {
    fontSize: 18,
    color: theme.colors.logoFill,
    marginTop: -4,
  },
  wordmark: {
    fontFamily: theme.fonts.fallback,
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.logoFill,
    letterSpacing: 1,
  },
});
