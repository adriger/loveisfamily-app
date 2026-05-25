import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
  PanResponder, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { api } from '../../api/client';
import type { MatchSuggestion } from '../../config/types';
import type { HomeStackParams } from '../../navigation/index';

type Props = NativeStackScreenProps<HomeStackParams, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animated values for swipe gesture
  const translateX = useRef(new Animated.Value(0)).current;
  // Scale for the incoming card animation
  const nextCardScale = useRef(new Animated.Value(0.92)).current;

  const loadSuggestions = useCallback(async () => {
    try {
      const result = await api.matching.getSuggestions({ limit: 10 });
      setSuggestions(Array.isArray(result) ? result : []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudieron cargar las sugerencias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

  // Reset card position and animate next card appearing
  const resetCard = useCallback(() => {
    translateX.setValue(0);
    nextCardScale.setValue(0.92);
    Animated.spring(nextCardScale, {
      toValue: 1,
      tension: 80,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [translateX, nextCardScale]);

  const dismissCardRight = useCallback((onDone: () => void) => {
    Animated.spring(translateX, {
      toValue: 500,
      tension: 60,
      friction: 8,
      useNativeDriver: false,
    }).start(() => {
      onDone();
      resetCard();
    });
  }, [translateX, resetCard]);

  const dismissCardLeft = useCallback((onDone: () => void) => {
    Animated.spring(translateX, {
      toValue: -500,
      tension: 60,
      friction: 8,
      useNativeDriver: false,
    }).start(() => {
      onDone();
      resetCard();
    });
  }, [translateX, resetCard]);

  const handleConnect = useCallback(async () => {
    const current = suggestions[currentIndex];
    if (!current) return;
    try {
      await api.matching.createMatch({ targetUserId: current.user_id, matchType: 'instant' });
      Alert.alert('Conexion enviada', 'Si la otra familia acepta, podreis chatear.');
      setCurrentIndex(prev => prev + 1);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la conexion');
    }
  }, [suggestions, currentIndex]);

  const handleSkip = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > 5,

      onPanResponderMove: Animated.event(
        [null, { dx: translateX }],
        { useNativeDriver: false },
      ),

      onPanResponderRelease: (_evt, gestureState) => {
        const { dx } = gestureState;
        if (dx > 120) {
          // Swipe right → connect
          Animated.spring(translateX, {
            toValue: 500,
            tension: 60,
            friction: 8,
            useNativeDriver: false,
          }).start(() => {
            handleConnect();
            resetCard();
          });
        } else if (dx < -120) {
          // Swipe left → skip
          Animated.spring(translateX, {
            toValue: -500,
            tension: 60,
            friction: 8,
            useNativeDriver: false,
          }).start(() => {
            handleSkip();
            resetCard();
          });
        } else {
          // Spring back to center
          Animated.spring(translateX, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  // Derived animated values
  const rotate = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const connectOpacity = translateX.interpolate({
    inputRange: [20, 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const skipOpacity = translateX.interpolate({
    inputRange: [-120, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c6a7f8" />
        </View>
      </GradientBackground>
    );
  }

  const current = suggestions[currentIndex];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <Text style={styles.logo}>LIF&#x2665;</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterIcon}>&#x2261;</Text>
          </TouchableOpacity>
        </View>

        {!current ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>&#x1F50D;</Text>
            <Text style={styles.emptyTitle}>Aun no hay familias cerca</Text>
            <Text style={styles.emptySubtext}>Prueba a ampliar el radio de busqueda o explora la comunidad</Text>
            <View style={styles.emptyButtons}>
              <Button title="Ampliar radio" onPress={() => {}} variant="primary" style={styles.emptyBtn} />
              <Button title="Explorar comunidad" onPress={() => {}} variant="secondary" style={styles.emptyBtn} />
            </View>
          </View>
        ) : (
          <View style={styles.cardArea}>
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [{ translateX }, { rotate }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View style={styles.cardImagePlaceholder}>
                <View style={styles.cardOverlay} />

                {/* Connect overlay (swipe right) */}
                <Animated.View
                  style={[styles.swipeOverlay, styles.swipeOverlayConnect, { opacity: connectOpacity }]}
                  pointerEvents="none"
                >
                  <Text style={styles.swipeOverlayText}>💚 CONECTAR</Text>
                </Animated.View>

                {/* Skip overlay (swipe left) */}
                <Animated.View
                  style={[styles.swipeOverlay, styles.swipeOverlaySkip, { opacity: skipOpacity }]}
                  pointerEvents="none"
                >
                  <Text style={styles.swipeOverlayText}>✕ PASAR</Text>
                </Animated.View>

                <View style={styles.cardBottom}>
                  <Text style={styles.familyName}>{current.displayName}</Text>
                  {current.age ? (
                    <Text style={styles.familyTagline}>{current.age} anos</Text>
                  ) : null}
                  {current.interests && current.interests.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
                      <View style={styles.tagsRow}>
                        {current.interests.slice(0, 4).map(tag => (
                          <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>
              </View>
            </Animated.View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtnLight}
                onPress={() => dismissCardLeft(handleSkip)}
              >
                <Text style={styles.actionIconDark}>&#x2715;</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnLight}
                onPress={() => navigation.navigate('FamilyProfile', {
                  userId: current.user_id,
                  displayName: current.displayName,
                  compatibilityScore: current.compatibility_score,
                })}
              >
                <Text style={styles.actionIconDark}>&#x2139;</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => dismissCardRight(handleConnect)}
              >
                <Text style={styles.actionIconLight}>&#x2665;</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: { fontSize: 22, fontWeight: '700', color: '#1c1c1e' },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: { fontSize: 22, color: '#1c1c1e' },
  cardArea: { flex: 1, alignItems: 'center', paddingBottom: 16 },
  card: {
    width: 342,
    height: 580,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: '#e5d7fc',
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1c1c1e',
    opacity: 0.4,
  },
  swipeOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  swipeOverlayConnect: {
    backgroundColor: 'rgba(52, 199, 89, 0.55)',
  },
  swipeOverlaySkip: {
    backgroundColor: 'rgba(255, 59, 48, 0.55)',
  },
  swipeOverlayText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardBottom: {
    padding: 20,
    paddingBottom: 24,
  },
  familyName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  familyTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  tagsScroll: { marginTop: 4 },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: '#f9f6fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, color: '#1c1c1e' },
  actions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnLight: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f9f6fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c6a7f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconDark: { fontSize: 20, color: '#1c1c1e' },
  actionIconLight: { fontSize: 20, color: '#ffffff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1c1c1e', textAlign: 'center', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#8c8c8c', textAlign: 'center', marginBottom: 32 },
  emptyButtons: { width: '100%', gap: 12 },
  emptyBtn: { width: '100%' },
});
