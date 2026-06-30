import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Modal, Pressable, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { api } from '../../api/client';
import GradientBackground from '../../components/GradientBackground';
import type { ExploreStackParams } from '../../navigation';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  city?: string;
  location?: { city?: string; latitude?: number; longitude?: number };
  schedule?: string;
  rating?: number;
  tags?: string[];
  icon?: string;
  featured?: boolean;
  price?: number;
}

const CATEGORIES = ['Todos', 'Salud', 'Legal', 'Educación', 'Ocio', 'Bienestar'];

const SAVED_KEY = 'explore_saved_ids';

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParams>>();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showReservation, setShowReservation] = useState(false);
  const [activeTab, setActiveTab] = useState<'todos' | 'guardados'>('todos');
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then(val => {
      if (val) setSavedIds(new Set(JSON.parse(val)));
    });
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const q = activeCategory === 'Todos'
          ? query(collection(db, 'services'), where('archived', '==', false))
          : query(collection(db, 'services'), where('archived', '==', false), where('category', '==', activeCategory));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        setServices(docs);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        Alert.alert('Error', message);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, [activeCategory]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = services.filter((s) => {
    const matchSearch =
      search.trim() === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.tags ?? []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchTab = activeTab === 'todos' || savedIds.has(s.id);
    return matchSearch && matchTab;
  });

  const renderCard = ({ item }: { item: Service }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedService(item)} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Text style={styles.cardIcon}>{item.icon ?? '🏢'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardLocation}>📍 {item.city ?? item.location?.city ?? ''}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleSaved(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 20 }}>{savedIds.has(item.id) ? '🔖' : '🏷️'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.tagsRow}>
          {(item.tags ?? []).map((tag) => (
            <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
          ))}
        </View>
        {item.rating != null && (
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Explorar</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyReservations')} style={styles.reservationsBtn}>
            <Text style={styles.reservationsBtnText}>Mis reservas</Text>
          </TouchableOpacity>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'todos' && styles.tabBtnActive]}
              onPress={() => setActiveTab('todos')}
            >
              <Text style={[styles.tabText, activeTab === 'todos' && styles.tabTextActive]}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'guardados' && styles.tabBtnActive]}
              onPress={() => setActiveTab('guardados')}
            >
              <Text style={[styles.tabText, activeTab === 'guardados' && styles.tabTextActive]}>Tus lugares</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
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
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loadingServices ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#c6a7f8" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderCard}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>
                  {activeTab === 'guardados' ? 'No tienes lugares guardados' : 'Sin resultados'}
                </Text>
                <Text style={styles.emptySubtext}>Prueba con otro filtro</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <Modal visible={!!selectedService} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => { setSelectedService(null); setShowReservation(false); }}>
          <Pressable style={styles.detailSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            {selectedService && !showReservation && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailIcon}>{selectedService.icon ?? '🏢'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailName}>{selectedService.name}</Text>
                    <Text style={styles.detailLocation}>📍 {selectedService.city ?? selectedService.location?.city ?? ''}</Text>
                  </View>
                  {selectedService.rating != null && (
                    <View style={styles.ratingPill}>
                      <Text style={styles.ratingText}>⭐ {selectedService.rating}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.detailCategory}>{selectedService.category}</Text>
                <Text style={styles.detailDesc}>{selectedService.description}</Text>
                <View style={[styles.tagsRow, { marginVertical: 16 }]}>
                  {(selectedService.tags ?? []).map((tag) => (
                    <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                  ))}
                </View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>ℹ️  Información</Text>
                  <Text style={styles.detailSectionText}>{selectedService.schedule ?? ''}</Text>
                  <Text style={styles.detailSectionText}>Cita previa requerida</Text>
                </View>
                <TouchableOpacity style={styles.reserveBtn} onPress={() => setShowReservation(true)}>
                  <Text style={styles.reserveBtnText}>Reservar cita</Text>
                </TouchableOpacity>
                <Text style={styles.contactNote}>
                  Tras la reserva nos pondremos en contacto contigo para confirmar disponibilidad.
                </Text>
              </>
            )}

            {selectedService && showReservation && (
              <ReservationForm
                service={selectedService}
                onSubmit={() => { setShowReservation(false); setSelectedService(null); }}
                onBack={() => setShowReservation(false)}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </GradientBackground>
  );
}

