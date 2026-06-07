import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Modal, Pressable, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  tags: string[];
  icon: string;
  saved?: boolean;
}

const CATEGORIES = ['Todos', 'Salud', 'Legal', 'Educación', 'Ocio', 'Bienestar'];

const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Psicología Familiar LGBTI+', category: 'Salud', description: 'Terapia familiar y de pareja especializada en familias diversas.', location: 'Barcelona, 2.1 km', rating: 4.9, tags: ['Terapia', 'Familias'], icon: '🧠', saved: true },
  { id: '2', name: 'Despacho Arco Legal', category: 'Legal', description: 'Asesoría jurídica en adopción, custodia y derechos LGBTI+.', location: 'Barcelona, 3.4 km', rating: 4.8, tags: ['Adopción', 'Custodia'], icon: '⚖️' },
  { id: '3', name: 'Guardería Arcoíris', category: 'Educación', description: 'Centro educativo inclusivo para peques de 0 a 6 años.', location: 'Gràcia, 1.8 km', rating: 4.7, tags: ['0-6 años', 'Inclusivo'], icon: '🎒' },
  { id: '4', name: 'Club Familiar Diverso', category: 'Ocio', description: 'Actividades y eventos para familias diversas cada fin de semana.', location: 'Poble Sec, 4.2 km', rating: 4.6, tags: ['Eventos', 'Fin de semana'], icon: '🎪' },
  { id: '5', name: 'Centro de Bienestar Familia', category: 'Bienestar', description: 'Yoga familiar, meditación y talleres para toda la familia.', location: 'Eixample, 2.9 km', rating: 4.5, tags: ['Yoga', 'Talleres'], icon: '🧘' },
  { id: '6', name: 'Pediatría Inclusiva', category: 'Salud', description: 'Equipo pediátrico con experiencia en familias diversas y homoparentales.', location: 'Sant Martí, 3.1 km', rating: 4.9, tags: ['Pediatría', 'Homoparental'], icon: '👶' },
  { id: '7', name: 'Escuela de Familias', category: 'Educación', description: 'Talleres y formación para madres y padres de familias diversas.', location: 'Horta, 5.0 km', rating: 4.4, tags: ['Talleres', 'Formación'], icon: '📚' },
];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['1']));
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showReservation, setShowReservation] = useState(false);
  const [activeTab, setActiveTab] = useState<'todos' | 'guardados'>('todos');

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = MOCK_SERVICES.filter((s) => {
    const matchSearch =
      search.trim() === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === 'Todos' || s.category === activeCategory;
    const matchTab = activeTab === 'todos' || savedIds.has(s.id);
    return matchSearch && matchCat && matchTab;
  });

  const renderCard = ({ item }: { item: Service }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedService(item)} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardLocation}>📍 {item.location}</Text>
        </View>
        <TouchableOpacity onPress={() => toggleSaved(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 20 }}>{savedIds.has(item.id) ? '🔖' : '🏷️'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
          ))}
        </View>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>Explorar</Text>
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

        {/* Buscador */}
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

        {/* Chips de categoría */}
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

        {/* Lista */}
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
      </SafeAreaView>

      {/* Modal detalle del servicio */}
      <Modal visible={!!selectedService} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => { setSelectedService(null); setShowReservation(false); }}>
          <Pressable style={styles.detailSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            {selectedService && !showReservation && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailIcon}>{selectedService.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailName}>{selectedService.name}</Text>
                    <Text style={styles.detailLocation}>📍 {selectedService.location}</Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>⭐ {selectedService.rating}</Text>
                  </View>
                </View>
                <Text style={styles.detailCategory}>{selectedService.category}</Text>
                <Text style={styles.detailDesc}>{selectedService.description}</Text>
                <View style={[styles.tagsRow, { marginVertical: 16 }]}>
                  {selectedService.tags.map((tag) => (
                    <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                  ))}
                </View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>ℹ️  Información</Text>
                  <Text style={styles.detailSectionText}>Lunes a Viernes · 9:00 - 19:00</Text>
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
  const [notes, setNotes] = useState('');
  const mmRef = useRef<TextInput>(null);
  const yyyyRef = useRef<TextInput>(null);

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
  const handleYyyy = (t: string) => setYyyy(t.replace(/[^0-9]/g, '').slice(0, 4));

  const dateValid = dd.length === 2 && mm.length === 2 && yyyy.length === 4;
  const canSubmit = name.trim() && phone.trim() && dateValid;

  const handleConfirm = () => {
    onSubmit();
    Alert.alert('Reserva enviada', 'Nos pondremos en contacto contigo para confirmar la cita.');
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
          <Text style={styles.formLabel}>Fecha preferida</Text>
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
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.formLabel}>Notas adicionales</Text>
          <TextInput style={[styles.formInput, { height: 72 }]} value={notes}
            onChangeText={setNotes} placeholder="Opcional" placeholderTextColor="#c0c0c0"
            multiline />
        </View>

        <TouchableOpacity
          style={[styles.reserveBtn, { opacity: canSubmit ? 1 : 0.5 }]}
          onPress={canSubmit ? handleConfirm : undefined}
        >
          <Text style={styles.reserveBtnText}>Confirmar reserva</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
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
