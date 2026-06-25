import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { api } from '../api/client';
import type { User } from '../config/types';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  profileComplete: boolean;

  initialize: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: (idToken: string, nonce: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: import('../config/types').UpdateProfilePayload) => Promise<void>;
}

async function ensureFirestoreProfile(user: FirebaseUser) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      id: user.uid,
      email: user.email ?? '',
      username: '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? null,
      bio: '',
      interests: [],
      location: null,
      subscription_type: 'free',
      subscription_end_date: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  profileComplete: false,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ firebaseUser: user });
        await get().refreshProfile();
      } else {
        set({ firebaseUser: null, profile: null });
      }
      set({ isInitialized: true });
    });
    return unsubscribe;
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, username) => {
    set({ isLoading: true });
    try {
      await api.auth.createUser({ email, password, username });
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async (idToken: string) => {
    set({ isLoading: true });
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      await ensureFirestoreProfile(result.user);
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async (idToken: string, nonce: string, displayName?: string) => {
    set({ isLoading: true });
    try {
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken, rawNonce: nonce });
      const result = await signInWithCredential(auth, credential);
      if (displayName && !result.user.displayName) {
        await ensureFirestoreProfile({ ...result.user, displayName } as FirebaseUser);
      } else {
        await ensureFirestoreProfile(result.user);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await signOut(auth);
    set({ firebaseUser: null, profile: null });
  },

  refreshProfile: async () => {
    const { firebaseUser } = get();
    if (!firebaseUser) return;
    const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (snap.exists()) {
      const profile = snap.data() as User;
      const profileComplete =
        Boolean(profile.username) && Array.isArray(profile.interests) && profile.interests.length > 0;
      set({ profile, profileComplete });
    }
  },

  updateProfile: async (payload) => {
    await api.auth.updateProfile(payload);
    await get().refreshProfile();
  },
}));
