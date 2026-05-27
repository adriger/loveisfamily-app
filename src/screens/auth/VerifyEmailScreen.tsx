import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { api } from '../../api/client';
import { auth } from '../../config/firebase';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function VerifyEmailScreen({ onNext, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Esperar a que Firebase Auth tenga el usuario listo antes de llamar
    if (auth.currentUser) {
      sendCode();
    } else {
      // Si aún no está listo, escuchar el cambio de estado
      const unsub = auth.onAuthStateChanged((user) => {
        if (user) {
          unsub();
          sendCode();
        }
      });
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendCode = async () => {
    try {
      setResending(true);
      // Esperar hasta que haya usuario y forzar refresh del token
      let attempts = 0;
      while (!auth.currentUser && attempts < 10) {
        await new Promise(r => setTimeout(r, 300));
        attempts++;
      }
      if (!auth.currentUser) throw new Error('No hay sesión activa');
      await auth.currentUser.getIdToken(true); // true = forzar refresh
      const result = await api.auth.sendVerificationCode({});
      setCountdown(60);
      // In emulator the code is returned directly — auto-fill for dev convenience
      if (result.code) {
        const devDigits = result.code.split('');
        setDigits(devDigits);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo enviar el código');
    } finally {
      setResending(false);
    }
  };

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

  const handleVerify = async () => {
    const code = digits.join('');
    setLoading(true);
    try {
      await api.auth.verifyEmailCode({ code });
      onNext();
    } catch (err: any) {
      Alert.alert('Código incorrecto', err?.message || 'El código no es válido o ha expirado');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const allFilled = digits.every(d => d !== '');

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
            <Text style={styles.body}>
              Hemos enviado un código de 6 dígitos a tu correo. Introdúcelo a continuación.
            </Text>

            <View style={styles.otpRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={el => { inputs.current[i] = el; }}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  value={digit}
                  onChangeText={t => handleChange(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectionColor="#c6a7f8"
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={sendCode}
              disabled={resending || countdown > 0}
              style={styles.resendRow}
            >
              <Text style={styles.resendHint}>¿No has recibido el código? </Text>
              <Text style={[styles.resend, (resending || countdown > 0) && styles.resendDisabled]}>
                {countdown > 0 ? `Reenviar (${countdown}s)` : 'Reenviar'}
              </Text>
            </TouchableOpacity>

            <View style={styles.btnWrap}>
              <Button
                title="Continuar"
                onPress={handleVerify}
                disabled={!allFilled}
                loading={loading}
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
  backArrow: { fontSize: 28, color: '#1c1c1e', lineHeight: 32, marginTop: -2 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ede4fd',
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#c6a7f8' },
  title: { fontSize: 32, fontWeight: '600', color: '#1c1c1e', marginBottom: 10 },
  body: { fontSize: 15, color: '#262626', lineHeight: 22, marginBottom: 36 },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 44,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    fontSize: 22,
    fontWeight: '600',
    color: '#1c1c1e',
    borderWidth: 1.5,
    borderColor: '#ede4fd',
  },
  otpBoxFilled: {
    borderColor: '#c6a7f8',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  resendHint: { fontSize: 14, color: '#8c8c8c' },
  resend: { fontSize: 14, color: '#c6a7f8', fontWeight: '600' },
  resendDisabled: { color: '#c4b5f0' },
  btnWrap: { marginTop: 8 },
});
