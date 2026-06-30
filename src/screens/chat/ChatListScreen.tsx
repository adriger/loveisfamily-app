import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  collection, query, where, onSnapshot, DocumentData,
  QueryDocumentSnapshot, getDoc, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp,
} from 'firebase/firestore';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import GradientBackground from '../../components/GradientBackground';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import type { ChatStackParams } from '../../navigation';
import type { Conversation } from '../../config/types';

type Nav = NativeStackNavigationProp<ChatStackParams>;
type ParticipantInfo = { displayName: string; photoURL?: string | null };

export default function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const { firebaseUser } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [participantData, setParticipantData] = useState<Record<string, ParticipantInfo>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});
  const openSwipeableId = useRef<string | null>(null);

  // ── Listener de conversaciones ───────────────────────────────────────────────
  useEffect(() => {
    if (!firebaseUser) { setLoading(false); return; }
    const uid = firebaseUser.uid;
    const convsRef = collection(db, 'conversations');

    let convs1: Conversation[] = [];
    let convs2: Conversation[] = [];
    let got1 = false;
    let got2 = false;

    const merge = () => {
      if (!got1 || !got2) return;
      const merged = [...convs1, ...convs2];
      merged.sort((a, b) => (b.last_message_timestamp ?? '').localeCompare(a.last_message_timestamp ?? ''));
      const seen = new Set<string>();
      setConversations(merged.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
      setLoading(false);
    };

    const mapDoc = (d: QueryDocumentSnapshot<DocumentData>): Conversation => ({
      id: d.id,
      ...(d.data() as Omit<Conversation, 'id' | 'last_message_timestamp' | 'created_at'>),
      last_message_timestamp: d.data().last_message_timestamp?.toDate?.()?.toISOString() ?? null,
      created_at: d.data().created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    });

    const u1 = onSnapshot(
      query(convsRef, where('participant1_id', '==', uid)),
      snap => { convs1 = snap.docs.map(mapDoc); got1 = true; merge(); },
      () => { got1 = true; merge(); },
    );
    const u2 = onSnapshot(
      query(convsRef, where('participant2_id', '==', uid)),
      snap => { convs2 = snap.docs.map(mapDoc); got2 = true; merge(); },
      () => { got2 = true; merge(); },
    );
    const t = setTimeout(() => { got1 = true; got2 = true; merge(); }, 8000);
    return () => { u1(); u2(); clearTimeout(t); };
  }, [firebaseUser]);

  // ── Cargar datos de participantes ────────────────────────────────────────────
  useEffect(() => {
    if (!firebaseUser || conversations.length === 0) return;
    const uid = firebaseUser.uid;
    const otherIds = [...new Set(conversations.map(c =>
      c.participant1_id === uid ? c.participant2_id : c.participant1_id
    ))].filter(id => !participantData[id]);
    if (otherIds.length === 0) return;

    Promise.all(otherIds.map(id => getDoc(doc(db, 'users', id)))).then(docs => {
      const data: Record<string, ParticipantInfo> = {};
      docs.forEach(d => {
        if (d.exists()) {
          const u = d.data();
          data[d.id] = { displayName: u.displayName || u.username || 'Familia', photoURL: u.photoURL || u.photos?.[0] || null };
        }
      });
      setParticipantData(prev => ({ ...prev, ...data }));
    });
  }, [conversations, firebaseUser]);

  // ── Acciones de swipe ────────────────────────────────────────────────────────
  const closeOpenSwipeable = (excludeId?: string) => {
    if (openSwipeableId.current && openSwipeableId.current !== excludeId) {
      swipeableRefs.current[openSwipeableId.current]?.close();
    }
  };

  const handleMute = useCallback(async (convId: string) => {
    if (!firebaseUser) return;
    const isMuted = conversations.find(c => c.id === convId)?.muted_by?.includes(firebaseUser.uid);
    try {
      await updateDoc(doc(db, 'conversations', convId), {
        muted_by: isMuted ? arrayRemove(firebaseUser.uid) : arrayUnion(firebaseUser.uid),
      });
    } catch { /* actualización en tiempo real lo refleja si falla */ }
    swipeableRefs.current[convId]?.close();
  }, [conversations, firebaseUser]);

  const handleDelete = useCallback((convId: string) => {
    Alert.alert(
      'Eliminar conversación',
      'La conversación desaparecerá de tu lista. La otra persona no lo sabrá.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => swipeableRefs.current[convId]?.close() },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            if (!firebaseUser) return;
            try {
              await updateDoc(doc(db, 'conversations', convId), {
                hidden_for: arrayUnion(firebaseUser.uid),
              });
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  }, [firebaseUser]);

  const handleReport = useCallback((convId: string, participantId: string) => {
    Alert.alert(
      'Denunciar',
      '¿Qué quieres denunciar?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => swipeableRefs.current[convId]?.close() },
        { text: 'Contenido inapropiado', onPress: () => submitReport(convId, participantId, 'inappropriate_content') },
        { text: 'Acoso o spam', onPress: () => submitReport(convId, participantId, 'harassment_spam') },
      ],
    );
  }, [firebaseUser]);

  const submitReport = async (convId: string, participantId: string, reason: string) => {
    if (!firebaseUser) return;
    try {
      await addDoc(collection(db, 'reports'), {
        reporter_id: firebaseUser.uid,
        reported_user_id: participantId,
        conversation_id: convId,
        reason,
        created_at: serverTimestamp(),
        status: 'pending',
      });
      Alert.alert('Denuncia enviada', 'Revisaremos tu denuncia. Gracias por ayudarnos a mantener la comunidad segura.');
    } catch {
      Alert.alert('Error', 'No se pudo enviar la denuncia. Inténtalo de nuevo.');
    }
    swipeableRefs.current[convId]?.close();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const uid = firebaseUser?.uid ?? '';

  const getOtherId = (conv: Conversation) =>
    conv.participant1_id === uid ? conv.participant2_id : conv.participant1_id;

  const getUnread = (conv: Conversation) =>
    conv.participant1_id === uid ? conv.unread_count_p1 : conv.unread_count_p2;

  const visibleConvs = conversations.filter(c => !c.hidden_for?.includes(uid));
  const filtered = visibleConvs.filter(c => {
    if (search.trim() === '') return true;
    const otherId = getOtherId(c);
    const name = participantData[otherId]?.displayName ?? '';
    const msg = c.last_message_text ?? '';
    return name.toLowerCase().includes(search.toLowerCase()) || msg.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}><ActivityIndicator size="large" color="#c6a7f8" /></View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Mis chats</Text>
          <TouchableOpacity
            style={styles.composeBtn}
            onPress={() => Alert.alert('Nuevo chat', 'Conecta con familias en la pantalla Familias para poder chatear.')}
          >
            <Text style={styles.composeIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversaciones..."
            placeholderTextColor="#8c8c8c"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No tienes conversaciones aún</Text>
            <Text style={styles.emptySubtext}>Conecta con familias para poder chatear</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={c => c.id}
            renderItem={({ item }) => {
              const otherId = getOtherId(item);
              const participant = participantData[otherId];
              const name = participant?.displayName ?? 'Cargando...';
              const photo = participant?.photoURL;
              const unread = getUnread(item);
              const isMuted = item.muted_by?.includes(uid) ?? false;

              return (
                <Swipeable
                  ref={ref => { swipeableRefs.current[item.id] = ref; }}
                  friction={2}
                  rightThreshold={40}
                  onSwipeableWillOpen={() => {
                    closeOpenSwipeable(item.id);
                    openSwipeableId.current = item.id;
                  }}
                  onSwipeableClose={() => {
                    if (openSwipeableId.current === item.id) openSwipeableId.current = null;
                  }}
                  renderRightActions={() => (
                    <View style={styles.swipeActions}>
                      <TouchableOpacity
                        style={[styles.swipeAction, styles.swipeActionMute]}
                        onPress={() => handleMute(item.id)}
                      >
                        <Text style={styles.swipeActionIcon}>{isMuted ? '🔔' : '🔕'}</Text>
                        <Text style={styles.swipeActionText}>{isMuted ? 'Activar' : 'Silenciar'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.swipeAction, styles.swipeActionDelete]}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Text style={styles.swipeActionIcon}>🗑️</Text>
                        <Text style={styles.swipeActionText}>Eliminar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.swipeAction, styles.swipeActionReport]}
                        onPress={() => handleReport(item.id, otherId)}
                      >
                        <Text style={styles.swipeActionIcon}>🚨</Text>
                        <Text style={styles.swipeActionText}>Denunciar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                >
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                      closeOpenSwipeable();
                      navigation.navigate('Chat', {
                        conversationId: item.id,
                        participantId: otherId,
                        participantName: name,
                        participantPhotoURL: photo ?? undefined,
                      });
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.avatarWrap}>
                      {photo ? (
                        <Image source={{ uri: photo }} style={styles.avatarPhoto} />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarInitials}>
                            {name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')}
                          </Text>
                        </View>
                      )}
                      {isMuted && <View style={styles.mutedDot}><Text style={{ fontSize: 8 }}>🔕</Text></View>}
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.itemRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
                        <Text style={[styles.timestamp, isMuted && styles.timestampMuted]}>
                          {item.last_message_timestamp
                            ? new Date(item.last_message_timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </Text>
                      </View>
                      <View style={styles.itemRow}>
                        <Text style={[styles.itemPreview, unread > 0 && styles.itemPreviewUnread]} numberOfLines={1}>
                          {item.last_message_text || 'Sin mensajes aún'}
                        </Text>
                        {unread > 0 && !isMuted && (
                          <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              );
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  toolbarTitle: { fontSize: 28, fontWeight: '700', color: '#1c1c1e' },
  composeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#c6a7f8', justifyContent: 'center', alignItems: 'center',
  },
  composeIcon: { fontSize: 18 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: {
    height: 40, backgroundColor: '#f5f5f5', borderRadius: 20,
    paddingHorizontal: 16, fontSize: 14, color: '#1c1c1e',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: 72, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  avatarWrap: { marginRight: 12, position: 'relative' },
  avatarPhoto: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#e5d7fc', justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 18, fontWeight: '700', color: '#7c4dbc' },
  mutedDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e5e5',
  },
  itemContent: { flex: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', flex: 1, marginBottom: 3 },
  itemPreview: { flex: 1, fontSize: 13, color: '#8c8c8c' },
  itemPreviewUnread: { color: '#1c1c1e', fontWeight: '500' },
  timestamp: { fontSize: 12, color: '#8c8c8c', marginLeft: 8 },
  timestampMuted: { color: '#c0c0c0' },
  badge: {
    backgroundColor: '#c6a7f8', borderRadius: 12,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5, marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  // Swipe actions
  swipeActions: { flexDirection: 'row', alignItems: 'stretch' },
  swipeAction: {
    width: 76, justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  swipeActionMute: { backgroundColor: '#a0b4f0' },
  swipeActionDelete: { backgroundColor: '#ff6b6b' },
  swipeActionReport: { backgroundColor: '#ff9f43' },
  swipeActionIcon: { fontSize: 20 },
  swipeActionText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1c1c1e', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#8c8c8c', textAlign: 'center' },
});
