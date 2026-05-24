import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { useLocation } from '../../hooks/useLocation';

interface Props {
  onNext: (location?: { latitude: number; longitude: number; city?: string }) => void;
  onBack: () => void;
}

export default function LocationScreen({ onNext, onBack }: Props) {
  const { location, permissionStatus, requestAndFetch } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleRequestLocation = async () => {
    setLoading(true);
    await requestAndFetch();
    setLoading(false);
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
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
          </View>

          <Text style={styles.title}>¿Dónde estáis?</Text>
          <Text style={styles.subtitle}>Así encontramos familias cerca de vosotros.</Text>

          <View style={styles.iconWrap}>
            <Text style={styles.locationIcon}>📍</Text>
          </View>

          {permissionStatus === 'granted' && location?.city ? (
            <Text style={styles.cityText}>{location.city}</Text>
          ) : null}

          {permissionStatus === 'denied' ? (
            <Text style={styles.deniedText}>Puedes activarlo más tarde en Ajustes</Text>
          ) : null}

          <View style={styles.btnWrap}>
            {permissionStatus !== 'granted' ? (
              <Button
                title={loading ? 'Obteniendo ubicación…' : 'Permitir ubicación'}
                onPress={handleRequestLocation}
                variant="primary"
                style={styles.btnSpacing}
              />
            ) : (
              <Button
                title="Continuar"
                onPress={() => onNext(location ?? undefined)}
                variant="primary"
                style={styles.btnSpacing}
              />
            )}
            <Button
              title="Continuar sin ubicación"
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
  iconWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  locationIcon: {
    fontSize: 80,
  },
  cityText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  deniedText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#8c8c8c',
    marginBottom: 16,
  },
  btnWrap: {
    gap: 12,
    marginTop: 'auto',
  },
  btnSpacing: {
    marginBottom: 0,
  },
});
