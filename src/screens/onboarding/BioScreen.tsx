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

const MAX_CHARS = 300;

interface Props {
  onNext: (bio: string) => void;
  onBack: () => void;
}

export default function BioScreen({ onNext, onBack }: Props) {
  const [bio, setBio] = useState('');

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
                <View style={[styles.progressFill, { width: '90%' }]} />
              </View>
            </View>

            <Text style={styles.title}>Biografía</Text>
            <Text style={styles.subtitle}>Cuéntanos algo sobre tu familia.</Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={bio}
                onChangeText={(t) => setBio(t.slice(0, MAX_CHARS))}
                multiline
                placeholder="Ej: Somos una familia de tres con mucha energía..."
                placeholderTextColor="#8c8c8c"
                textAlignVertical="top"
              />
              <Text style={styles.counter}>
                {bio.length}/{MAX_CHARS}
              </Text>
            </View>

            <View style={styles.btnWrap}>
              <Button title="Continuar" onPress={() => onNext(bio)} />
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
    marginBottom: 24,
  },
  inputWrap: {
    marginBottom: 40,
    position: 'relative',
  },
  input: {
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
    fontSize: 16,
    color: '#1c1c1e',
  },
  counter: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    fontSize: 12,
    color: '#8c8c8c',
  },
  btnWrap: {
    marginTop: 8,
  },
});
