import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface Reservation {
  id: string;
  service_name: string;
  requested_date: string;
  status: ReservationStatus;
  confirmed_datetime?: string | null;
  cancel_reason?: string | null;
}

interface Props {
  onBack: () => void;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada ✅',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const STATUS_COLORS: Record<ReservationStatus, { bg: string; text: string }> = {
  pending: { bg: '#fff8e1', text: '#b45309' },
  confirmed: { bg: '#f0fdf4', text: '#15803d' },
  cancelled: { bg: '#fef2f2', text: '#b91c1c' },
  completed: { bg: '#f5f5f5', text: '#6b7280' },
};

function formatSpanish(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function MyReservationsScreen({ onBack }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.services.getMyReservations({});
        setReservations(result as Reservation[]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al cargar reservas';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backBtn}>‹ Volver</Text>
          </TouchableOpacity>
          <Text style={styles.toolbarTitle}>Mis reservas</Text>
          <View style={{ width: 64 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#c6a7f8" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {reservations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>No tienes reservas aún</Text>
              </View>
            ) : (
              reservations.map((item) => {
                const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.serviceName}>{item.service_name}</Text>
                      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dateText}>📅 {item.requested_date}</Text>
                    {item.status === 'confirmed' && item.confirmed_datetime ? (
                      <Text style={styles.confirmedText}>
                        Confirmada para el {formatSpanish(item.confirmed_datetime)}
                      </Text>
                    ) : null}
                    {item.status === 'cancelled' && item.cancel_reason ? (
                      <Text style={styles.cancelText}>Motivo: {item.cancel_reason}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backBtn: { fontSize: 16, color: '#c6a7f8', fontWeight: '500', width: 64 },
  toolbarTitle: { fontSize: 20, fontWeight: '700', color: '#1c1c1e' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', flex: 1, marginRight: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  dateText: { fontSize: 13, color: '#8c8c8c', marginBottom: 6 },
  confirmedText: { fontSize: 13, color: '#15803d', marginTop: 4 },
  cancelText: { fontSize: 13, color: '#b91c1c', marginTop: 4 },
});
