import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../config/theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface Slide {
  id: string;
  heading: string;
  body: string;
}

const slides: Slide[] = [
  {
    id: '1',
    heading: 'Encuentra familias con quienes compartir',
    body: 'Conecta con familias cerca de ti que disfrutan las mismas actividades.',
  },
  {
    id: '2',
    heading: 'Del chat al parque, a la mesa, a la vida.',
    body: 'Chatea, organiza planes y construye amistades reales.',
  },
  {
    id: '3',
    heading: 'Un espacio seguro para tu familia',
    body: 'Tú decides con quién conectar y qué compartir. Siempre en control.',
  },
];

interface Props {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const textOpacity = useRef(new Animated.Value(1)).current;
  const textTranslateX = useRef(new Animated.Value(0)).current;

  const dotWidths = useRef(slides.map((_, i) => new Animated.Value(i === 0 ? 24 : 8))).current;
  const dotOpacities = useRef(slides.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.4))).current;

  const arrowScale = useRef(new Animated.Value(1)).current;

  const animateToSlide = (nextIndex: number) => {
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateX, {
        toValue: -40,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      listRef.current?.scrollToIndex({ index: nextIndex, animated: false });
      textTranslateX.setValue(40);

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      slides.forEach((_, i) => {
        const isActive = i === nextIndex;
        Animated.timing(dotWidths[i], {
          toValue: isActive ? 24 : 8,
          duration: 200,
          useNativeDriver: false,
        }).start();
        Animated.timing(dotOpacities[i], {
          toValue: isActive ? 1 : 0.4,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      setActiveIndex(nextIndex);
    });
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      animateToSlide(activeIndex + 1);
    } else {
      onFinish();
    }
  };

  const handleArrowPressIn = () => {
    Animated.spring(arrowScale, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const handleArrowPressOut = () => {
    Animated.spring(arrowScale, {
      toValue: 1.0,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  };

  const isLastSlide = activeIndex === slides.length - 1;

  return (
    <View style={styles.root}>
      <View style={styles.background} />
      <View style={styles.overlay} />

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={() => <View style={styles.pageSlot} />}
      />

      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Text style={styles.logoMark}>LIF ♥</Text>
        <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottomArea} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.textContent,
            { opacity: textOpacity, transform: [{ translateX: textTranslateX }] },
          ]}
        >
          <Text style={styles.heading}>{slides[activeIndex].heading}</Text>
          <Text style={styles.bodyText}>{slides[activeIndex].body}</Text>
        </Animated.View>

        <View style={styles.controlRow}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidths[i],
                    opacity: dotOpacities[i],
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View style={{ transform: [{ scale: arrowScale }] }}>
            <TouchableOpacity
              style={isLastSlide ? styles.startButton : styles.arrowButton}
              onPress={handleNext}
              onPressIn={handleArrowPressIn}
              onPressOut={handleArrowPressOut}
              activeOpacity={1}
            >
              {isLastSlide ? (
                <Text style={styles.startText}>Empezar</Text>
              ) : (
                <Text style={styles.arrowText}>→</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2a2d42',
  },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#2a2d42',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  pageSlot: {
    width: SCREEN_W,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 8,
  },
  logoMark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: theme.fonts.fallback,
    letterSpacing: 1,
  },
  skipButton: {
    backgroundColor: theme.colors.buttonSecondary,
    borderRadius: theme.borderRadius.pill,
    width: 98,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    ...theme.typography.label,
    color: theme.colors.textDark,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingBottom: theme.spacing.xl,
  },
  textContent: {
    marginBottom: theme.spacing.xl,
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.textHeadingAccent,
    fontFamily: theme.fonts.fallback,
    lineHeight: 40,
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: theme.fonts.fallback,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 22,
    color: theme.colors.textDark,
    fontWeight: '600',
  },
  startButton: {
    width: 120,
    height: 48,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textDark,
    fontFamily: theme.fonts.fallback,
  },
});
