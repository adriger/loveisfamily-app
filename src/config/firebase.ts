import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyB17PvOZjdbGGXrooCsIVvT-UZ4wkiq6sw',
  authDomain: 'loveisfamily-dev.firebaseapp.com',
  projectId: 'loveisfamily-dev',
  storageBucket: 'loveisfamily-dev.firebasestorage.app',
  messagingSenderId: '747947455235',
  appId: '1:747947455235:web:3686a55c07d6e540966f36',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// inMemoryPersistence — la sesión sobrevive al ciclo de vida via onAuthStateChanged + AsyncStorage
let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
} catch {
  auth = getAuth(app);
}

// TODO: App Check — añadir @react-native-firebase/app-check cuando tengamos
// el development build con la cuenta de Apple Developer activada.
// Usará DeviceCheck (iOS) y Play Integrity (Android) para máxima seguridad.

export { auth };
export const db = getFirestore(app);
export const functions = getFunctions(app, 'europe-west1'); // región europea
