import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Props {
  onNext: (interests: string[]) => void;
  onBack: () => void;
}

const ALL_INTERESTS = [
  'Parques y naturaleza',
  'Deporte',
  'Arte y manualidades',
  'Música',
  'Viajes',
  'Gastronomía',
  'Lectura',
  'Cine y series',
  'Juegos de mesa',
  'Voluntariado',
  'Teatro',
  'Tecnología',
];

export default function InterestsScreen({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (interest: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(interest)) {
        next.delete(interest);
      } else {
        next.add(interest);
      }
      return next;
    });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
          </View>

          <Text style={styles.title}>Intereses familiares</Text>
          <Text style={styles.subtitle}>Selecciona lo que disfrutan juntos</Text>

          <ScrollView
            contentContainerStyle={styles.tagsContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tagsWrap}>
              {ALL_INTERESTS.map((interest) => {
                const isSelected = selected.has(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[styles.tag, isSelected && styles.tagSelected]}
                    onPress={() => toggle(interest)}
                    activeOpacity={0.75}
                  >
                    {isSelected && <Text style={styles.checkmark}>✓ </Text>}
                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.btnWrap}>
            <Button
              title="Continuar"
              onPress={() => onNext(Array.from(selected))}
              disabled={selected.size === 0}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    gap: 12,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#1c1c1e',
    lineHeight: 32,
    marginTop: -2,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ede4fd',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c6a7f8',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#262626',
    marginBottom: 24,
  },
  tagsContainer: {
    paddingBottom: 16,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagSelected: {
    backgroundColor: '#ede4fd',
  },
  tagText: {
    fontSize: 14,
    color: '#1c1c1e',
    fontWeight: '400',
  },
  tagTextSelected: {
    color: '#c6a7f8',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 13,
    color: '#c6a7f8',
    fontWeight: '600',
  },
  btnWrap: {
    marginTop: 16,
  },
});
