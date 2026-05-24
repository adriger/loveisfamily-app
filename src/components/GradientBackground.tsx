import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../config/theme';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      {/* Top-right mint blob */}
      <View style={styles.blobTopRight} />
      {/* Bottom-left cream blob */}
      <View style={styles.blobBottomLeft} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  blobTopRight: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: theme.colors.blobMint,
    top: -80,
    right: -80,
    opacity: 0.65,
    // Squash into an oval
    transform: [{ scaleY: 0.75 }],
  },
  blobBottomLeft: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: theme.colors.blobCream,
    bottom: -100,
    left: -100,
    opacity: 0.7,
    transform: [{ scaleX: 0.8 }],
  },
});
