import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '../api/client';
import { navigateFromPushData } from '../navigation/NavigationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const registerToken = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    const platform = Platform.OS;
    try {
      await api.notifications.registerToken({ token: tokenData.data, platform });
    } catch (e) {
      console.warn('Failed to register push token:', e);
    }
  };

  useEffect(() => {
    // Tap on notification while app is open or in background
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, string>;
      navigateFromPushData(data);
    });

    // Tap on notification that launched the app from killed state
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (!response) return;
      const data = response.notification.request.content.data as Record<string, string>;
      navigateFromPushData(data);
    });

    return () => sub.remove();
  }, []);

  return { registerToken };
}
