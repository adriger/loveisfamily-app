import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommunityStackParams } from '../../navigation';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, TextInput, Modal, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import GradientBackground from '../../components/GradientBackground';
import { api } from '../../api/client';
import type { Post, ActivityType } from '../../config/types';

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  sports: 'Deporte',
  social: 'Social',
  hobby: 'Hobby',
};

const FEED_TABS = ['Para ti', 'Siguiendo', 'Grupos'] as const;
type FeedTab = typeof FEED_TABS[number];

export default function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParams>>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('Para ti');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<ActivityType>('sports');
  const [newImageUri, setNewImageUri] = useState<string | undefined>(undefined);
  const [publishing, setPublishing] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      const result = await api.community.getFeed({ limit: 20 });
      setPosts(result.posts);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handleLike = async (postId: string) => {
    try {
      await api.community.likePost({ postId });
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
      ));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Necesitamos acceso a tus fotos para adjuntar imágenes');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      Alert.alert('Error', 'Titulo y descripcion son obligatorios');
      return;
    }
    if (publishing) return;
    setPublishing(true);
    try {
      await api.community.createPost({
        title: newTitle.trim(),
        description: newDesc.trim(),
        activityType: newType,
        visibility: 'public',
        ...(newImageUri ? { images: [newImageUri] } : {}),
      });
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      setNewImageUri(undefined);
      loadFeed();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setPublishing(false);
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
          <Text style={styles.toolbarTitle}>Comunidad</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.segmentedControl}>
          {FEED_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentTab, activeTab === tab && styles.segmentTabActive]}
              onPress={() => {
                if (tab === 'Grupos') { navigation.navigate('Groups'); return; }
                setActiveTab(tab);
              }}
            >
              <Text style={[styles.segmentTabText, activeTab === tab && styles.segmentTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={posts}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFeed(); }} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{item.title.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.cardAuthor}>{ACTIVITY_LABELS[item.activity_type]}</Text>
                  <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString('es-ES')}</Text>
                </View>
              </View>

              <View style={styles.cardImagePlaceholder} />

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
                {item.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {item.tags.slice(0, 4).map(tag => (
                      <Text key={tag} style={styles.tag}>#{tag}</Text>
                    ))}
                  </View>
                )}
                <View style={styles.cardFooter}>
                  <TouchableOpacity onPress={() => handleLike(item.id)}>
                    <Text style={styles.footerAction}>&#x2665; {item.likes_count}</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerAction}>&#x1F4AC; {item.comments_count}</Text>
                </View>
              </View>
            </View>
          )}
        />
      </SafeAreaView>

      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Nueva publicacion</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Titulo"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.modalInput, styles.modalTextArea]}
            placeholder="Descripcion"
            value={newDesc}
            onChangeText={setNewDesc}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.modalLabel}>Tipo de actividad</Text>
          <View style={styles.typeRow}>
            {(Object.entries(ACTIVITY_LABELS) as [ActivityType, string][]).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeBtn, newType === key && styles.typeBtnActive]}
                onPress={() => setNewType(key)}
              >
                <Text style={[styles.typeBtnText, newType === key && styles.typeBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.modalLabel}>Imagen (opcional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {newImageUri ? (
              <Image source={{ uri: newImageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Text style={styles.imagePickerIcon}>📷</Text>
                <Text style={styles.imagePickerText}>Añadir imagen</Text>
              </View>
            )}
          </TouchableOpacity>
          {newImageUri && (
            <TouchableOpacity onPress={() => setNewImageUri(undefined)} style={styles.removeImageBtn}>
              <Text style={styles.removeImageText}>Eliminar imagen</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.submitBtn, publishing && styles.submitBtnDisabled]}
            onPress={handleCreatePost}
            disabled={publishing}
          >
            {publishing ? (
              <ActivityIndicator color="#1c1c1e" />
            ) : (
              <Text style={styles.submitBtnText}>Publicar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { if (!publishing) setShowCreate(false); }}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toolbarTitle: { fontSize: 28, fontWeight: '700', color: '#1c1c1e' },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#c6a7f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: { fontSize: 26, color: '#ffffff', lineHeight: 30 },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 3,
    height: 32,
  },
  segmentTab: {
    flex: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentTabActive: { backgroundColor: '#ffffff' },
  segmentTabText: { fontSize: 13, color: '#8c8c8c', fontWeight: '500' },
  segmentTabTextActive: { color: '#1c1c1e', fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5d7fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarText: { fontSize: 14, fontWeight: '600', color: '#1c1c1e' },
  cardHeaderInfo: { flex: 1 },
  cardAuthor: { fontSize: 13, fontWeight: '600', color: '#1c1c1e' },
  cardDate: { fontSize: 11, color: '#8c8c8c' },
  cardImagePlaceholder: {
    height: 192,
    backgroundColor: '#e5d7fc',
  },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1c1c1e', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#262626', lineHeight: 18, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  tag: {
    fontSize: 12,
    color: '#8c8c8c',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  footerAction: { fontSize: 14, color: '#8c8c8c' },
  modal: { flex: 1, padding: 24, backgroundColor: '#ffffff' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginTop: 20, marginBottom: 24, color: '#1c1c1e' },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    color: '#1c1c1e',
  },
  modalTextArea: { height: 100, textAlignVertical: 'top' },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#8c8c8c' },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  typeBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  typeBtnActive: { borderColor: '#c6a7f8', backgroundColor: '#ede4fd' },
  typeBtnText: { fontSize: 13, color: '#8c8c8c' },
  typeBtnTextActive: { color: '#c6a7f8', fontWeight: '600' },
  submitBtn: { backgroundColor: '#c6a7f8', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, minHeight: 52 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#1c1c1e', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 16, alignItems: 'center' },
  cancelBtnText: { color: '#8c8c8c', fontSize: 15 },
  imagePicker: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imagePickerPlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imagePickerIcon: { fontSize: 28 },
  imagePickerText: { fontSize: 14, color: '#8c8c8c' },
  imagePreview: { width: '100%', height: 180 },
  removeImageBtn: { alignSelf: 'flex-end', marginBottom: 16 },
  removeImageText: { fontSize: 13, color: '#ff3b30' },
});
