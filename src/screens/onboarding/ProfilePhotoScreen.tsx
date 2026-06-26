import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Alert, Linking, ActionSheetIOS, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

const MAX_PHOTOS = 5;

interface PhotoSlot {
  uri: string;
  uploading?: boolean;
}

interface Props {
  onNext: (photos: string[]) => void;
  onBack: () => void;
}

export default function ProfilePhotoScreen({ onNext, onBack }: Props) {
  const [slots, setSlots] = useState<PhotoSlot[]>([]);

  const pickPhoto = async (source: 'library' | 'camera') => {
    if (source === 'library') {
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Acceso a fotos bloqueado',
            'Permite el acceso en Ajustes > LoveIsFamily > Fotos.',
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }],
          );
        }
        return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      return result.canceled ? null : result.assets[0].uri;
    } else {
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Acceso a cámara bloqueado',
            'Permite el acceso en Ajustes > LoveIsFamily > Cámara.',
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }],
          );
        }
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      return result.canceled ? null : result.assets[0].uri;
    }
  };

  const handleAddPhoto = () => {
    if (slots.length >= MAX_PHOTOS) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', 'Hacer una foto', 'Elegir de galería'], cancelButtonIndex: 0 },
        async (index) => {
          let uri: string | null = null;
          if (index === 1) uri = await pickPhoto('camera');
          if (index === 2) uri = await pickPhoto('library');
          if (uri) setSlots(prev => [...prev, { uri }]);
        },
      );
    } else {
      Alert.alert('Añadir foto', undefined, [
        { text: 'Hacer una foto', onPress: async () => { const u = await pickPhoto('camera'); if (u) setSlots(prev => [...prev, { uri: u }]); } },
        { text: 'Elegir de galería', onPress: async () => { const u = await pickPhoto('library'); if (u) setSlots(prev => [...prev, { uri: u }]); } },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  const handleRemove = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (slots.length === 0) return;
    onNext(slots.map(s => s.uri));
  };

  const emptyCount = MAX_PHOTOS - slots.length;

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

          <Text style={styles.title}>Tus fotos</Text>
          <Text style={styles.subtitle}>
            Añade al menos una foto. Puedes subir hasta {MAX_PHOTOS}. La primera será tu foto principal.
          </Text>

          <View style={styles.grid}>
            {slots.map((slot, i) => (
              <View key={i} style={[styles.slot, i === 0 && styles.slotMain]}>
                <Image source={{ uri: slot.uri }} style={styles.slotImg} />
                {i === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Principal</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(i)}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {slots.length < MAX_PHOTOS && (
              <TouchableOpacity
                style={[styles.slot, styles.slotEmpty, slots.length === 0 && styles.slotMain]}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addLabel}>
                  {slots.length === 0 ? 'Añadir foto' : 'Añadir'}
                </Text>
              </TouchableOpacity>
            )}

            {Array.from({ length: Math.max(0, emptyCount - 1) }).map((_, i) => (
              <View key={`placeholder-${i}`} style={[styles.slot, styles.slotPlaceholder]} />
            ))}
          </View>

          <Text style={styles.countHint}>
            {slots.length}/{MAX_PHOTOS} fotos
          </Text>

          <View style={styles.btnWrap}>
            <Button
              title="Continuar"
              onPress={handleContinue}
              variant="primary"
              disabled={slots.length === 0}
            />
            {slots.length === 0 && (
              <Text style={styles.requiredHint}>
                La foto de perfil es obligatoria para que otras familias puedan reconocerte.
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const SLOT_SIZE = 100;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, marginBottom: 32, gap: 12,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f9f6fe', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 28, color: '#1c1c1e', lineHeight: 32, marginTop: -2 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#ede4fd', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#c6a7f8' },
  title: { fontSize: 32, fontWeight: '600', color: '#1c1c1e', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#555', lineHeight: 21, marginBottom: 28 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  slotMain: {
    width: SLOT_SIZE * 1.5,
    height: SLOT_SIZE * 1.5,
    borderRadius: 16,
  },
  slotImg: { width: '100%', height: '100%' },
  slotEmpty: {
    backgroundColor: '#f0ecfa',
    borderWidth: 2,
    borderColor: '#c6a7f8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  slotPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  addIcon: { fontSize: 28, color: '#c6a7f8', lineHeight: 32 },
  addLabel: { fontSize: 11, color: '#c6a7f8', fontWeight: '500' },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(198,167,248,0.85)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  mainBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 11, fontWeight: '700', lineHeight: 14 },
  countHint: { fontSize: 13, color: '#8c8c8c', marginBottom: 16 },
  btnWrap: { gap: 10, marginTop: 'auto' },
  requiredHint: {
    fontSize: 13, color: '#8c8c8c', textAlign: 'center', lineHeight: 18,
  },
});
