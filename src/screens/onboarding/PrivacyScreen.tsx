import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function PrivacyScreen({ onNext, onBack }: Props) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.illustration}>🔒</Text>

          <Text style={styles.title}>Tu privacidad{'\n'}nos importa</Text>
          <Text style={styles.subtitle}>
            Antes de continuar, queremos que sepas cómo usamos tu información.
          </Text>

          <View style={styles.card}>
            <View style={styles.item}>
              <Text style={styles.itemIcon}>👨‍👩‍👧‍👦</Text>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Perfil familiar</Text>
                <Text style={styles.itemDesc}>
                  Tu información se usa para encontrar familias afines. Solo compartimos lo que tú decidas mostrar.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
              <Text style={styles.itemIcon}>📍</Text>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Ubicación</Text>
                <Text style={styles.itemDesc}>
                  Usamos tu ubicación solo para sugerirte familias cercanas. Nunca la compartimos con terceros.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
              <Text style={styles.itemIcon}>🛡️</Text>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Seguridad</Text>
                <Text style={styles.itemDesc}>
                  Verificamos los perfiles para garantizar un espacio seguro para todas las familias LGBTI+.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
              <Text style={styles.itemIcon}>🚫</Text>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>Sin venta de datos</Text>
                <Text style={styles.itemDesc}>
                  Jamás vendemos ni cedemos tus datos personales a empresas externas.
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.legal}>
            Al continuar, aceptas nuestra{' '}
            <Text style={styles.link}>Política de Privacidad</Text>
            {' '}y los{' '}
            <Text style={styles.link}>Términos de Uso</Text>.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Entendido, continuar" onPress={onNext} />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    marginBottom: 8,
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  illustration: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 16,
    gap: 14,
  },
  itemIcon: { fontSize: 24, lineHeight: 32 },
  itemText: { flex: 1 },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0ecfa',
  },
  legal: {
    fontSize: 13,
    color: '#8c8c8c',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  link: {
    color: '#c6a7f8',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
});
