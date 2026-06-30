import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import GradientBackground from '../../components/GradientBackground';
import { useAuthStore } from '../../store/authStore';
import { useLoadingStore } from '../../store/loadingStore';
import { api } from '../../api/client';
import type { Match } from '../../config/types';
import type { HomeStackParams, MainTabParams } from '../../navigation/index';

type Props = NativeStackScreenProps<HomeStackParams, 'Matches'>;
type TabNav = BottomTabNavigationProp<MainTabParams>;

interface OtherUser {
  displayName: string;
  photoURL: string | null;
}

export default function MatchesScreen({ navigation }: Props) {
  const { firebaseUser } = useAuthStore();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const tabNav = useNavigation<TabNav>();

  const [matches, setMatches] = useState<Match[]>([]);
  const [otherUsers, setOtherUsers] = useState<Record<string, OtherUser>>({});
  const [loading, setLoading] = useState(true);

  const uid = firebaseUser?.uid ?? '';

  const load = useCallback(async () => {
    try {
      const result = await api.matching.getHistory({ limit: 20 });
      const list = result.matches;
      setMatches(list);

      // Obtener datos reales del otro participante en cada match
      const otherIds = [...new Set(list.map(m => m.user1_id === uid ? m.user2_id : m.user1_id))];
      const docs = await Promise.all(otherIds.map(id => getDoc(doc(db, 'users', id))));
      const map: Record<string, OtherUser> = {};
      docs.forEach(d => {
        if (d.exists()) {
          const data = d.data();
          map[d.id] = { displayName: data.displayName || 'Familia', photoURL: data.photoURL || null };
        }
      });
      setOtherUsers(map);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const handleRespond = async (matchId: string, response: 'accept' | 'reject') => {
    showLoading();
    try {
      const result = await api.matching.respond({ matchId, response });
      setMatches(prev => prev.map(m =>
        m.id === matchId
          ? { ...m, status: result.status as any, conversation_id: result.conversationId ?? m.conversation_id }
          : m
      ));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      hideLoading();
    }
  };

  const goToChat = (match: Match, other: OtherUser) => {
    if (!match.conversation_id) return;
    const otherUserId = match.user1_id === uid ? match.user2_id : match.user1_id;
    tabNav.navigate('ChatTab', {
      screen: 'Chat',
      params: {
        conversationId: match.conversation_id,
        participantId: otherUserId,
        participantName: other.displayName,
        participantPhotoURL: other.photoURL ?? undefined,
      },
    } as any);
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}><ActivityIndicator size="large" color="#c6a7f8" /></View>
      </GradientBackground>
    );
  }

  const received = matches.filter(m => m.user2_id === uid && m.status === 'pending');
  const sent = matches.filter(m => m.user1_id === uid && m.status === 'pending');
  const mutual = matches.filter(m => m.status === 'mutual_match');
  const other = matches.filter(m => !['pending', 'mutual_match'].includes(m.status));

  const renderCard = ({ item }: { item: Match }) => {
    const isReceived = item.user2_id === uid;
    const otherId = isReceived ? item.user1_id : item.user2_id;
    const other = otherUsers[otherId];
    const isMutual = item.status === 'mutual_match';
    const isSentPending = item.user1_id === uid && item.status === 'pending';

    return (
      <View style={[styles.card, isMutual && styles.cardMutual]}>
        <View style={styles.cardRow}>
          <View style={styles.avatarWrap}>
            {other?.photoURL
              ? <Image source={{ uri: other.photoURL }} style={styles.avatar} />
              : <View style={styles.avatarFallback}>
                  <Text style={styles.avatarLetter}>
                    {other?.displayName?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                </View>
            }
            {isMutual && <View style={styles.mutualDot} />}
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{other?.displayName ?? '...'}</Text>
            <Text style={styles.cardSub}>
              {isMutual ? '🎉 ¡Match! Ya podéis chatear'
                : isSentPending ? 'Solicitud enviada · pendiente'
                : isReceived ? 'Quiere conectar contigo'
                : item.status === 'rejected' ? 'Solicitud rechazada'
                : item.status === 'expired' ? 'Solicitud expirada'
                : item.status}
            </Text>
          </View>
        </View>

        {/* Botones según estado */}
        {isReceived && item.status === 'pending' && (
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRespond(item.id, 'reject')}>
              <Text style={styles.rejectBtnText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleRespond(item.id, 'accept')}>
              <Text style={styles.acceptBtnText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        )}

        {isMutual && other && (
          <TouchableOpacity style={styles.chatBtn} onPress={() => goToChat(item, other)}>
            <Text style={styles.chatBtnText}>Ir al chat →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const sections = [
    { key: 'received', label: 'Solicitudes recibidas', data: received },
    { key: 'mutual', label: 'Matches', data: mutual },
    { key: 'sent', label: 'Solicitudes enviadas', data: sent },
    { key: 'other', label: 'Historial', data: other },
  ].filter(s => s.data.length > 0);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.toolbarTitle}>Conexiones</Text>
          <View style={{ width: 40 }} />
        </View>

        {matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>Aún no tienes conexiones</Text>
            <Text style={styles.emptySubtext}>Desliza tarjetas en Familias para conectar</Text>
          </View>
        ) : (
          <FlatList
            data={sections.flatMap(s => [{ type: 'header' as const, label: s.label, key: `h-${s.key}` }, ...s.data.map(d => ({ type: 'item' as const, ...d, key: d.id }))])}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return <Text style={styles.sectionLabel}>{(item as any).label}</Text>;
              }
              return renderCard({ item: item as unknown as Match });
            }}
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 28, color: '#1c1c1e', lineHeight: 32, marginTop: -2 },
  toolbarTitle: { fontSize: 20, fontWeight: '700', color: '#1c1c1e' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#8c8c8c',
    textTransform: 'uppercase', letterSpacing: 0.6,
    marginTop: 20, marginBottom: 6,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardMutual: { borderWidth: 1.5, borderColor: '#c6a7f8' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#e5d7fc', justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: '#7c4dbc' },
  mutualDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#c6a7f8', borderWidth: 2, borderColor: '#fff',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 3 },
  cardSub: { fontSize: 12, color: '#8c8c8c' },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  rejectBtn: {
    flex: 1, borderWidth: 1, borderColor: '#e5e5e5',
    borderRadius: 20, paddingVertical: 9, alignItems: 'center',
  },
  rejectBtnText: { color: '#8c8c8c', fontSize: 13, fontWeight: '500' },
  acceptBtn: {
    flex: 1, backgroundColor: '#c6a7f8',
    borderRadius: 20, paddingVertical: 9, alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  chatBtn: {
    marginTop: 10, backgroundColor: '#ede4fd',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
  },
  chatBtnText: { color: '#7c4dbc', fontSize: 14, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1c1c1e', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#8c8c8c', textAlign: 'center' },
});
