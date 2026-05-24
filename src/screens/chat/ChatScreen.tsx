import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { ChatStackParams } from '../../navigation';
import type { Message } from '../../config/types';

type RouteProps = RouteProp<ChatStackParams, 'Chat'>;

export default function ChatScreen() {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { firebaseUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    api.messaging.getMessages({ conversationId: params.conversationId, limit: 50 })
      .then(result => setMessages(result.messages.reverse()))
      .finally(() => setLoading(false));

    api.messaging.markAsRead({ conversationId: params.conversationId }).catch(() => {});
  }, [params.conversationId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    try {
      await api.messaging.sendMessage({ conversationId: params.conversationId, text: msgText });
      const optimistic: Message = {
        id: Date.now().toString(),
        sender_id: firebaseUser?.uid || '',
        text: msgText,
        timestamp: new Date().toISOString(),
        is_read: false, is_edited: false, is_deleted: false, attachments: [],
      };
      setMessages(prev => [...prev, optimistic]);
      listRef.current?.scrollToEnd({ animated: true });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c6a7f8" />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>&#x2190;</Text>
          </TouchableOpacity>
          <Text style={styles.toolbarName} numberOfLines={1}>{params.participantName}</Text>
          <TouchableOpacity style={styles.menuBtn}>
            <Text style={styles.menuIcon}>&#x22EF;</Text>
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
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                      {item.text}
                    </Text>
                  </View>
                  <Text style={styles.bubbleTime}>
                    {new Date(item.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
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
              <Text style={styles.sendIcon}>&#x27A4;</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: '#1c1c1e' },
  toolbarName: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1c1c1e' },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f6fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: { fontSize: 20, color: '#1c1c1e' },
  safeBanner: {
    backgroundColor: '#e7e9f9',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
  },
  safeBannerText: { fontSize: 13, color: '#1c1c1e', lineHeight: 18 },
  list: { paddingVertical: 12, paddingHorizontal: 16 },
  bubbleWrap: { marginBottom: 12 },
  bubbleWrapMe: { alignItems: 'flex-end' },
  bubbleWrapThem: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: { backgroundColor: '#c6a7f8', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#e5d7fc', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMe: { color: '#ffffff' },
  bubbleTextThem: { color: '#1c1c1e' },
  bubbleTime: { fontSize: 11, color: '#8c8c8c', marginTop: 3 },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    color: '#1c1c1e',
    backgroundColor: '#ffffff',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c6a7f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendIcon: { color: '#ffffff', fontSize: 18 },
});
