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

// inMemoryPersistence used here; session survives app lifecycle via onAuthStateChanged + AsyncStorage in authStore
let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: inMemoryPersistence });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');
