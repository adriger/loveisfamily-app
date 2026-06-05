import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';
import type { Team } from '../../config/types';

interface Props {
  onSelectGroup: (team: Team) => void;
  onCreateGroup: () => void;
}

export default function GroupsScreen({ onSelectGroup, onCreateGroup }: Props) {
  const [groups, setGroups] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const MOCK_GROUPS: Team[] = [
    { id: '1', name: 'Familias en Barcelona', description: 'Familias diversas de Barcelona y alrededores.', privacy_type: 'public', member_count: 142, owner_id: '', members: {}, created_at: '', activity_ids: [] },
    { id: '2', name: 'Madres lesbianas', description: 'Espacio de apoyo y recursos para madres lesbianas.', privacy_type: 'public', member_count: 89, owner_id: '', members: {}, created_at: '', activity_ids: [] },
    { id: '3', name: 'Familias con adopción', description: 'Familias que han pasado o están en proceso de adopción.', privacy_type: 'public', member_count: 67, owner_id: '', members: {}, created_at: '', activity_ids: [] },
    { id: '4', name: 'Papás gays', description: 'Comunidad de padres gays y sus familias.', privacy_type: 'public', member_count: 54, owner_id: '', members: {}, created_at: '', activity_ids: [] },
    { id: '5', name: 'Crianza respetuosa', description: 'Debate y recursos sobre crianza consciente y respetuosa.', privacy_type: 'public', member_count: 203, owner_id: '', members: {}, created_at: '', activity_ids: [] },
    { id: '6', name: 'Familias trans', description: 'Apoyo a familias con miembros trans o no binarios.', privacy_type: 'private', member_count: 38, owner_id: '', members: {}, created_at: '', activity_ids: [] },
  ];

  useEffect(() => {
    setTimeout(() => { setGroups(MOCK_GROUPS); setLoading(false); }, 600);
  }, []);

  const filtered = groups.filter(
    (g) => search.trim() === '' || g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderGroup = ({ item }: { item: Team }) => (
    <TouchableOpacity style={styles.card} onPress={() => onSelectGroup(item)} activeOpacity={0.85}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          {item.privacy_type === 'private' && (
            <View style={styles.privateBadge}><Text style={styles.privateBadgeText}>🔒 Privado</Text></View>
          )}
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.cardMembers}>👥 {item.member_count} miembros</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Grupos</Text>
          <TouchableOpacity style={styles.createBtn} onPress={onCreateGroup}>
            <Text style={styles.createBtnText}>+ Crear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar grupos..."
            placeholderTextColor="#8c8c8c"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#c6a7f8" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderGroup}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👥</Text>
                <Text style={styles.emptyText}>No hay grupos</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  toolbarTitle: { fontSize: 28, fontWeight: '700', color: '#141414' },
  createBtn: {
    backgroundColor: '#c6a7f8', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
    height: 42, borderRadius: 21, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1c1c1e', padding: 0 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardAvatar: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: '#ede4fd',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardAvatarText: { fontSize: 18, fontWeight: '700', color: '#7c4dbc' },
  cardContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', flex: 1 },
  privateBadge: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  privateBadgeText: { fontSize: 11, color: '#8c8c8c' },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 6 },
  cardMembers: { fontSize: 12, color: '#8c8c8c' },
  chevron: { fontSize: 22, color: '#c6a7f8' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
});
