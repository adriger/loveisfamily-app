import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  type: 'new_request' | 'mutual_match';
  name: string;
  onView: () => void;
  onDismiss: () => void;
}

export default function MatchBanner({ type, name, onView, onDismiss }: Props) {
  const translateY = useRef(new Animated.Value(-140)).current;
  const dismissedRef = useRef(false);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    Animated.timing(translateY, { toValue: -140, duration: 280, useNativeDriver: true }).start(onDismiss);
  };

  useEffect(() => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 180 }).start();
    const t = setTimeout(dismiss, 6000);
    return () => clearTimeout(t);
  }, []);

  const isMutual = type === 'mutual_match';

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{isMutual ? '🎉' : '💜'}</Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{isMutual ? '¡Tenéis un match!' : 'Nueva solicitud'}</Text>
          <Text style={styles.sub} numberOfLines={1}>{name}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => { dismiss(); onView(); }}
          activeOpacity={0.8}
        >
          <Text style={styles.viewBtnText}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 9999,
    paddingTop: 54,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#1e1040',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    shadowColor: '#7c4dbc',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(198,167,248,0.2)',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(198,167,248,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 22 },
  textWrap: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#ffffff', letterSpacing: 0.1 },
  sub: { fontSize: 12, color: '#c6a7f8', marginTop: 2 },
  viewBtn: {
    backgroundColor: '#c6a7f8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  viewBtnText: { fontSize: 13, fontWeight: '700', color: '#1e1040' },
  closeBtn: { paddingLeft: 4 },
  closeBtnText: { color: 'rgba(198,167,248,0.6)', fontSize: 15, fontWeight: '600' },
});
