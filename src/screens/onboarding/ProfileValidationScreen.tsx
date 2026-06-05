import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { api } from '../../api/client';

type ValidationState = 'upload' | 'uploading' | 'pending' | 'approved' | 'rejected';

interface Props {
  onNext: () => void;
  onSkip?: () => void;
}

export default function ProfileValidationScreen({ onNext, onSkip }: Props) {
  const [state, setState] = useState<ValidationState>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para verificar tu identidad.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const submitVerification = async () => {
    if (!selectedImage) return;
    setState('uploading');
    try {
      await api.verification.submit({ documentPhotoURL: selectedImage });
      setState('pending');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo enviar la verificación');
      setState('upload');
    }
  };

  if (state === 'uploading') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#c6a7f8" style={{ marginBottom: 24 }} />
          <Text style={styles.loadingTitle}>Subiendo tu documento...</Text>
          <Text style={styles.loadingSubtitle}>Esto solo tardará un momento</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (state === 'pending') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.bigIcon}>⏳</Text>
          <Text style={styles.stateTitle}>Verificación en proceso</Text>
          <Text style={styles.stateDesc}>
            Estamos revisando tu documento. Recibirás una notificación cuando tu perfil esté verificado.{'\n\n'}
            Esto puede tardar hasta 24 horas.
          </Text>
          <View style={styles.btnGroup}>
            <Button title="Continuar a la app" onPress={onNext} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (state === 'approved') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.bigIcon}>✅</Text>
          <Text style={styles.stateTitle}>¡Perfil verificado!</Text>
          <Text style={styles.stateDesc}>
            Tu identidad ha sido verificada. Tu perfil ahora muestra la insignia de verificación.
          </Text>
          <View style={styles.btnGroup}>
            <Button title="Continuar" onPress={onNext} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (state === 'rejected') {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.bigIcon}>❌</Text>
          <Text style={styles.stateTitle}>Verificación rechazada</Text>
          <Text style={styles.stateDesc}>
            No pudimos verificar tu documento. Asegúrate de que la imagen sea clara y el documento esté vigente.
          </Text>
          <View style={styles.btnGroup}>
            <Button title="Intentar de nuevo" onPress={() => { setSelectedImage(null); setState('upload'); }} />
            <TouchableOpacity style={styles.skipBtn} onPress={onNext}>
              <Text style={styles.skipText}>Omitir por ahora</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // Estado: upload
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Valida tu perfil</Text>
          <Text style={styles.subtitle}>
            Verifica tu identidad para que otras familias confíen en ti. Tu documento no se compartirá.
          </Text>

          <TouchableOpacity style={styles.uploadArea} onPress={pickImage} activeOpacity={0.8}>
            {selectedImage ? (
              <View style={styles.selectedState}>
                <Text style={styles.uploadedIcon}>📄</Text>
                <Text style={styles.uploadedText}>Documento seleccionado</Text>
                <Text style={styles.changeText}>Toca para cambiar</Text>
              </View>
            ) : (
              <View style={styles.emptyUpload}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadTitle}>Sube tu documento de identidad</Text>
                <Text style={styles.uploadDesc}>DNI, pasaporte o cualquier documento oficial</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Consejos para una buena foto</Text>
            {[
              '📸  La imagen debe ser nítida y bien iluminada',
              '🔲  Incluye todos los bordes del documento',
              '🚫  Sin reflejos ni sombras',
            ].map((tip) => (
              <Text key={tip} style={styles.tip}>{tip}</Text>
            ))}
          </View>

          <View style={styles.footer}>
            <Button
              title="Enviar para verificación"
              onPress={submitVerification}
              disabled={!selectedImage}
            />
            {onSkip && (
              <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                <Text style={styles.skipText}>Omitir por ahora</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', color: '#1c1c1e', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 32 },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#c6a7f8',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#faf7ff',
    marginBottom: 28,
  },
  emptyUpload: { alignItems: 'center' },
  uploadIcon: { fontSize: 40, marginBottom: 12 },
  uploadTitle: { fontSize: 16, fontWeight: '600', color: '#1c1c1e', marginBottom: 6, textAlign: 'center' },
  uploadDesc: { fontSize: 13, color: '#8c8c8c', textAlign: 'center' },
  selectedState: { alignItems: 'center' },
  uploadedIcon: { fontSize: 40, marginBottom: 12 },
  uploadedText: { fontSize: 16, fontWeight: '600', color: '#7c4dbc', marginBottom: 4 },
  changeText: { fontSize: 13, color: '#8c8c8c' },
  tips: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    marginBottom: 32,
  },
  tipsTitle: { fontSize: 14, fontWeight: '600', color: '#1c1c1e', marginBottom: 4 },
  tip: { fontSize: 13, color: '#555', lineHeight: 20 },
  footer: { marginTop: 'auto', gap: 12 },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 15, color: '#8c8c8c', fontWeight: '500' },
  bigIcon: { fontSize: 72, marginBottom: 24 },
  stateTitle: { fontSize: 28, fontWeight: '700', color: '#1c1c1e', marginBottom: 16, textAlign: 'center' },
  stateDesc: { fontSize: 15, color: '#555', lineHeight: 22, textAlign: 'center', marginBottom: 32 },
  btnGroup: { width: '100%', gap: 12 },
  loadingTitle: { fontSize: 22, fontWeight: '600', color: '#1c1c1e', marginBottom: 8 },
  loadingSubtitle: { fontSize: 15, color: '#8c8c8c' },
});
