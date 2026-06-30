import React, { useEffect, useRef } from 'react';
import { Modal, View, Animated, StyleSheet } from 'react-native';
import { useLoadingStore } from '../store/loadingStore';

export default function LoadingOverlay() {
  const visible = useLoadingStore(s => s.visible);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      loop.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.12, duration: 650, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.65, duration: 650, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 650, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
          ]),
        ]),
      );
      loop.current.start();
    } else {
      loop.current?.stop();
      scale.setValue(1);
      opacity.setValue(1);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.Image
          source={require('../../assets/icon.png')}
          style={[styles.logo, { transform: [{ scale }], opacity }]}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
});
