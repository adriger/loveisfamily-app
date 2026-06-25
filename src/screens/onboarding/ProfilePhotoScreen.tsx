import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Alert, Linking, ActionSheetIOS, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Props {
  onNext: (photoURL: string) => void;
  onBack: () => void;
}

export default function ProfilePhotoScreen({ onNext, onBack }: Props) {
  const [localUri, setLocalUri] = useState<string | undefined>(undefined);

  const requestAndPickLibrary = async () => {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(
          'Acceso a fotos bloqueado',
          'Permite el acceso en Ajustes > LoveIsFamily > Fotos.',
          [{ text: 'Cancelar', style: 'cancel' }, { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }],
        );
      } else {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tus fotos para continuar.');
      }
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setLocalUri(result.assets[0].uri);
  };

  const requestAndTakePhoto = async () => {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(
          'Acceso a cámara bloqueado',
          'Permite el acceso en Ajustes > LoveIsFamily > Cámara.',
          [{ text: 'Cancelar', style: 'cancel' }, { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }],
        );
      } else {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a la cámara para continuar.');
      }
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) setLocalUri(result.assets[0].uri);
  };

  const handlePhotoCirclePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', 'Hacer una foto', 'Subir de galería'], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) requestAndTakePhoto();
          if (index === 2) requestAndPickLibrary();
        },
      );
    } else {
      Alert.alert('Añadir foto', undefined, [
        { text: 'Hacer una foto', onPress: requestAndTakePhoto },
        { text: 'Subir de galería', onPress: requestAndPickLibrary },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
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
              <View style={[styles.progressFill, { width: '55%' }]} />
            </View>
          </View>

          <Text style={styles.title}>Tu foto de perfil</Text>
          <Text style={styles.subtitle}>
            Una foto real ayuda a generar confianza. Otras familias podrán reconocerte.
          </Text>

          <TouchableOpacity style={styles.photoCircle} onPress={handlePhotoCirclePress} activeOpacity={0.8}>
            {localUri ? (
              <Image source={{ uri: localUri }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.photoHint}>Toca para{'\n'}añadir foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.photoActions}>
            <Button
              title="Hacer una foto"
              onPress={requestAndTakePhoto}
              variant="secondary"
              style={styles.photoBtn}
            />
            <Button
              title="Subir de galería"
              onPress={requestAndPickLibrary}
              variant="secondary"
              style={styles.photoBtn}
            />
          </View>

          <View style={styles.btnWrap}>
            <Button
              title="Continuar"
              onPress={() => localUri && onNext(localUri)}
              variant="primary"
              disabled={!localUri}
            />
            {!localUri && (
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
  subtitle: { fontSize: 15, color: '#555', lineHeight: 21, marginBottom: 36 },
  photoCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#f0ecfa', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 24, overflow: 'hidden',
    borderWidth: 2, borderColor: '#c6a7f8', borderStyle: 'dashed',
  },
  photoPlaceholder: { alignItems: 'center', gap: 6 },
  photoImage: { width: 160, height: 160, borderRadius: 80 },
  cameraIcon: { fontSize: 36 },
  photoHint: { fontSize: 12, color: '#8c8c8c', textAlign: 'center', lineHeight: 16 },
  photoActions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  photoBtn: { flex: 1 },
  btnWrap: { gap: 10, marginTop: 'auto' },
  requiredHint: {
    fontSize: 13, color: '#8c8c8c', textAlign: 'center', lineHeight: 18,
  },
});
