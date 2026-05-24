import React, { useState } from 'react';
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
  onNext: (username: string) => void;
  onBack: () => void;
}

export default function UsernameScreen({ onNext, onBack }: Props) {
  const [username, setUsername] = useState('');

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
                <View style={[styles.progressFill, { width: '30%' }]} />
              </View>
            </View>

            <Text style={styles.title}>Tu nombre</Text>
            <Text style={styles.subtitle}>Se mostrará en la comunidad.</Text>

            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Ej: FamiliaMartínez"
              placeholderTextColor="#8c8c8c"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.btnWrap}>
              <Button
                title="Continuar"
                onPress={() => onNext(username.trim())}
                disabled={username.trim().length === 0}
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1e1e',
    marginBottom: 8,
    fontFamily: 'IBMPlexSans',
  },
  input: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1c1c1e',
    marginBottom: 40,
  },
  btnWrap: {
    marginTop: 8,
  },
});
