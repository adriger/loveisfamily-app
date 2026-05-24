import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';
import type { MatchSuggestion } from '../../config/types';

const FILTER_CHIPS = ['Todos', 'Deportes', 'Arte', 'Naturaleza', 'Musica', 'Viajes', 'Gastronomia'];

export default function ExploreScreen() {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('Todos');

  const loadSuggestions = useCallback(async () => {
    try {
      const result = await api.matching.getSuggestions({ limit: 20 });
      setSuggestions(Array.isArray(result) ? result : []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudieron cargar las familias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

  const filtered = suggestions.filter(s => {
    const matchesSearch =
      search.trim() === '' ||
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.interests.some(i => i.toLowerCase().includes(search.toLowerCase()));
    const matchesChip =
      activeChip === 'Todos' ||
      s.interests.some(i => i.toLowerCase().includes(activeChip.toLowerCase()));
    return matchesSearch && matchesChip;
  });

  const renderCard = ({ item }: { item: MatchSuggestion }) => {
    const initials = item.displayName
      .split(' ')
      .slice(0, 2)
      .map(w => w.charAt(0).toUpperCase())
      .join('');

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.displayName}</Text>
            {(item as any).distance_km !== undefined ? (
              <Text style={styles.cardLocation}>&#x1F4CD; {(item as any).distance_km} km</Text>
            ) : null}
          </View>
          {item.compatibility_score > 0 ? (
            <View style={styles.compatPill}>
              <Text style={styles.compatText}>{item.compatibility_score}%</Text>
            </View>
          ) : null}
        </View>

        {item.interests.length > 0 ? (
          <View style={styles.tagsRow}>
            {item.interests.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity style={styles.viewProfileBtn}>
          <Text style={styles.viewProfileText}>Ver perfil &#x2192;</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Explorar</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterIcon}>&#x22EE;&#x22EE;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>&#x1F50D;</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar familias o actividades..."
            placeholderTextColor="#8c8c8c"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScroll}
        >
          {FILTER_CHIPS.map(chip => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, activeChip === chip && styles.chipActive]}
              onPress={() => setActiveChip(chip)}
            >
              <Text style={[styles.chipText, activeChip === chip && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#c6a7f8" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.user_id}
            contentContainerStyle={styles.list}
            renderItem={renderCard}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>&#x1F50D;</Text>
                <Text style={styles.emptyText}>No hay familias que coincidan</Text>
                <Text style={styles.emptySubtext}>Prueba con otro filtro o busqueda</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  toolbarTitle: { fontSize: 28, fontWeight: '700', color: '#141414' },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: { fontSize: 16, color: '#1c1c1e', letterSpacing: -2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    height: 40,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1c1c1e',
    padding: 0,
  },
  chipsScroll: { maxHeight: 48, flexGrow: 0 },
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#ede4fd',
  },
  chipText: { fontSize: 13, color: '#8c8c8c', fontWeight: '500' },
  chipTextActive: { color: '#c6a7f8' },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5d7fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 17, fontWeight: '600', color: '#1c1c1e' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 2 },
  cardLocation: { fontSize: 13, color: '#8c8c8c' },
  compatPill: {
    backgroundColor: '#ede4fd',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  compatText: { fontSize: 12, fontWeight: '600', color: '#c6a7f8' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  tag: {
    backgroundColor: '#ede4fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, color: '#c6a7f8', fontWeight: '500' },
  viewProfileBtn: { alignSelf: 'flex-start' },
  viewProfileText: { fontSize: 13, color: '#c6a7f8', fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1c1c1e', marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: '#8c8c8c' },
});
