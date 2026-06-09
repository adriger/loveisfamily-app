import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Image, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { storage } from '../../config/firebase';

const TIER_LABELS = { free: 'Gratuito', premium: 'Premium', vip: 'VIP' };

const ALL_INTERESTS = [
  'Parques y naturaleza', 'Deporte', 'Arte y manualidades', 'Música',
  'Viajes', 'Gastronomía', 'Lectura', 'Cine y series',
  'Juegos de mesa', 'Voluntariado', 'Teatro', 'Tecnología',
];

export default function ProfileScreen() {
  const { profile, firebaseUser, signOut, refreshProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    try {
      await api.auth.updateProfile({ displayName, bio, interests });
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
  };

  const handlePhotoPress = async () => {
    if (!editing) return;
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert(
          'Acceso bloqueado',
          'Permite el acceso en Ajustes > LoveIsFamily > Fotos.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ajustes', onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    const localUri = result.assets[0].uri;
    setUploading(true);
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profiles/${firebaseUser?.uid}/avatar.jpg`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);
      await api.auth.updateProfile({ photoURL });
      await refreshProfile();
    } catch {
      Alert.alert('Error', 'No se pudo subir la foto. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
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

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={handlePhotoPress}
              activeOpacity={editing ? 0.7 : 1}
            >
              <View style={styles.avatar}>
                {uploading ? (
                  <ActivityIndicator color="#c6a7f8" />
                ) : profile?.photoURL ? (
                  <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {profile?.displayName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                )}
              </View>
              {editing && <Text style={styles.avatarEditHint}>Cambiar foto</Text>}
            </TouchableOpacity>

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
  avatarEditHint: { fontSize: 12, color: '#c6a7f8', marginTop: 4, fontWeight: '500' },
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
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1c1c1e', marginBottom: 10 },
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
