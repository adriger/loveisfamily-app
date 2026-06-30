import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Image,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
  ActionSheetIOS, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, arrayUnion, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import GradientBackground from '../../components/GradientBackground';
import { db } from '../../config/firebase';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { ChatStackParams } from '../../navigation';
import type { Message } from '../../config/types';

type RouteProps = RouteProp<ChatStackParams, 'Chat'>;
type Nav = NativeStackNavigationProp<ChatStackParams>;

export default function ChatScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { firebaseUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const listRef = useRef<FlatList>(null);

  const { conversationId, participantId, participantName, participantPhotoURL } = params;

  // ── Mensajes en tiempo real ──────────────────────────────────────────────────
  useEffect(() => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, () => setLoading(false));

    api.messaging.markAsRead({ conversationId }).catch(() => {});
    return () => unsub();
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      await api.messaging.sendMessage({ conversationId, text: msgText });
    } finally {
      setSending(false);
    }
  };

  const handleMenu = () => {
    const options = [
      'Cancelar',
      isMuted ? 'Activar notificaciones' : 'Silenciar conversación',
      'Eliminar conversación',
      'Denunciar',
    ];
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: 0, destructiveButtonIndex: 2, title: participantName },
      async (idx) => {
        if (idx === 1) handleMute();
        if (idx === 2) handleDelete();
        if (idx === 3) handleReport();
      },
    );
  };

  const handleMute = async () => {
    if (!firebaseUser) return;
    try {
      const newMuted = !isMuted;
      await updateDoc(doc(db, 'conversations', conversationId), {
        muted_by: newMuted ? arrayUnion(firebaseUser.uid) : [],
      });
      setIsMuted(newMuted);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar conversación',
      'La conversación desaparecerá de tu lista. La otra persona no lo sabrá.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            if (!firebaseUser) return;
            try {
              await updateDoc(doc(db, 'conversations', conversationId), {
                hidden_for: arrayUnion(firebaseUser.uid),
              });
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Denunciar',
      '¿Qué quieres denunciar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Contenido inapropiado', onPress: () => submitReport('inappropriate_content') },
        { text: 'Acoso o spam', onPress: () => submitReport('harassment_spam') },
      ],
    );
  };

  const submitReport = async (reason: string) => {
    if (!firebaseUser) return;
    try {
      await addDoc(collection(db, 'reports'), {
        reporter_id: firebaseUser.uid,
        reported_user_id: participantId,
        conversation_id: conversationId,
        reason,
        created_at: serverTimestamp(),
        status: 'pending',
      });
      Alert.alert('Denuncia enviada', 'Revisaremos tu denuncia. Gracias por ayudarnos a mantener la comunidad segura.');
    } catch {
      Alert.alert('Error', 'No se pudo enviar la denuncia.');
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}><ActivityIndicator size="large" color="#c6a7f8" /></View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          {/* Nombre + foto tappable → perfil */}
          <TouchableOpacity
            style={styles.toolbarCenter}
            onPress={() => navigation.navigate('ChatFamilyProfile', {
              userId: participantId,
              displayName: participantName,
              photoURL: participantPhotoURL,
            })}
            activeOpacity={0.75}
          >
            {participantPhotoURL ? (
              <Image source={{ uri: participantPhotoURL }} style={styles.headerPhoto} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarText}>
                  {participantName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')}
                </Text>
              </View>
            )}
            <View style={styles.headerNameWrap}>
              <Text style={styles.toolbarName} numberOfLines={1}>{participantName}</Text>
              <Text style={styles.toolbarSub}>Ver perfil</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={handleMenu}>
            <Text style={styles.menuIcon}>•••</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.safeBanner}>
          <Text style={styles.safeBannerText}>
            Espacio seguro. Este chat te permite conocer a otras familias en un entorno seguro.
          </Text>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isMe = item.sender_id === firebaseUser?.uid;
              return (
                <View style={[styles.bubbleWrap, isMe ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
                  {!isMe && participantPhotoURL && (
                    <Image source={{ uri: participantPhotoURL }} style={styles.bubbleAvatar} />
                  )}
                  <View style={styles.bubbleBody}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                      <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                        {item.text}
                      </Text>
                    </View>
                    <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                      {new Date(item.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#8c8c8c"
              multiline
              maxLength={5000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.sendIcon}>➤</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f9f6fe', justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  backIcon: { fontSize: 26, color: '#1c1c1e', lineHeight: 30, marginTop: -2 },
  toolbarCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 4, paddingHorizontal: 4,
  },
  headerPhoto: { width: 40, height: 40, borderRadius: 20, flexShrink: 0 },
  headerAvatarFallback: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e5d7fc', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  headerAvatarText: { fontSize: 14, fontWeight: '700', color: '#7c4dbc' },
  headerNameWrap: { flex: 1 },
  toolbarName: { fontSize: 16, fontWeight: '600', color: '#1c1c1e' },
  toolbarSub: { fontSize: 11, color: '#8c8c8c' },
  menuBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f9f6fe', justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  menuIcon: { fontSize: 12, color: '#1c1c1e', fontWeight: '700', letterSpacing: 1 },
  safeBanner: {
    backgroundColor: '#e7e9f9', marginHorizontal: 16, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, marginBottom: 4,
  },
  safeBannerText: { fontSize: 12, color: '#555', lineHeight: 17 },
  list: { paddingVertical: 12, paddingHorizontal: 16, gap: 4 },
  bubbleWrap: { marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bubbleWrapMe: { justifyContent: 'flex-end' },
  bubbleWrapThem: { justifyContent: 'flex-start' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, flexShrink: 0, marginBottom: 14 },
  bubbleBody: { maxWidth: '75%' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: '#c6a7f8', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMe: { color: '#fff' },
  bubbleTextThem: { color: '#1c1c1e' },
  bubbleTime: { fontSize: 10, color: '#8c8c8c', marginTop: 3, paddingHorizontal: 2 },
  bubbleTimeMe: { textAlign: 'right' },
  inputBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', alignItems: 'flex-end', gap: 10,
    borderTopWidth: 1, borderTopColor: '#f0ecfa',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 120,
    color: '#1c1c1e', backgroundColor: '#fff',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#c6a7f8', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#e0d4f9' },
  sendIcon: { color: '#fff', fontSize: 16 },
});
