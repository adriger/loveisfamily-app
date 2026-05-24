import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Props {
  onNext: (birthdate: string) => void;
  onBack: () => void;
}

function isValidDate(dd: string, mm: string, yyyy: string): boolean {
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return false;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear() - 1) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export default function BirthdateScreen({ onNext, onBack }: Props) {
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const mmRef = useRef<TextInput>(null);
  const yyyyRef = useRef<TextInput>(null);

  const valid = isValidDate(dd, mm, yyyy);

  const handleDd = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setDd(cleaned);
    if (cleaned.length === 2) mmRef.current?.focus();
  };

  const handleMm = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMm(cleaned);
    if (cleaned.length === 2) yyyyRef.current?.focus();
  };

  const handleYyyy = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setYyyy(cleaned);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                <Text style={styles.backArrow}>‹</Text>
              </TouchableOpacity>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '45%' }]} />
              </View>
            </View>

            <Text style={styles.title}>Tu cumpleaños</Text>
            <Text style={styles.subtitle}>Para mostrarte planes y actividades relevantes.</Text>

            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>DD</Text>
                <TextInput
                  style={styles.dateInput}
                  value={dd}
                  onChangeText={handleDd}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="01"
                  placeholderTextColor="#8c8c8c"
                  textAlign="center"
                />
              </View>
              <Text style={styles.dateSep}>/</Text>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>MM</Text>
                <TextInput
                  ref={mmRef}
                  style={styles.dateInput}
                  value={mm}
                  onChangeText={handleMm}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="01"
                  placeholderTextColor="#8c8c8c"
                  textAlign="center"
                />
              </View>
              <Text style={styles.dateSep}>/</Text>
              <View style={[styles.dateField, styles.yearField]}>
                <Text style={styles.dateLabel}>AAAA</Text>
                <TextInput
                  ref={yyyyRef}
                  style={styles.dateInput}
                  value={yyyy}
                  onChangeText={handleYyyy}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="1990"
                  placeholderTextColor="#8c8c8c"
                  textAlign="center"
                />
              </View>
            </View>

            <View style={styles.btnWrap}>
              <Button
                title="Continuar"
                onPress={() => onNext(`${yyyy}-${mm}-${dd}`)}
                disabled={!valid}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
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
    marginBottom: 36,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 40,
  },
  dateField: {
    flex: 1,
    alignItems: 'center',
  },
  yearField: {
    flex: 1.8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#8c8c8c',
    marginBottom: 6,
    fontWeight: '500',
  },
  dateInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  dateSep: {
    fontSize: 22,
    color: '#8c8c8c',
    paddingBottom: 12,
  },
  btnWrap: {
    marginTop: 8,
  },
});
