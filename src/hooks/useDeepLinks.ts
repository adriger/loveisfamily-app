import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export function useDeepLinks() {
  const navigation = useNavigation<any>();

  const handleUrl = (url: string) => {
    const { path, queryParams } = Linking.parse(url);
    if (path?.startsWith('chat/')) {
      const conversationId = path.replace('chat/', '');
      navigation.navigate('ChatTab', { screen: 'Chat', params: { conversationId, participantName: 'Chat' } });
    }
    if (path?.startsWith('profile/')) {
      const userId = path.replace('profile/', '');
      navigation.navigate('Home', { screen: 'FamilyProfile', params: { userId, displayName: 'Perfil' } });
    }
  };

  useEffect(() => {
    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);
}
