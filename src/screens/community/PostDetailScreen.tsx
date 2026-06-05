import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import type { Post, Comment } from '../../config/types';

interface Props {
  post: Post;
  onBack: () => void;
}

const ACTIVITY_ICONS: Record<string, string> = {
  sports: '⚽',
  art: '🎨',
  music: '🎵',
  food: '🍽️',
  travel: '✈️',
  nature: '🌿',
  education: '📚',
  other: '💬',
};

export default function PostDetailScreen({ post, onBack }: Props) {
  const { firebaseUser } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      // No hay endpoint de getComments en el API actual — mostramos placeholder
      setComments([]);
    } catch {
      // silencio
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      await api.community.likePost({ postId: post.id });
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleComment = async () => {
    const text = commentText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await api.community.comment({ postId: post.id, text });
      const newComment: Comment = {
        id: Date.now().toString(),
        author_id: firebaseUser?.uid ?? '',
        text,
        timestamp: new Date().toISOString(),
        likes_count: 0,
      };
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const icon = ACTIVITY_ICONS[post.activity_type] ?? '💬';
  const dateStr = new Date(post.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentRow}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>
          {item.author_id.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentBubble}>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTime}>
          {new Date(item.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </Text>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                {/* Toolbar */}
                <View style={styles.toolbar}>
                  <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <Text style={styles.backArrow}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.toolbarTitle}>Publicación</Text>
                  <View style={{ width: 40 }} />
                </View>

                {/* Contenido del post */}
                <View style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAvatar}>
                      <Text style={styles.postAvatarIcon}>{icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postAuthor}>{post.author_id.slice(0, 8)}...</Text>
                      <Text style={styles.postDate}>{dateStr}</Text>
                    </View>
                    {post.location?.city && (
                      <Text style={styles.postLocation}>📍 {post.location.city}</Text>
                    )}
                  </View>

                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postDesc}>{post.description}</Text>

                  {post.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {post.tags.map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.postActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                      <Text style={styles.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
                      <Text style={styles.actionCount}>{likesCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => inputRef.current?.focus()}>
                      <Text style={styles.actionIcon}>💬</Text>
                      <Text style={styles.actionCount}>{comments.length + post.comments_count}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Header comentarios */}
                <Text style={styles.commentsHeader}>Comentarios</Text>
                {loadingComments && <ActivityIndicator color="#c6a7f8" style={{ marginVertical: 20 }} />}
                {!loadingComments && comments.length === 0 && (
                  <Text style={styles.emptyComments}>Sé el primero en comentar 👋</Text>
                )}
              </>
            }
          />

          {/* Input de comentario */}
          <View style={styles.inputBar}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Escribe un comentario..."
              placeholderTextColor="#8c8c8c"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
              onPress={handleComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendIcon}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f9f6fe', alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 26, color: '#1c1c1e', lineHeight: 30, marginTop: -2 },
  toolbarTitle: { fontSize: 17, fontWeight: '600', color: '#1c1c1e' },
  listContent: { paddingBottom: 16 },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  postAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ede4fd', alignItems: 'center', justifyContent: 'center',
  },
  postAvatarIcon: { fontSize: 22 },
  postAuthor: { fontSize: 14, fontWeight: '600', color: '#1c1c1e', marginBottom: 2 },
  postDate: { fontSize: 12, color: '#8c8c8c' },
  postLocation: { fontSize: 12, color: '#8c8c8c' },
  postTitle: { fontSize: 18, fontWeight: '700', color: '#1c1c1e', marginBottom: 8 },
  postDesc: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 14 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16 },
  tag: { backgroundColor: '#ede4fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, color: '#c6a7f8', fontWeight: '500' },
  postActions: { flexDirection: 'row', gap: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#f0ecfa' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 20 },
  actionCount: { fontSize: 14, color: '#555', fontWeight: '500' },
  commentsHeader: { fontSize: 17, fontWeight: '700', color: '#1c1c1e', marginHorizontal: 20, marginBottom: 12 },
  emptyComments: { textAlign: 'center', color: '#8c8c8c', fontSize: 14, paddingVertical: 20 },
  commentRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 10 },
  commentAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#ede4fd', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  commentAvatarText: { fontSize: 12, fontWeight: '600', color: '#7c4dbc' },
  commentBubble: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    padding: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  commentText: { fontSize: 14, color: '#1c1c1e', lineHeight: 20, marginBottom: 4 },
  commentTime: { fontSize: 11, color: '#8c8c8c' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0ecfa',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1c1c1e',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#c6a7f8', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#e0d4f9' },
  sendIcon: { fontSize: 16, color: '#fff' },
});
