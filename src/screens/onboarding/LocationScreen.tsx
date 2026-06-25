import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { useLocation } from '../../hooks/useLocation';

interface Props {
  onNext: (location: { latitude: number; longitude: number; city?: string }) => void;
  onBack: () => void;
}

export default function LocationScreen({ onNext, onBack }: Props) {
  const { location, permissionStatus, requestAndFetch } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    await requestAndFetch();
    setLoading(false);
  };

  const handleDeniedHelp = () => {
    Alert.alert(
      'Ubicación necesaria',
      'Para usar LoveIsFamily necesitamos tu ubicación aproximada. Puedes activarla en:\nAjustes > Privacidad > Localización > LoveIsFamily',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() },
      ],
    );
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
            <View style={styles.cityBlock}>
              <Text style={styles.cityText}>📍 {location.city}</Text>
              <Text style={styles.cityConfirm}>Ubicación obtenida correctamente</Text>
            </View>
          ) : null}

          {/* Mensajes de privacidad */}
          <View style={styles.privacyCard}>
            <View style={styles.privacyRow}>
              <Text style={styles.privacyIcon}>🛡️</Text>
              <Text style={styles.privacyText}>
                <Text style={styles.privacyBold}>Tu ubicación real nunca se mostrará</Text>
                {' '}a otras familias. Solo usamos una zona aproximada para el matching.
              </Text>
            </View>
            <View style={styles.privacyDivider} />
            <View style={styles.privacyRow}>
              <Text style={styles.privacyIcon}>⚠️</Text>
              <Text style={styles.privacyText}>
                <Text style={styles.privacyBold}>No compartas tu dirección exacta</Text>
                {' '}con personas que no conoces, aunque tengan match contigo.
              </Text>
            </View>
          </View>

          <View style={styles.btnWrap}>
            {permissionStatus === 'granted' && location ? (
              <Button
                title="Continuar"
                onPress={() => onNext(location)}
                variant="primary"
              />
            ) : permissionStatus === 'denied' ? (
              <>
                <Button
                  title="Activar en Ajustes"
                  onPress={handleDeniedHelp}
                  variant="primary"
                />
                <Text style={styles.deniedNote}>
                  La ubicación es necesaria para encontrar familias cercanas. Sin ella no podemos mostrarte sugerencias relevantes.
                </Text>
              </>
            ) : (
              <Button
                title={loading ? 'Obteniendo ubicación…' : 'Permitir ubicación'}
                onPress={handleRequest}
                variant="primary"
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },
  toolbar: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 32, gap: 12 },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f9f6fe', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 28, color: '#1c1c1e', lineHeight: 32, marginTop: -2 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#ede4fd', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#c6a7f8' },
  title: { fontSize: 32, fontWeight: '600', color: '#1c1c1e', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#262626', marginBottom: 32 },
  iconWrap: { alignItems: 'center', marginBottom: 20 },
  locationIcon: { fontSize: 72 },
  cityBlock: { alignItems: 'center', marginBottom: 20 },
  cityText: { fontSize: 20, fontWeight: '700', color: '#1c1c1e' },
  cityConfirm: { fontSize: 13, color: '#34c759', marginTop: 4 },
  privacyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  privacyRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  privacyIcon: { fontSize: 18, lineHeight: 22 },
  privacyText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 19 },
  privacyBold: { fontWeight: '600', color: '#1c1c1e' },
  privacyDivider: { height: 1, backgroundColor: '#f0ecfa' },
  btnWrap: { marginTop: 'auto', gap: 10 },
  deniedNote: { fontSize: 13, color: '#8c8c8c', textAlign: 'center', lineHeight: 18 },
});
