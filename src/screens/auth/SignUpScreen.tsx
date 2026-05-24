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

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'SignUp'> };

const PROGRESS = 0.25;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, isLoading } = useAuthStore();

  const allFilled =
    email.trim().length > 0 && password.length > 0 && confirmPassword.length > 0;

  const handleSignUp = async () => {
    if (!allFilled) return;
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      // username is derived from email prefix until the profile-setup step collects it.
      const username = email.split('@')[0];
      await signUp(email.trim(), password, username);
    } catch (err: any) {
      const msg = err?.details?.message || err.message || 'Error al registrarse';
      Alert.alert('Error', msg);
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
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
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad de familias.</Text>

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
                  autoComplete="new-password"
                  placeholder="Mín. 8 caracteres"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <TextInput
                  style={[
                    styles.input,
                    confirmPassword.length > 0 &&
                      password !== confirmPassword &&
                      styles.inputError,
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
                )}
              </View>
            </View>

            {/* Primary action — color shifts from disabled to active as fields fill */}
            <Button
              title={isLoading ? 'Creando cuenta...' : 'Continuar'}
              onPress={handleSignUp}
              variant="primary"
              disabled={!allFilled}
              loading={isLoading}
              style={!allFilled ? styles.buttonDisabledBg : undefined}
            />

            {/* Link to SignIn */}
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.linkAccent}>Inicia sesión</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  inputError: {
    borderWidth: 1,
    borderColor: theme.colors.splashCoral,
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.splashCoral,
    marginTop: 2,
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
