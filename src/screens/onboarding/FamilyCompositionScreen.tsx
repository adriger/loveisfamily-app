import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Composition {
  household?: string;
  children?: string;
  pets?: string;
}

interface Props {
  onNext: (composition: Composition) => void;
  onBack: () => void;
}

const HOUSEHOLD_OPTIONS = [
  'Pareja',
  'Monoparental',
  'Familias reconstituidas',
  'Otras configuraciones',
];
const CHILDREN_OPTIONS = ['Sin peques', '1 hijo', '2 hijos', '3+ hijos'];
const PETS_OPTIONS = ['Sin mascotas', 'Perro', 'Gato', 'Otros'];

type SheetKey = 'household' | 'children' | 'pets';

interface SheetConfig {
  key: SheetKey;
  title: string;
  options: string[];
}

const SHEETS: SheetConfig[] = [
  { key: 'household', title: '¿Quiénes forman tu hogar?', options: HOUSEHOLD_OPTIONS },
  { key: 'children', title: 'Peques', options: CHILDREN_OPTIONS },
  { key: 'pets', title: 'Tipo de mascotas', options: PETS_OPTIONS },
];

export default function FamilyCompositionScreen({ onNext, onBack }: Props) {
  const [composition, setComposition] = useState<Composition>({});
  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);

  const current = SHEETS.find((s) => s.key === activeSheet);

  const selectOption = (option: string) => {
    if (!activeSheet) return;
    setComposition((prev) => ({ ...prev, [activeSheet]: option }));
    setActiveSheet(null);
  };

  const labelFor = (key: SheetKey, fallback: string) => composition[key] || fallback;

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
            <TouchableOpacity style={styles.selectorRow} onPress={() => setActiveSheet('household')}>
              <View>
                <Text style={styles.selectorLabel}>¿Quiénes forman tu hogar?</Text>
                {composition.household ? (
                  <Text style={styles.selectorValue}>{composition.household}</Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.selectorRow} onPress={() => setActiveSheet('children')}>
              <View>
                <Text style={styles.selectorLabel}>Peques</Text>
                {composition.children ? (
                  <Text style={styles.selectorValue}>{composition.children}</Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.selectorRow} onPress={() => setActiveSheet('pets')}>
              <View>
                <Text style={styles.selectorLabel}>Tipo de mascotas</Text>
                {composition.pets ? (
                  <Text style={styles.selectorValue}>{composition.pets}</Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.btnWrap}>
            <Button title="Continuar" onPress={() => onNext(composition)} />
          </View>
        </View>
      </SafeAreaView>

      <Modal visible={activeSheet !== null} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setActiveSheet(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{current?.title}</Text>
            {current?.options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.sheetOption,
                  composition[activeSheet!] === opt && styles.sheetOptionSelected,
                ]}
                onPress={() => selectOption(opt)}
              >
                <Text
                  style={[
                    styles.sheetOptionText,
                    composition[activeSheet!] === opt && styles.sheetOptionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
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
  backArrow: {
    fontSize: 28,
    color: '#1c1c1e',
    lineHeight: 32,
    marginTop: -2,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ede4fd',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c6a7f8',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#262626',
    marginBottom: 32,
  },
  selectors: {
    gap: 12,
    marginBottom: 40,
  },
  selectorRow: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLabel: {
    fontSize: 15,
    color: '#8c8c8c',
    fontWeight: '400',
  },
  selectorValue: {
    fontSize: 15,
    color: '#1c1c1e',
    fontWeight: '500',
    marginTop: 1,
  },
  chevron: {
    fontSize: 22,
    color: '#8c8c8c',
  },
  btnWrap: {
    marginTop: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ede4fd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  sheetOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  sheetOptionSelected: {
    backgroundColor: '#ede4fd',
  },
  sheetOptionText: {
    fontSize: 16,
    color: '#262626',
  },
  sheetOptionTextSelected: {
    color: '#c6a7f8',
    fontWeight: '500',
  },
});
