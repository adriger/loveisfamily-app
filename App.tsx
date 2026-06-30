import 'react-native-gesture-handler';
import { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from './src/store/authStore';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { useMatchNotification, type MatchNotif } from './src/hooks/useMatchNotification';
import { navigateToMatches } from './src/navigation/NavigationService';
import Navigation from './src/navigation';
import LoadingOverlay from './src/components/LoadingOverlay';
import MatchBanner from './src/components/MatchBanner';
import { db } from './src/config/firebase';

// Initialize Firebase
import './src/config/firebase';

interface BannerState {
  type: 'new_request' | 'mutual_match';
  name: string;
}

function AppContent() {
  const initialize = useAuthStore(state => state.initialize);
  const firebaseUser = useAuthStore(state => state.firebaseUser);
  const { registerToken } = usePushNotifications();
  const [banner, setBanner] = useState<BannerState | null>(null);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      registerToken();
    }
  }, [firebaseUser]);

  const handleMatchNotif = useCallback(async (notif: MatchNotif) => {
    let name = 'Una familia';
    try {
      const userDoc = await getDoc(doc(db, 'users', notif.otherUserId));
      if (userDoc.exists()) name = userDoc.data().displayName || 'Una familia';
    } catch {}
    setBanner({ type: notif.type, name });
  }, []);

  useMatchNotification(firebaseUser?.uid ?? null, handleMatchNotif);

  return (
    <>
      <Navigation />
      <LoadingOverlay />
      {banner && (
        <MatchBanner
          type={banner.type}
          name={banner.name}
          onView={navigateToMatches}
          onDismiss={() => setBanner(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