function ReservationForm({ service, onSubmit, onBack }: { service: Service; onSubmit: () => void; onBack: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [hh, setHh] = useState('');
  const [min, setMin] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mmRef = useRef<TextInput>(null);
  const yyyyRef = useRef<TextInput>(null);
  const hhRef = useRef<TextInput>(null);
  const minRef = useRef<TextInput>(null);

  const handleDd = (t: string) => {
    const v = t.replace(/[^0-9]/g, '').slice(0, 2);
    setDd(v);
    if (v.length === 2) mmRef.current?.focus();
  };
  const handleMm = (t: string) => {
    const v = t.replace(/[^0-9]/g, '').slice(0, 2);
    setMm(v);
    if (v.length === 2) yyyyRef.current?.focus();
  };
  const handleYyyy = (t: string) => {
    const v = t.replace(/[^0-9]/g, '').slice(0, 4);
    setYyyy(v);
    if (v.length === 4) hhRef.current?.focus();
  };
  const handleHh = (t: string) => {
    const v = t.replace(/[^0-9]/g, '').slice(0, 2);
    setHh(v);
    if (v.length === 2) minRef.current?.focus();
  };
  const handleMin = (t: string) => setMin(t.replace(/[^0-9]/g, '').slice(0, 2));

  const dateValid = dd.length === 2 && mm.length === 2 && yyyy.length === 4;
  const timeValid = hh.length === 2 && min.length === 2;
  const canSubmit = name.trim() && phone.trim() && dateValid && timeValid;

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.services.createReservation({
        serviceId: service.id,
        userName: name,
        userPhone: phone,
        requestedDate: `${dd}/${mm}/${yyyy}`,
        requestedTime: `${hh}:${min}`,
        notes,
      });
      onSubmit();
      Alert.alert('Reserva enviada', 'Te contactaremos para confirmar tu cita.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar la reserva';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#c6a7f8', fontSize: 15, fontWeight: '500' }}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.detailName}>Reservar en {service.name}</Text>
        <Text style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 20 }}>
          Completa tus datos y nos pondremos en contacto contigo.
        </Text>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Nombre completo</Text>
          <TextInput style={styles.formInput} value={name} onChangeText={setName}
            placeholder="Tu nombre" placeholderTextColor="#c0c0c0" returnKeyType="next" />
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Teléfono de contacto</Text>
          <TextInput style={styles.formInput} value={phone} onChangeText={setPhone}
            placeholder="+34 600 000 000" placeholderTextColor="#c0c0c0"
            keyboardType="phone-pad" returnKeyType="next" />
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Fecha y hora preferida</Text>
          <View style={styles.dateRow}>
            <TextInput style={[styles.formInput, styles.dateSegment]} value={dd}
              onChangeText={handleDd} placeholder="DD" placeholderTextColor="#c0c0c0"
              keyboardType="number-pad" maxLength={2} textAlign="center" />
            <Text style={styles.dateSep}>/</Text>
            <TextInput ref={mmRef} style={[styles.formInput, styles.dateSegment]} value={mm}
              onChangeText={handleMm} placeholder="MM" placeholderTextColor="#c0c0c0"
              keyboardType="number-pad" maxLength={2} textAlign="center" />
            <Text style={styles.dateSep}>/</Text>
            <TextInput ref={yyyyRef} style={[styles.formInput, styles.dateSegmentYear]} value={yyyy}
              onChangeText={handleYyyy} placeholder="AAAA" placeholderTextColor="#c0c0c0"
              keyboardType="number-pad" maxLength={4} textAlign="center" />
            <Text style={styles.dateSep}> · </Text>
            <TextInput ref={hhRef} style={[styles.formInput, styles.dateSegment]} value={hh}
              onChangeText={handleHh} placeholder="HH" placeholderTextColor="#c0c0c0"
              keyboardType="number-pad" maxLength={2} textAlign="center" />
            <Text style={styles.dateSep}>:</Text>
            <TextInput ref={minRef} style={[styles.formInput, styles.dateSegment]} value={min}
              onChangeText={handleMin} placeholder="MM" placeholderTextColor="#c0c0c0"
              keyboardType="number-pad" maxLength={2} textAlign="center" />
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Notas adicionales</Text>
          <TextInput style={[styles.formInput, { height: 72 }]} value={notes}
            onChangeText={setNotes} placeholder="Opcional" placeholderTextColor="#c0c0c0"
            multiline />
        </View>

        <TouchableOpacity
          style={[styles.reserveBtn, { opacity: canSubmit && !submitting ? 1 : 0.5 }]}
          onPress={canSubmit && !submitting ? handleConfirm : undefined}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.reserveBtnText}>Confirmar reserva</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  reservationsBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, backgroundColor: '#ede4fd' },
  reservationsBtnText: { fontSize: 12, color: '#c6a7f8', fontWeight: '600' },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbarTitle: { fontSize: 28, fontWeight: '700', color: '#141414', marginBottom: 12 },
  tabRow: { flexDirection: 'row', backgroundColor: '#f0ecfa', borderRadius: 12, padding: 3, alignSelf: 'flex-start' },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, color: '#8c8c8c', fontWeight: '500' },
  tabTextActive: { color: '#1c1c1e', fontWeight: '600' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    height: 42,
    borderRadius: 21,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1c1c1e', padding: 0 },
  chipsScroll: { maxHeight: 46, flexGrow: 0 },
  chipsContainer: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  chip: { height: 34, paddingHorizontal: 16, borderRadius: 17, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  chipActive: { backgroundColor: '#ede4fd' },
  chipText: { fontSize: 13, color: '#8c8c8c', fontWeight: '500' },
  chipTextActive: { color: '#c6a7f8' },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 12 },
  cardIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#f0ecfa', alignItems: 'center', justifyContent: 'center',
  },
  cardIcon: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 3 },
  cardLocation: { fontSize: 12, color: '#8c8c8c' },
  cardDesc: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  tag: { backgroundColor: '#ede4fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, color: '#c6a7f8', fontWeight: '500' },
  ratingPill: { backgroundColor: '#fff9e6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#b8860b' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1c1c1e', marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: '#8c8c8c' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  detailSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 48,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ede4fd', alignSelf: 'center', marginBottom: 20,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 8 },
  detailIcon: { fontSize: 40 },
  detailName: { fontSize: 20, fontWeight: '700', color: '#1c1c1e', marginBottom: 4 },
  detailLocation: { fontSize: 13, color: '#8c8c8c' },
  detailCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#ede4fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    color: '#7c4dbc',
    fontWeight: '600',
    marginBottom: 14,
  },
  detailDesc: { fontSize: 15, color: '#444', lineHeight: 22 },
  detailSection: {
    backgroundColor: '#faf7ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  detailSectionTitle: { fontSize: 14, fontWeight: '600', color: '#1c1c1e', marginBottom: 8 },
  detailSectionText: { fontSize: 13, color: '#555', marginBottom: 4 },
  reserveBtn: {
    backgroundColor: '#c6a7f8',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  reserveBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  contactNote: { fontSize: 12, color: '#8c8c8c', textAlign: 'center', lineHeight: 17 },
  formField: { marginBottom: 14 },
  formLabel: { fontSize: 13, color: '#555', fontWeight: '500', marginBottom: 6 },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1c1c1e',
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateSegment: { flex: 1, paddingHorizontal: 8 },
  dateSegmentYear: { flex: 1.6, paddingHorizontal: 8 },
  dateSep: { fontSize: 18, color: '#8c8c8c', fontWeight: '500' },
});
