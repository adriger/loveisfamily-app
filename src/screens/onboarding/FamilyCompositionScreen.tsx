import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  FlatList, Pressable, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Composition {
  household?: string;
  childrenAges?: string[];
  pets?: string[];
}

interface Props {
  onNext: (composition: Composition) => void;
  onBack: () => void;
}

const HOUSEHOLD_OPTIONS = [
  'Dos madres',
  'Dos padres',
  'Monoparental',
  'Familia reconstituida',
  'Otras configuraciones',
];

const AGE_RANGE_OPTIONS = ['0-2 años', '3-5 años', '6-9 años', '10-12 años', '13+ años'];
const PET_OPTIONS = ['Perro', 'Gato', 'Ave', 'Pez', 'Roedor', 'Reptil', 'Otro'];

type SheetType = 'household' | 'childAge' | 'pet';

function Toast({ message, visible }: { message: string; visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1600),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, message]);

  return (
    <Animated.View style={[styles.toast, { opacity }]} pointerEvents="none">
      <Text style={styles.toastText}>✓ {message}</Text>
    </Animated.View>
  );
}

export default function FamilyCompositionScreen({ onNext, onBack }: Props) {
  const [composition, setComposition] = useState<Composition>({});
  const [activeSheet, setActiveSheet] = useState<SheetType | null>(null);
  const [toast, setToast] = useState({ message: '', key: 0 });

  const showToast = (message: string) =>
    setToast((prev) => ({ message, key: prev.key + 1 }));

  const selectHousehold = (option: string) => {
    setComposition((prev) => ({ ...prev, household: option }));
    setActiveSheet(null);
    showToast(`"${option}" añadido`);
  };

  const toggleChildAge = (age: string) => {
    setComposition((prev) => {
      const current = prev.childrenAges ?? [];
      const next = current.includes(age)
        ? current.filter((a) => a !== age)
        : [...current, age];
      return { ...prev, childrenAges: next };
    });
  };

  const togglePet = (pet: string) => {
    setComposition((prev) => {
      const current = prev.pets ?? [];
      const next = current.includes(pet)
        ? current.filter((p) => p !== pet)
        : [...current, pet];
      return { ...prev, pets: next };
    });
  };

  const confirmSheet = () => {
    if (activeSheet === 'childAge') {
      const count = composition.childrenAges?.length ?? 0;
      if (count > 0) showToast(`${count} rango${count > 1 ? 's' : ''} de edad añadido${count > 1 ? 's' : ''}`);
    } else if (activeSheet === 'pet') {
      const count = composition.pets?.length ?? 0;
      if (count > 0) showToast(`${count} mascota${count > 1 ? 's' : ''} añadida${count > 1 ? 's' : ''}`);
    }
    setActiveSheet(null);
  };

  const childrenLabel =
    (composition.childrenAges?.length ?? 0) > 0
      ? composition.childrenAges!.join(', ')
      : null;

  const petsLabel =
    (composition.pets?.length ?? 0) > 0
      ? composition.pets!.join(', ')
      : null;

  const isComplete = !!composition.household;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '65%' }]} />
            </View>
          </View>

          <Text style={styles.title}>Composición familiar</Text>
          <Text style={styles.subtitle}>¿Cómo está formada?</Text>

          <View style={styles.selectors}>
            {/* Hogar */}
            <TouchableOpacity style={styles.selectorRow} onPress={() => setActiveSheet('household')}>
              <View style={styles.selectorContent}>
                <Text style={styles.sectorCategory}>¿Quiénes forman tu hogar?</Text>
                {composition.household ? (
                  <Text style={styles.selectorValue}>{composition.household}</Text>
                ) : (
                  <Text style={styles.selectorPlaceholder}>Seleccionar</Text>
                )}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Peques */}
            <TouchableOpacity style={styles.selectorRow} onPress={() => setActiveSheet('childAge')}>
              <View style={styles.selectorContent}>
                <Text style={styles.sectorCategory}>Peques</Text>
                {childrenLabel ? (
                  <Text style={styles.selectorValue} numberOfLines={1}>{childrenLabel}</Text>
                ) : (
                  <Text style={styles.selectorPlaceholder}>Añadir rango de edad</Text>
                )}
              </View>
              <Text style={styles.chevron}>{childrenLabel ? '›' : '+'}</Text>
            </TouchableOpacity>

            {/* Mascotas */}
            <TouchableOpacity style={styles.selectorRow} onPress={() => setActiveSheet('pet')}>
              <View style={styles.selectorContent}>
                <Text style={styles.sectorCategory}>Tipo de mascotas</Text>
                {petsLabel ? (
                  <Text style={styles.selectorValue} numberOfLines={1}>{petsLabel}</Text>
                ) : (
                  <Text style={styles.selectorPlaceholder}>Añadir tipo de mascota</Text>
                )}
              </View>
              <Text style={styles.chevron}>{petsLabel ? '›' : '+'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.btnWrap}>
            <Button
              title="Continuar"
              onPress={() => onNext(composition)}
              disabled={!isComplete}
            />
          </View>
        </View>
      </SafeAreaView>

      <Toast message={toast.message} visible={toast.key > 0} key={toast.key} />

      {/* Sheet de hogar */}
      <Modal visible={activeSheet === 'household'} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setActiveSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>¿Quiénes forman tu hogar?</Text>
            {HOUSEHOLD_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.sheetOption, composition.household === opt && styles.sheetOptionSelected]}
                onPress={() => selectHousehold(opt)}
              >
                <Text style={[styles.sheetOptionText, composition.household === opt && styles.sheetOptionTextSelected]}>
                  {opt}
                </Text>
                {composition.household === opt && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sheet de rangos de edad */}
      <Modal visible={activeSheet === 'childAge'} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={confirmSheet}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Peques</Text>
            <Text style={styles.sheetSubtitle}>Selecciona los rangos de edad (puedes elegir varios)</Text>
            {AGE_RANGE_OPTIONS.map((age) => {
              const selected = composition.childrenAges?.includes(age);
              return (
                <TouchableOpacity
                  key={age}
                  style={[styles.sheetOption, selected && styles.sheetOptionSelected]}
                  onPress={() => toggleChildAge(age)}
                >
                  <Text style={[styles.sheetOptionText, selected && styles.sheetOptionTextSelected]}>
                    {age}
                  </Text>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.sheetConfirmBtn} onPress={confirmSheet}>
              <Text style={styles.sheetConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sheet de mascotas */}
      <Modal visible={activeSheet === 'pet'} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={confirmSheet}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Tipo de mascotas</Text>
            <Text style={styles.sheetSubtitle}>Puedes elegir varias</Text>
            <FlatList
              data={PET_OPTIONS}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const selected = composition.pets?.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.sheetOption, selected && styles.sheetOptionSelected]}
                    onPress={() => togglePet(item)}
                  >
                    <Text style={[styles.sheetOptionText, selected && styles.sheetOptionTextSelected]}>
                      {item}
                    </Text>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.sheetConfirmBtn} onPress={confirmSheet}>
              <Text style={styles.sheetConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    gap: 12,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 28, color: '#1c1c1e', lineHeight: 32, marginTop: -2 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ede4fd',
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#c6a7f8' },
  title: { fontSize: 32, fontWeight: '600', color: '#1c1c1e', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 32 },
  selectors: { gap: 12, marginBottom: 40 },
  selectorRow: {
    minHeight: 60,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorContent: { flex: 1 },
  sectorCategory: { fontSize: 12, color: '#8c8c8c', fontWeight: '500', marginBottom: 2 },
  selectorPlaceholder: { fontSize: 15, color: '#c0c0c0' },
  selectorValue: { fontSize: 15, color: '#1c1c1e', fontWeight: '500' },
  chevron: { fontSize: 22, color: '#c6a7f8', marginLeft: 8 },
  btnWrap: { marginTop: 'auto' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ede4fd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#1c1c1e', marginBottom: 6 },
  sheetSubtitle: { fontSize: 13, color: '#8c8c8c', marginBottom: 16 },
  sheetOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetOptionSelected: { backgroundColor: '#ede4fd' },
  sheetOptionText: { fontSize: 16, color: '#262626' },
  sheetOptionTextSelected: { color: '#7c4dbc', fontWeight: '600' },
  checkmark: { fontSize: 16, color: '#c6a7f8' },
  sheetConfirmBtn: {
    marginTop: 12,
    backgroundColor: '#c6a7f8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetConfirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(28,28,30,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
