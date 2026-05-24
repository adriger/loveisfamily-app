import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../config/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Slide {
  id: string;
  heading: string;
  body: string;
  // Each slide gets a distinct placeholder hue so they feel visually different.
  placeholderColor: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    heading: 'Encuentra familias con quienes compartir',
    body: 'Conecta con familias cerca de ti que disfrutan las mismas actividades',
    placeholderColor: '#3a3550',
  },
  {
    id: '2',
    heading: 'Del chat al parque, a la mesa, a la vida.',
    body: 'Chatea, organiza planes y construye amistades reales',
    placeholderColor: '#2d3b3b',
  },
  {
    id: '3',
    heading: 'Un espacio seguro para tu familia',
    body: 'Tú decides con quién conectar y qué compartir. Siempre en control.',
    placeholderColor: '#2a2d42',
  },
];

interface Props {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.placeholderColor }]}>
            {/* Dark overlay that sits on top of the placeholder "photo" */}
            <View style={styles.overlay} />

            {/* Logo top-left */}
            <SafeAreaView edges={['top']} style={styles.topBar}>
              <Text style={styles.logoMark}>LIF ♥</Text>
              <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
                <Text style={styles.skipText}>Omitir</Text>
              </TouchableOpacity>
            </SafeAreaView>

            {/* Bottom text area */}
            <SafeAreaView edges={['bottom']} style={styles.bottomArea}>
              <Text style={styles.heading}>{item.heading}</Text>
              <Text style={styles.bodyText}>{item.body}</Text>

              <View style={styles.controlRow}>
                {/* Dot indicators */}
                <View style={styles.dots}>
                  {SLIDES.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === activeIndex && styles.dotActive]}
                    />
                  ))}
                </View>

                {/* Next / finish arrow button */}
                <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
                  <Text style={styles.arrowText}>→</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: SCREEN_W,
    height: SCREEN_H,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
  heading: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.textHeadingAccent,
    fontFamily: theme.fonts.fallback,
    lineHeight: 40,
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    ...theme.typography.body,
    color: '#ffffff',
    marginBottom: theme.spacing.xl,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    width: 24,
    borderRadius: 4,
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
});
