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
  onNext: () => void;
  onBack: () => void;
}

export default function VerifyEmailScreen({ onNext, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const allFilled = digits.every((d) => d !== '');

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
                <View style={[styles.progressFill, { width: '15%' }]} />
              </View>
            </View>

            <Text style={styles.title}>Validar correo electrónico</Text>
            <Text style={styles.body}>Revisa tu bandeja de correo</Text>

            <View style={styles.otpRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  style={styles.otpBox}
                  value={digit}
                  onChangeText={(t) => handleChange(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectionColor="#c6a7f8"
                />
              ))}
            </View>

            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.resend}>Reenviar</Text>
            </TouchableOpacity>

            <View style={styles.btnWrap}>
              <Button title="Continuar" onPress={onNext} disabled={!allFilled} />
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
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    color: '#262626',
    marginBottom: 36,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 42,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    borderWidth: 1.5,
    borderColor: '#ede4fd',
  },
  resend: {
    fontSize: 15,
    color: '#c6a7f8',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
  },
  btnWrap: {
    marginTop: 8,
  },
});
