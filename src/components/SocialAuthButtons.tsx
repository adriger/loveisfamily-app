import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth — usa el client ID web de Firebase (no el nativo)
// Configura estos valores en tu Firebase Console > Authentication > Sign-in method > Google
const GOOGLE_CLIENT_ID = '747947455235-uhaur4osmpgs7tpg9dp1lgp16cj8peks.apps.googleusercontent.com';

interface Props {
  onSuccess?: () => void;
}

export default function SocialAuthButtons({ onSuccess }: Props) {
  const { signInWithGoogle, signInWithApple, isLoading } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  // ── Google ──────────────────────────────────────────────────────────────────
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'loveisfamily' }),
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' },
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        signInWithGoogle(id_token)
          .then(() => onSuccess?.())
          .catch(err => Alert.alert('Error con Google', err.message));
        setLoadingProvider(null);
      }
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      setLoadingProvider(null);
    }
  }, [response]);

  const handleGoogle = async () => {
    setLoadingProvider('google');
    await promptAsync();
  };

  // ── Apple ───────────────────────────────────────────────────────────────────
  const handleApple = async () => {
    setLoadingProvider('apple');
    try {
      // rawNonce → Apple recibe el hash SHA256, Firebase recibe el raw
      const rawNonce = Math.random().toString(36).substring(2);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      const displayName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ].filter(Boolean).join(' ') || undefined;

      await signInWithApple(credential.identityToken!, rawNonce, displayName);
      onSuccess?.();
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error con Apple', (err as Error).message);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.separator}>
        <View style={styles.line} />
        <Text style={styles.separatorText}>o continúa con</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={styles.socialBtn}
        onPress={handleGoogle}
        disabled={isLoading || loadingProvider !== null || !request}
        activeOpacity={0.8}
      >
        {loadingProvider === 'google' ? (
          <ActivityIndicator size="small" color="#1c1c1e" />
        ) : (
          <Text style={styles.googleLogo}>G</Text>
        )}
        <Text style={styles.socialBtnText}>Continuar con Google</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={14}
          style={styles.appleBtn}
          onPress={handleApple}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: '#e5e5e5' },
  separatorText: { fontSize: 13, color: '#8c8c8c', fontWeight: '500' },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleLogo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  socialBtnText: { fontSize: 15, fontWeight: '600', color: '#1c1c1e' },
  appleBtn: { width: '100%', height: 52 },
});
