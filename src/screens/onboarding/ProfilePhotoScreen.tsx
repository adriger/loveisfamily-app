import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Props {
  onNext: (photoURL?: string) => void;
  onBack: () => void;
}

export default function ProfilePhotoScreen({ onNext, onBack }: Props) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '55%' }]} />
            </View>
          </View>

          <Text style={styles.title}>Tu foto de perfil</Text>
          <Text style={styles.subtitle}>Una foto ayuda a que otras familias te reconozcan.</Text>

          <View style={styles.photoCircle}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>

          <View style={styles.btnWrap}>
            <Button
              title="Elegir foto"
              onPress={() => onNext(undefined)}
              variant="primary"
              style={styles.btnSpacing}
            />
            <Button
              title="Continuar sin foto"
              onPress={() => onNext(undefined)}
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
    marginBottom: 48,
  },
  photoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 48,
  },
  cameraIcon: {
    fontSize: 48,
  },
  btnWrap: {
    gap: 12,
    marginTop: 'auto',
  },
  btnSpacing: {
    marginBottom: 0,
  },
});
