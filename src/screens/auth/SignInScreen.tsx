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
import SocialAuthButtons from '../../components/SocialAuthButtons';
import { theme } from '../../config/theme';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'SignIn'> };

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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <Text style={styles.logo}>LIF&#x2665;</Text>

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

            <SocialAuthButtons />

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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xl,
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
