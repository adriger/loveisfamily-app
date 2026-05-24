import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';
import type { Match } from '../../config/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  mutual_match: 'Match mutuo',
  rejected: 'Rechazado',
  expired: 'Expirado',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#fc9b45',
  accepted: '#c6a7f8',
  mutual_match: '#c6a7f8',
  rejected: '#f5f5f5',
  expired: '#f5f5f5',
};

const STATUS_TEXT_COLOR: Record<string, string> = {
  pending: '#ffffff',
  accepted: '#ffffff',
  mutual_match: '#ffffff',
  rejected: '#8c8c8c',
  expired: '#8c8c8c',
};

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.matching.getHistory({ limit: 20 })
      .then(result => setMatches(result.matches))
      .catch(err => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (matchId: string, response: 'accept' | 'reject') => {
    try {
      const result = await api.matching.respond({ matchId, response });
      setMatches(prev => prev.map(m =>
        m.id === matchId ? { ...m, status: result.status as any } : m
      ));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c6a7f8" />
        </View>
      </GradientBackground>
    );
  }

  const pending = matches.filter(m => m.status === 'pending');
  const active = matches.filter(m => m.status !== 'pending');

  const renderCard = ({ item }: { item: Match }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.id.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>Familia #{item.id.slice(0, 6)}</Text>
          <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString('es-ES')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] }]}>
          <Text style={[styles.statusText, { color: STATUS_TEXT_COLOR[item.status] }]}>
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
      </View>
      {item.status === 'pending' && (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRespond(item.id, 'reject')}>
            <Text style={styles.rejectBtnText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => handleRespond(item.id, 'accept')}>
            <Text style={styles.acceptBtnText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Conexiones</Text>
        </View>

        {matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>&#x2728;</Text>
            <Text style={styles.emptyText}>Aun no tienes conexiones</Text>
            <Text style={styles.emptySubtext}>Ve a Familias y conecta con alguien</Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <>
                {pending.length > 0 && (
                  <Text style={styles.sectionLabel}>Pendientes</Text>
                )}
              </>
            }
            renderItem={renderCard}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toolbarTitle: { fontSize: 28, fontWeight: '700', color: '#1c1c1e' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8c8c8c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
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
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5d7fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#1c1c1e' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 2 },
  cardDate: { fontSize: 12, color: '#8c8c8c' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectBtnText: { color: '#8c8c8c', fontSize: 13, fontWeight: '500' },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#c6a7f8',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1c1c1e', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#8c8c8c' },
});
