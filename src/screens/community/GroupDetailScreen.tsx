import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';
import type { Team } from '../../config/types';

interface MockPost {
  id: string;
  author: string;
  text: string;
  likes: number;
  comments: number;
  time: string;
}

const MOCK_POSTS: MockPost[] = [
  { id: '1', author: 'Ana G.', text: '¿Alguien conoce actividades para el puente de mayo en Barcelona?', likes: 12, comments: 5, time: 'Hace 2h' },
  { id: '2', author: 'Carlos M.', text: 'Compartimos experiencia con la guardería Arcoíris, muy recomendable para familias diversas 🌈', likes: 34, comments: 11, time: 'Ayer' },
  { id: '3', author: 'Laura P.', text: 'Organizamos quedada familiar este sábado en el parque de la Ciutadella. ¡Apuntaos!', likes: 28, comments: 18, time: 'Hace 2 días' },
];

interface Props {
  group: Team;
  onBack: () => void;
  onOpenChat: (group: Team) => void;
}

export default function GroupDetailScreen({ group, onBack, onOpenChat }: Props) {
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setJoined(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setJoining(false);
    }
  };

  const renderPost = ({ item }: { item: MockPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{item.author.slice(0, 2)}</Text>
        </View>
        <View>
          <Text style={styles.postAuthor}>{item.author}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🤍</Text>
          <Text style={styles.actionCount}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          data={MOCK_POSTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderPost}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            <>
              {/* Toolbar */}
              <View style={styles.toolbar}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                  <Text style={styles.backArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.toolbarTitle} numberOfLines={1}>{group.name}</Text>
                <TouchableOpacity style={styles.chatBtn} onPress={() => onOpenChat(group)}>
                  <Text style={styles.chatIcon}>💬</Text>
                </TouchableOpacity>
              </View>

              {/* Info del grupo */}
              <View style={styles.groupHeader}>
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupAvatarText}>{group.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDesc}>{group.description}</Text>
                <Text style={styles.groupMembers}>👥 {group.member_count} miembros</Text>

                {joined ? (
                  <View style={styles.joinedBadge}>
                    <Text style={styles.joinedText}>✓ Miembro</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} disabled={joining}>
                    {joining ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.joinBtnText}>Unirse al grupo</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.sectionTitle}>Publicaciones recientes</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aún no hay publicaciones</Text>
            </View>
          }
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f9f6fe', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 26, color: '#1c1c1e', lineHeight: 30, marginTop: -2 },
  toolbarTitle: { fontSize: 17, fontWeight: '600', color: '#1c1c1e', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  chatBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f9f6fe', alignItems: 'center', justifyContent: 'center',
  },
  chatIcon: { fontSize: 20 },
  listContent: { paddingBottom: 24 },
  groupHeader: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 24 },
  groupAvatar: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#ede4fd',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  groupAvatarText: { fontSize: 28, fontWeight: '700', color: '#7c4dbc' },
  groupName: { fontSize: 22, fontWeight: '700', color: '#1c1c1e', marginBottom: 8, textAlign: 'center' },
  groupDesc: { fontSize: 14, color: '#555', lineHeight: 20, textAlign: 'center', marginBottom: 10 },
  groupMembers: { fontSize: 13, color: '#8c8c8c', marginBottom: 20 },
  joinBtn: {
    backgroundColor: '#c6a7f8', paddingHorizontal: 32, paddingVertical: 12,
    borderRadius: 24, minWidth: 160, alignItems: 'center',
  },
  joinBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  joinedBadge: {
    backgroundColor: '#e8f5e9', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24,
  },
  joinedText: { fontSize: 14, fontWeight: '600', color: '#4caf50' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1c1c1e', marginHorizontal: 20, marginBottom: 12 },
  postCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  postAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#ede4fd', alignItems: 'center', justifyContent: 'center',
  },
  postAvatarText: { fontSize: 13, fontWeight: '600', color: '#7c4dbc' },
  postAuthor: { fontSize: 14, fontWeight: '600', color: '#1c1c1e' },
  postTime: { fontSize: 12, color: '#8c8c8c' },
  postText: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 12 },
  postActions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionIcon: { fontSize: 18 },
  actionCount: { fontSize: 13, color: '#666', fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#8c8c8c' },
});
