import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';

// Versiones actuales de los documentos — actualiza cuando publiques nuevas versiones
export const PRIVACY_POLICY_VERSION = '1.0.0';
export const TERMS_VERSION = '1.0.0';

// URLs de los documentos — actualiza cuando los tengas publicados
const PRIVACY_URL = 'https://loveisfamily.es/privacidad';
const TERMS_URL = 'https://loveisfamily.es/terminos';

interface Props {
  onNext: (consent: { privacyVersion: string; termsVersion: string }) => void;
  onBack: () => void;
}

export default function PrivacyScreen({ onNext, onBack }: Props) {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [docModal, setDocModal] = useState<'privacy' | 'terms' | null>(null);

  const canContinue = privacyAccepted && termsAccepted;

  const openDoc = (type: 'privacy' | 'terms') => {
    const url = type === 'privacy' ? PRIVACY_URL : TERMS_URL;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        setDocModal(type);
      }
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onNext({
      privacyVersion: PRIVACY_POLICY_VERSION,
      termsVersion: TERMS_VERSION,
    });
  };

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
            <Item icon="👨‍👩‍👧‍👦" title="Perfil familiar" desc="Tu información se usa para encontrar familias afines. Solo compartimos lo que tú decidas mostrar." />
            <View style={styles.divider} />
            <Item icon="📍" title="Ubicación" desc="Usamos tu ubicación solo para sugerirte familias cercanas. Nunca la compartimos con terceros ni se muestra tu dirección exacta." />
            <View style={styles.divider} />
            <Item icon="🛡️" title="Seguridad" desc="Verificamos los perfiles para garantizar un espacio seguro para todas las familias LGBTI+." />
            <View style={styles.divider} />
            <Item icon="🚫" title="Sin venta de datos" desc="Jamás vendemos ni cedemos tus datos personales a empresas externas." />
          </View>

          {/* Checkbox Política de Privacidad */}
          <View style={styles.consentBlock}>
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setPrivacyAccepted(v => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
                {privacyAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                He leído y acepto la{' '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openDoc('privacy')} style={styles.viewLink}>
              <Text style={styles.viewLinkText}>Política de Privacidad →</Text>
            </TouchableOpacity>
          </View>

          {/* Checkbox Términos de Uso */}
          <View style={styles.consentBlock}>
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setTermsAccepted(v => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                He leído y acepto los{' '}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openDoc('terms')} style={styles.viewLink}>
              <Text style={styles.viewLinkText}>Términos y Condiciones de Uso →</Text>
            </TouchableOpacity>
          </View>

          {!canContinue && (
            <Text style={styles.hint}>
              Debes aceptar ambos documentos para continuar.
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continuar"
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </View>

        {/* Fallback modal si no hay URL configurada */}
        <Modal visible={docModal !== null} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {docModal === 'privacy' ? 'Política de Privacidad' : 'Términos y Condiciones'}
              </Text>
              <TouchableOpacity onPress={() => setDocModal(null)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 24 }}>
              <Text style={styles.modalBody}>
                {docModal === 'privacy'
                  ? `POLÍTICA DE PRIVACIDAD\nVersión ${PRIVACY_POLICY_VERSION}\n\nEste documento describe cómo LoveIsFamily trata tus datos personales conforme al Reglamento General de Protección de Datos (RGPD).\n\nResponsable del tratamiento: LoveIsFamily S.L.\n\nDatos recogidos: email, perfil familiar, ubicación aproximada, intereses e imagen de perfil.\n\nFinalidad: conectar familias diversas LGBTI+. Tus datos nunca serán cedidos a terceros.\n\nDerechos: puedes ejercer tus derechos de acceso, rectificación, supresión y portabilidad escribiendo a privacidad@loveisfamily.es.`
                  : `TÉRMINOS Y CONDICIONES DE USO\nVersión ${TERMS_VERSION}\n\nAl usar LoveIsFamily aceptas estas condiciones.\n\nUso permitido: la app es para uso personal de familias diversas LGBTI+. Queda prohibido el uso comercial o la suplantación de identidad.\n\nContenido: eres responsable del contenido que publicas. Nos reservamos el derecho a eliminar contenido que incumpla estas condiciones.\n\nMenores: la app está destinada a mayores de 18 años.\n\nModificaciones: podemos actualizar estos términos notificándote con antelación.`
                }
              </Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

function Item({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: { paddingHorizontal: 24, paddingTop: 8, marginBottom: 8 },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f9f6fe', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 28, color: '#1c1c1e', lineHeight: 32, marginTop: -2 },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  illustration: { fontSize: 64, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#1c1c1e', marginBottom: 12, lineHeight: 38 },
  subtitle: { fontSize: 16, color: '#555', lineHeight: 22, marginBottom: 28 },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 8, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  item: { flexDirection: 'row', paddingVertical: 16, gap: 14 },
  itemIcon: { fontSize: 24, lineHeight: 32 },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#1c1c1e', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#f0ecfa' },
  consentBlock: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#c6a7f8', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#c6a7f8', borderColor: '#c6a7f8' },
  checkmark: { fontSize: 13, color: '#fff', fontWeight: '700' },
  checkLabel: { fontSize: 14, color: '#1c1c1e', flex: 1 },
  viewLink: { marginTop: 10, marginLeft: 34 },
  viewLinkText: { fontSize: 13, color: '#c6a7f8', fontWeight: '600' },
  hint: { fontSize: 13, color: '#8c8c8c', textAlign: 'center', marginTop: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1c1c1e' },
  modalClose: { padding: 8 },
  modalCloseText: { fontSize: 15, color: '#c6a7f8', fontWeight: '600' },
  modalBody: { fontSize: 14, color: '#444', lineHeight: 22 },
});
