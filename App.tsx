import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import Navigation from './src/navigation';

// Initialize Firebase
import './src/config/firebase';

function AppContent() {
  const initialize = useAuthStore(state => state.initialize);
  const firebaseUser = useAuthStore(state => state.firebaseUser);
  const { registerToken } = usePushNotifications();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      registerToken();
    }
  }, [firebaseUser]);

  return <Navigation />;
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
