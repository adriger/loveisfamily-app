import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Image, ActivityIndicator, Linking,
  ActionSheetIOS, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { storage } from '../../config/firebase';

const TIER_LABELS = { free: 'Gratuito', premium: 'Premium', vip: 'VIP' };
const MAX_PHOTOS = 5;

const ALL_INTERESTS = [
  'Parques y naturaleza', 'Deporte', 'Arte y manualidades', 'Música',
  'Viajes', 'Gastronomía', 'Lectura', 'Cine y series',
  'Juegos de mesa', 'Voluntariado', 'Teatro', 'Tecnología',
];

function initialPhotos(profile: ReturnType<typeof useAuthStore>['profile']): string[] {
  if (profile?.photos && profile.photos.length > 0) return profile.photos;
  if (profile?.photoURL) return [profile.photoURL];
  return [];
}

export default function ProfileScreen() {
  const { profile, firebaseUser, signOut, refreshProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [photos, setPhotos] = useState<string[]>(() => initialPhotos(profile));
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleSave = async () => {
    try {
      await api.auth.updateProfile({
        displayName,
        bio,
        interests,
        photos,
        photoURL: photos[0] || undefined,
      });
      await refreshProfile();
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setDisplayName(profile?.displayName || '');
    setBio(profile?.bio || '');
    setInterests(profile?.interests || []);
    setPhotos(initialPhotos(profile));
  };

  const uploadAndAdd = async (localUri: string) => {
    const slotIndex = photos.length;
    setUploadingIndex(slotIndex);
    try {
      const resized = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 800 } }],
        { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG },
      );
      const response = await fetch(resized.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profiles/${firebaseUser?.uid}/photo_${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setPhotos(prev => [...prev, url]);
    } catch {
      Alert.alert('Error', 'No se pudo subir la foto. Inténtalo de nuevo.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const pickPhoto = async (source: 'library' | 'camera') => {
    if (source === 'library') {
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Acceso bloqueado',
            'Permite el acceso en Ajustes > LoveIsFamily > Fotos.',
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Ajustes', onPress: () => Linking.openSettings() }],
          );
        }
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) await uploadAndAdd(result.assets[0].uri);
    } else {
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Acceso bloqueado',
            'Permite el acceso en Ajustes > LoveIsFamily > Cámara.',
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Ajustes', onPress: () => Linking.openSettings() }],
          );
        }
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) await uploadAndAdd(result.assets[0].uri);
    }
  };

  const handleAddPhoto = () => {
    if (photos.length >= MAX_PHOTOS) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', 'Hacer una foto', 'Elegir de galería'], cancelButtonIndex: 0 },
        (index) => {
          if (index === 1) pickPhoto('camera');
          if (index === 2) pickPhoto('library');
        },
      );
    } else {
      Alert.alert('Añadir foto', undefined, [
        { text: 'Hacer una foto', onPress: () => pickPhoto('camera') },
        { text: 'Elegir de galería', onPress: () => pickPhoto('library') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  const handlePhotoOptions = (index: number) => {
    if (!editing) return;
    const options = index === 0
      ? ['Cancelar', 'Eliminar foto principal']
      : ['Cancelar', 'Establecer como principal', 'Eliminar'];
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: 0, destructiveButtonIndex: index === 0 ? 1 : 2 },
      (btn) => {
        if (index === 0 && btn === 1) {
          setPhotos(prev => prev.slice(1));
        } else if (index > 0 && btn === 1) {
          setPhotos(prev => {
            const arr = [...prev];
            [arr[0], arr[index]] = [arr[index], arr[0]];
            return arr;
          });
        } else if (index > 0 && btn === 2) {
          setPhotos(prev => prev.filter((_, i) => i !== index));
        }
      },
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest],
    );
  };

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  const tier = (profile?.subscription_type || 'free') as keyof typeof TIER_LABELS;
  const mainPhoto = photos[0] || null;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                {mainPhoto ? (
                  <Image source={{ uri: mainPhoto }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {profile?.displayName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.name}>{profile?.displayName}</Text>
            {profile?.location?.city || profile?.age ? (
              <Text style={styles.locationAge}>
                {[profile?.location?.city, profile?.age ? `${profile.age} años` : undefined]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            ) : null}
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{TIER_LABELS[tier]}</Text>
            </View>
          </View>

          {/* Photo gallery */}
          {(photos.length > 0 || editing) && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mis fotos</Text>
                {editing && (
                  <Text style={styles.sectionHint}>{photos.length}/{MAX_PHOTOS}</Text>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photosRow}>
                  {photos.map((uri, i) => (
                    <TouchableOpacity
                      key={uri + i}
                      style={styles.photoThumb}
                      onPress={() => handlePhotoOptions(i)}
                      activeOpacity={editing ? 0.7 : 1}
                    >
                      <Image source={{ uri }} style={styles.photoThumbImg} />
                      {i === 0 && (
                        <View style={styles.mainBadge}>
                          <Text style={styles.mainBadgeText}>Principal</Text>
                        </View>
                      )}
                      {editing && (
                        <TouchableOpacity
                          style={styles.photoRemoveBtn}
                          onPress={() => {
                            if (i === 0) {
                              setPhotos(prev => prev.slice(1));
                            } else {
                              setPhotos(prev => prev.filter((_, idx) => idx !== i));
                            }
                          }}
                        >
                          <Text style={styles.photoRemoveText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}

                  {editing && photos.length < MAX_PHOTOS && (
                    uploadingIndex !== null ? (
                      <View style={[styles.photoThumb, styles.photoThumbAdd]}>
                        <ActivityIndicator color="#c6a7f8" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.photoThumb, styles.photoThumbAdd]}
                        onPress={handleAddPhoto}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.photoAddIcon}>+</Text>
                        <Text style={styles.photoAddLabel}>Añadir</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>
              {editing && (
                <Text style={styles.photoTip}>
                  Toca una foto para establecerla como principal o eliminarla.
                </Text>
              )}
            </View>
          )}

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Composición familiar</Text>
            {editing ? (
              <>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} />
              </>
            ) : (
              <View>
                <Text style={styles.sectionBody}>{profile?.displayName}</Text>
                <Text style={styles.sectionBodySecondary}>@{profile?.username}</Text>
                {profile?.email ? (
                  <Text style={styles.sectionBodySecondary}>{profile.email}</Text>
                ) : null}
              </View>
            )}
          </View>

          {(profile?.bio || editing) ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Mi historia</Text>
              {editing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  placeholder="Cuentanos sobre tu familia..."
                />
              ) : (
                <Text style={styles.sectionBody}>{profile?.bio}</Text>
              )}
            </View>
          ) : null}

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Intereses</Text>
            {editing ? (
              <View style={styles.tagsRow}>
                {ALL_INTERESTS.map(interest => {
                  const selected = interests.includes(interest);
                  return (
                    <TouchableOpacity
                      key={interest}
                      style={[styles.interestTag, selected && styles.interestTagSelected]}
                      onPress={() => toggleInterest(interest)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.interestTagText, selected && styles.interestTagTextSelected]}>
                        {selected ? '✓ ' : ''}{interest}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : profile?.interests && profile.interests.length > 0 ? (
              <View style={styles.tagsRow}>
                {profile.interests.map(interest => (
                  <View key={interest} style={[styles.interestTag, styles.interestTagSelected]}>
                    <Text style={[styles.interestTagText, styles.interestTagTextSelected]}>{interest}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.sectionBodySecondary}>Sin intereses seleccionados</Text>
            )}
          </View>

          <View style={styles.bottomActions}>
            {editing ? (
              <>
                <Button title="Guardar cambios" onPress={handleSave} variant="primary" />
                <Button title="Cancelar" onPress={handleCancelEdit} variant="secondary" style={styles.secondaryBtn} />
              </>
            ) : (
              <Button title="Editar perfil" onPress={() => setEditing(true)} variant="secondary" />
            )}
            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollContent: { paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarWrap: { marginBottom: 12, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5d7fc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#1c1c1e' },
  name: { fontSize: 17, fontWeight: '600', color: '#1c1c1e', marginBottom: 4 },
  locationAge: { fontSize: 14, color: '#8c8c8c', marginBottom: 10 },
  tierBadge: {
    backgroundColor: '#ede4fd',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierText: { fontSize: 12, color: '#c6a7f8', fontWeight: '600' },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1c1c1e', flex: 1 },
  sectionHint: { fontSize: 13, color: '#8c8c8c' },
  sectionBody: { fontSize: 14, color: '#262626', lineHeight: 20 },
  sectionBodySecondary: { fontSize: 13, color: '#8c8c8c', marginTop: 2 },
  inputLabel: { fontSize: 13, color: '#8c8c8c', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#1c1c1e',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  photosRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbImg: { width: '100%', height: '100%' },
  photoThumbAdd: {
    backgroundColor: '#f0ecfa',
    borderWidth: 2,
    borderColor: '#c6a7f8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  photoAddIcon: { fontSize: 22, color: '#c6a7f8', lineHeight: 26 },
  photoAddLabel: { fontSize: 10, color: '#c6a7f8', fontWeight: '600' },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(198,167,248,0.85)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  mainBadgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  photoRemoveBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 10, fontWeight: '700', lineHeight: 12 },
  photoTip: { fontSize: 12, color: '#8c8c8c', marginTop: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  interestTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  interestTagSelected: { backgroundColor: '#ede4fd' },
  interestTagText: { fontSize: 13, color: '#8c8c8c', fontWeight: '500' },
  interestTagTextSelected: { color: '#c6a7f8' },
  bottomActions: { paddingHorizontal: 16, gap: 10, marginTop: 8 },
  secondaryBtn: { marginTop: 0 },
  signOutBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: { color: '#8c8c8c', fontSize: 14, fontWeight: '500' },
});
