import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation';
import { useAuthStore } from '../../store/authStore';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { theme } from '../../config/theme';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'SignIn'> };

const PROGRESS = 0.5;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuthStore();

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Error al iniciar sesión', err.message || 'Inténtalo de nuevo');
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Toolbar */}
          <View style={styles.toolbar}>
            <View style={styles.backButton} />
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${PROGRESS * 100}%` }]} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Heading */}
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>Bienvenido de nuevo. Nos alegra verte.</Text>

            {/* Inputs */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="current-password"
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* Primary action */}
            <Button
              title={isLoading ? 'Entrando...' : 'Continuar'}
              onPress={handleSignIn}
              variant="primary"
              disabled={!canSubmit}
              loading={isLoading}
              style={!canSubmit ? styles.buttonDisabledBg : undefined}
            />

            {/* Link to SignUp */}
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>
                ¿No tienes cuenta?{' '}
                <Text style={styles.linkAccent}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.buttonSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: theme.colors.textDark,
    lineHeight: 24,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.buttonPrimaryDisabled,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.buttonPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.display,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    ...theme.typography.label,
    color: theme.colors.textLabel,
  },
  input: {
    height: 54,
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.inputText,
    // Subtle card shadow so inputs feel lifted off the gradient bg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonDisabledBg: {
    backgroundColor: theme.colors.buttonPrimaryDisabled,
  },
  linkRow: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  linkAccent: {
    color: theme.colors.textDark,
    fontWeight: '600',
  },
});
