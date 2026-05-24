import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, connectAuthEmulator, getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyB17PvOZjdbGGXrooCsIVvT-UZ4wkiq6sw',
  authDomain: 'loveisfamily-dev.firebaseapp.com',
  projectId: 'loveisfamily-dev',
  storageBucket: 'loveisfamily-dev.firebasestorage.app',
  messagingSenderId: '747947455235',
  appId: '1:747947455235:web:3686a55c07d6e540966f36',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
} catch {
  auth = getAuth(app);
}

export { auth };

export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

if (__DEV__) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (e) {
    console.warn('Auth emulator connect failed:', e);
  }
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (e) {
    console.warn('Firestore emulator connect failed:', e);
  }
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (e) {
    console.warn('Functions emulator connect failed:', e);
  }
}
