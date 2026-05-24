import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { api } from '../../api/client';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import type { HomeStackParams } from '../../navigation/index';

type Props = NativeStackScreenProps<HomeStackParams, 'FamilyProfile'>;

interface FirestoreUserData {
  displayName?: string;
  username?: string;
  bio?: string;
  interests?: string[];
  location?: { city?: string };
  familyComposition?: string[];
  age?: number | null;
}

export default function FamilyProfileScreen({ route, navigation }: Props) {
  const { userId, displayName, compatibilityScore } = route.params;
  const [userData, setUserData] = useState<FirestoreUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'users', userId))
      .then(snap => {
        if (snap.exists()) {
          setUserData(snap.data() as FirestoreUserData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await api.matching.createMatch({ targetUserId: userId, matchType: 'instant' });
      Alert.alert('Solicitud enviada', 'Si la otra familia acepta, podreis chatear.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo enviar la solicitud');
    } finally {
      setConnecting(false);
    }
  };

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
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
  const familyComposition = userData?.familyComposition ?? [];
  const bio = userData?.bio ?? '';
  const city = userData?.location?.city;
  const username = userData?.username;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>&#x2190;</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <Text style={styles.familyName}>{displayName}</Text>
            {username ? (
              <Text style={styles.username}>@{username}</Text>
            ) : null}
            {city ? (
              <Text style={styles.location}>&#x1F4CD; {city}</Text>
            ) : null}
            {compatibilityScore !== undefined ? (
              <View style={styles.compatPill}>
                <Text style={styles.compatText}>{compatibilityScore}% compatible</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <Button
              title="Conectar"
              onPress={handleConnect}
              variant="primary"
              loading={connecting}
              style={styles.actionBtn}
            />
            <Button
              title="Mensaje"
              onPress={() => {}}
              variant="secondary"
              style={styles.actionBtn}
            />
          </View>

          {bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mi historia</Text>
              <Text style={styles.bodyText}>{bio}</Text>
            </View>
          ) : null}

          {familyComposition.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Composicion familiar</Text>
              {familyComposition.map((item, idx) => (
                <Text key={idx} style={styles.compositionItem}>{item}</Text>
              ))}
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Espacios favoritos</Text>
            <Text style={styles.bodyTextMuted}>Proximamente</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 8,
  },
  backArrow: { fontSize: 20, color: '#1c1c1e' },
  scroll: { paddingBottom: 40, paddingHorizontal: 20 },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5d7fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitials: { fontSize: 28, fontWeight: '700', color: '#1c1c1e' },
  familyName: { fontSize: 22, fontWeight: '700', color: '#141414', marginBottom: 4 },
  username: { fontSize: 14, color: '#8c8c8c', marginBottom: 4 },
  location: { fontSize: 13, color: '#8c8c8c', marginBottom: 8 },
  compatPill: {
    backgroundColor: '#ede4fd',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  compatText: { fontSize: 13, fontWeight: '600', color: '#c6a7f8' },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'center',
  },
  actionBtn: {
    flex: 1,
    width: undefined,
    height: 48,
    alignSelf: undefined,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#141414', marginBottom: 10 },
  bodyText: { fontSize: 13, color: '#141414', lineHeight: 20 },
  bodyTextMuted: { fontSize: 13, color: '#8c8c8c' },
  compositionItem: { fontSize: 13, color: '#141414', lineHeight: 22, marginBottom: 2 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#ede4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 13, color: '#c6a7f8', fontWeight: '500' },
});
