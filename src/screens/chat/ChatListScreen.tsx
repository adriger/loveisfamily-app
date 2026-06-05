import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, orderBy, onSnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import GradientBackground from '../../components/GradientBackground';
import { db } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import { ChatStackParams } from '../../navigation';
import type { Conversation } from '../../config/types';

export default function ChatListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParams>>();
  const { firebaseUser } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    const uid = firebaseUser.uid;
    const convsRef = collection(db, 'conversations');

    // Queries sin orderBy para evitar error si el índice compuesto no existe.
    // Ordenamos en cliente después de recibir los datos.
    const q1 = query(convsRef, where('participant1_id', '==', uid));
    const q2 = query(convsRef, where('participant2_id', '==', uid));

    let convs1: Conversation[] = [];
    let convs2: Conversation[] = [];
    let got1 = false;
    let got2 = false;

    const merge = () => {
      if (!got1 || !got2) return;
      const merged = [...convs1, ...convs2];
      merged.sort((a, b) => {
        const ta = a.last_message_timestamp ?? '';
        const tb = b.last_message_timestamp ?? '';
        return tb.localeCompare(ta);
      });
      const seen = new Set<string>();
      const deduped = merged.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      setConversations(deduped);
      setLoading(false);
    };

    const mapDoc = (doc: QueryDocumentSnapshot<DocumentData>): Conversation => ({
      id: doc.id,
      ...(doc.data() as Omit<Conversation, 'id' | 'last_message_timestamp' | 'created_at'>),
      last_message_timestamp: doc.data().last_message_timestamp?.toDate?.()?.toISOString() ?? null,
      created_at: doc.data().created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    });

    const unsub1 = onSnapshot(
      q1,
      snap => { convs1 = snap.docs.map(mapDoc); got1 = true; merge(); },
      err => { console.warn('Chat q1 error:', err); got1 = true; merge(); },
    );
    const unsub2 = onSnapshot(
      q2,
      snap => { convs2 = snap.docs.map(mapDoc); got2 = true; merge(); },
      err => { console.warn('Chat q2 error:', err); got2 = true; merge(); },
    );

    // Fallback por si Firestore no responde en 8 s (emulador apagado, sin conexión)
    const timeout = setTimeout(() => { got1 = true; got2 = true; merge(); }, 8000);

    return () => { unsub1(); unsub2(); clearTimeout(timeout); };
  }, [firebaseUser]);

  const getUnreadCount = (conv: Conversation) => {
    if (!firebaseUser) return 0;
    return conv.participant1_id === firebaseUser.uid ? conv.unread_count_p1 : conv.unread_count_p2;
  };

  const filtered = conversations.filter(c =>
    search.trim() === '' || (c.last_message_text || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c6a7f8" />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Mis chats</Text>
          <TouchableOpacity style={styles.composeBtn}>
            <Text style={styles.composeIcon}>&#x270F;</Text>
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
            <Text style={styles.emptyIcon}>&#x1F4AC;</Text>
            <Text style={styles.emptyText}>No tienes conversaciones aun</Text>
            <Text style={styles.emptySubtext}>Consigue una conexion mutua para chatear</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={c => c.id}
            renderItem={({ item }) => {
              const unread = getUnreadCount(item);
              return (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => navigation.navigate('Chat', {
                    conversationId: item.id,
                    participantName: 'Chat',
                  })}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>&#x1F4AC;</Text>
                  </View>
                  <View style={styles.itemContent}>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemName}>Conversacion</Text>
                      {item.last_message_timestamp ? (
                        <Text style={styles.timestamp}>
                          {new Date(item.last_message_timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemPreview} numberOfLines={1}>
                        {item.last_message_text || 'Sin mensajes aun'}
                      </Text>
                      {unread > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toolbarTitle: { fontSize: 28, fontWeight: '700', color: '#1c1c1e' },
  composeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#c6a7f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  composeIcon: { fontSize: 20, color: '#ffffff' },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1c1c1e',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5d7fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20 },
  itemContent: { flex: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 2 },
  itemPreview: { flex: 1, fontSize: 13, color: '#8c8c8c' },
  timestamp: { fontSize: 12, color: '#8c8c8c', marginLeft: 8 },
  badge: {
    backgroundColor: '#c6a7f8',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1c1c1e', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#8c8c8c', textAlign: 'center' },
});
