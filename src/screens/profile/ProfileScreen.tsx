import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';

const TIER_LABELS = { free: 'Gratuito', premium: 'Premium', vip: 'VIP' };

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { profile, signOut, refreshProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const handleSave = async () => {
    try {
      await api.auth.updateProfile({ displayName, bio });
      await refreshProfile();
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
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
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.displayName?.charAt(0).toUpperCase() || '?'}
                </Text>
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

          {profile?.bio ? (
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
                <Text style={styles.sectionBody}>{profile.bio}</Text>
              )}
            </View>
          ) : null}

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

          {profile?.interests && profile.interests.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Intereses</Text>
              <View style={styles.tagsRow}>
                {profile.interests.map(interest => (
                  <View key={interest} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.bottomActions}>
            {editing ? (
              <>
                <Button title="Guardar cambios" onPress={handleSave} variant="primary" />
                <Button title="Cancelar" onPress={() => setEditing(false)} variant="secondary" style={styles.secondaryBtn} />
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
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: '#1c1c1e' },
  scrollContent: { paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarWrap: { marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5d7fc',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  connectBtn: {
    backgroundColor: '#c6a7f8',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
  },
  connectBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
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
    backgroundColor: '#ede4fd',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  interestTagText: { fontSize: 13, color: '#c6a7f8', fontWeight: '500' },
  bottomActions: { paddingHorizontal: 16, gap: 10, marginTop: 8 },
  secondaryBtn: { marginTop: 0 },
  signOutBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: { color: '#8c8c8c', fontSize: 14, fontWeight: '500' },
});
