import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useLoadingStore } from '../../store/loadingStore';
import GradientBackground from '../../components/GradientBackground';
import type { HomeStackParams } from '../../navigation/index';

type Props = NativeStackScreenProps<HomeStackParams, 'FamilyProfile'>;

interface FirestoreUserData {
  displayName?: string;
  username?: string;
  bio?: string;
  interests?: string[];
  location?: { city?: string };
  composition?: { household?: string; childrenAges?: string[]; pets?: string[] };
  age?: number | null;
  photoURL?: string | null;
  photos?: string[];
}

export default function FamilyProfileScreen({ route, navigation }: Props) {
  const { userId, displayName, compatibilityScore, photoURL: paramPhotoURL } = route.params;
  const { firebaseUser } = useAuthStore();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const [userData, setUserData] = useState<FirestoreUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messagingLoading, setMessagingLoading] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'users', userId))
      .then(snap => { if (snap.exists()) setUserData(snap.data() as FirestoreUserData); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleConnect = async () => {
    if (connected) return;
    setConnecting(true);
    showLoading();
    try {
      await api.matching.createMatch({ targetUserId: userId, matchType: 'instant' });
      setConnected(true);
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('already')) {
        setConnected(true);
      } else {
        Alert.alert('Error', err.message || 'No se pudo enviar la solicitud');
      }
    } finally {
      setConnecting(false);
      hideLoading();
    }
  };

  const handleMessage = async () => {
    if (!firebaseUser) return;
    setMessagingLoading(true);
    try {
      const uid = firebaseUser.uid;
      const [snap1, snap2] = await Promise.all([
        getDocs(query(collection(db, 'conversations'), where('participant1_id', '==', uid), where('participant2_id', '==', userId), limit(1))),
        getDocs(query(collection(db, 'conversations'), where('participant1_id', '==', userId), where('participant2_id', '==', uid), limit(1))),
      ]);
      const convDoc = !snap1.empty ? snap1.docs[0] : !snap2.empty ? snap2.docs[0] : null;
      if (!convDoc) {
        Alert.alert('Sin conversación', 'Conecta con esta familia primero para poder enviarles un mensaje.');
        return;
      }
      (navigation as any).getParent()?.navigate('ChatTab', {
        screen: 'Chat',
        params: {
          conversationId: convDoc.id,
          participantId: userId,
          participantName: displayName,
          participantPhotoURL: (userData?.photoURL ?? userData?.photos?.[0] ?? paramPhotoURL) ?? undefined,
        },
      });
    } catch {
      Alert.alert('Error', 'No se pudo abrir la conversación.');
    } finally {
      setMessagingLoading(false);
    }
  };

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('');

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c6a7f8" />
        </View>
      </GradientBackground>
    );
  }

  const interests = userData?.interests ?? [];
  const composition = userData?.composition;
  const bio = userData?.bio ?? '';
  const city = userData?.location?.city;
  const username = userData?.username;
  const photoURL = userData?.photoURL ?? userData?.photos?.[0] ?? paramPhotoURL ?? null;

  const scorePercent = compatibilityScore !== undefined
    ? Math.round(compatibilityScore <= 1 ? compatibilityScore * 100 : compatibilityScore)
    : null;

  const compositionParts = [
    composition?.household,
    composition?.childrenAges?.join(', '),
    composition?.pets?.join(', '),
  ].filter(Boolean) as string[];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header card con foto */}
          <View style={styles.headerCard}>
            <View style={styles.avatarWrap}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.avatarPhoto} resizeMode="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
            </View>
            <Text style={styles.familyName}>{displayName}</Text>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
            {city ? <Text style={styles.location}>📍 {city}</Text> : null}
            {scorePercent !== null ? (
              <View style={styles.compatPill}>
                <Text style={styles.compatText}>{scorePercent}% compatible</Text>
              </View>
            ) : null}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtnPrimary, connected && styles.actionBtnDone]}
              onPress={handleConnect}
              disabled={connecting || connected}
              activeOpacity={0.8}
            >
              {connecting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.actionBtnPrimaryText}>{connected ? '✓ Solicitud enviada' : 'Conectar'}</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleMessage} disabled={messagingLoading} activeOpacity={0.8}>
              {messagingLoading
                ? <ActivityIndicator size="small" color="#7c4dbc" />
                : <Text style={styles.actionBtnSecondaryText}>Mensaje</Text>
              }
            </TouchableOpacity>
          </View>

          {bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mi historia</Text>
              <Text style={styles.bodyText}>{bio}</Text>
            </View>
          ) : null}

          {compositionParts.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Composición familiar</Text>
              <View style={styles.compositionChips}>
                {composition?.household && (
                  <View style={styles.chip}><Text style={styles.chipText}>{composition.household}</Text></View>
                )}
                {composition?.childrenAges?.map(a => (
                  <View key={a} style={styles.chip}><Text style={styles.chipText}>{a}</Text></View>
                ))}
                {composition?.pets?.map(p => (
                  <View key={p} style={styles.chip}><Text style={styles.chipText}>{p}</Text></View>
                ))}
              </View>
            </View>
          ) : null}

          {interests.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Intereses</Text>
              <View style={styles.tagsWrap}>
                {interests.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f9f6fe', justifyContent: 'center', alignItems: 'center',
    marginLeft: 20, marginTop: 8,
  },
  backArrow: { fontSize: 26, color: '#1c1c1e', lineHeight: 30, marginTop: -2 },
  scroll: { paddingBottom: 40, paddingHorizontal: 20 },
  headerCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
    alignItems: 'center', marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  avatarWrap: { marginBottom: 14 },
  avatarPhoto: {
    width: 100, height: 100, borderRadius: 50,
  },
  avatarFallback: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#e5d7fc', justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: '#7c4dbc' },
  familyName: { fontSize: 22, fontWeight: '700', color: '#141414', marginBottom: 4 },
  username: { fontSize: 14, color: '#8c8c8c', marginBottom: 4 },
  location: { fontSize: 13, color: '#8c8c8c', marginBottom: 8 },
  compatPill: {
    backgroundColor: '#ede4fd', paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, marginTop: 4,
  },
  compatText: { fontSize: 13, fontWeight: '600', color: '#7c4dbc' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtnPrimary: {
    flex: 1, height: 48, borderRadius: 14,
    backgroundColor: '#c6a7f8', justifyContent: 'center', alignItems: 'center',
  },
  actionBtnDone: { backgroundColor: '#a0e0b0' },
  actionBtnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  actionBtnSecondary: {
    flex: 1, height: 48, borderRadius: 14,
    backgroundColor: '#f9f6fe', borderWidth: 1.5, borderColor: '#e5d7fc',
    justifyContent: 'center', alignItems: 'center',
  },
  actionBtnSecondaryText: { fontSize: 15, fontWeight: '600', color: '#7c4dbc' },
  section: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 18, marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#141414', marginBottom: 10 },
  bodyText: { fontSize: 14, color: '#444', lineHeight: 22 },
  compositionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#ede4fd', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 },
  chipText: { fontSize: 13, color: '#7c4dbc', fontWeight: '500' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#ede4fd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 13, color: '#7c4dbc', fontWeight: '500' },
});
