import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Props {
  onFinish: () => void;
}

const HEARTS = [
  { color: '#ff9a8d' },
  { color: '#c6a7f8' },
  { color: '#f9e29a' },
  { color: '#54d1c1' },
];

export default function WelcomeScreen({ onFinish }: Props) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <Text style={styles.title}>¡Ya eres parte!</Text>
          <Text style={styles.body}>
            Tu perfil está listo. Ya puedes explorar y conectar con otras familias.
          </Text>

          <View style={styles.heartsRow}>
            {HEARTS.map((h, i) => (
              <Text key={i} style={[styles.heart, { color: h.color }]}>
                ♥
              </Text>
            ))}
          </View>

          <View style={styles.btnWrap}>
            <Button
              title="Explorar familias"
              onPress={onFinish}
              variant="primary"
              style={styles.btnSpacing}
            />
            <Button
              title="Ver mi perfil"
              onPress={onFinish}
              variant="secondary"
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#c6a7f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  checkIcon: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1c1c1e',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#262626',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 48,
  },
  heart: {
    fontSize: 28,
  },
  btnWrap: {
    width: '100%',
    gap: 12,
  },
  btnSpacing: {
    marginBottom: 0,
  },
});
