import { create } from 'zustand';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { api } from '../api/client';
import { storage } from '../config/firebase';
import { useAuthStore } from './authStore';

interface FamilyComposition {
  household?: string;
  childrenAges?: string[];
  pets?: string[];
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

interface ConsentData {
  privacyVersion: string;
  termsVersion: string;
  acceptedAt: string;
}

interface OnboardingState {
  username: string;
  birthdate: string;
  photos: string[];
  location?: LocationData;
  composition: FamilyComposition;
  interests: string[];
  bio: string;
  consent?: ConsentData;

  setUsername: (username: string) => void;
  setBirthdate: (birthdate: string) => void;
  setPhotos: (photos: string[]) => void;
  setLocation: (location?: LocationData) => void;
  setComposition: (composition: FamilyComposition) => void;
  setInterests: (interests: string[]) => void;
  setBio: (bio: string) => void;
  setConsent: (consent: ConsentData) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

async function uploadLocalPhoto(localUri: string, uid: string): Promise<string> {
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error('Network request failed'));
    xhr.responseType = 'blob';
    xhr.open('GET', localUri, true);
    xhr.send(null);
  });
  const storageRef = ref(storage, `profiles/${uid}/photo_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  username: '',
  birthdate: '',
  photos: [],
  location: undefined,
  composition: {},
  interests: [],
  bio: '',

  setUsername: (username) => set({ username }),
  setBirthdate: (birthdate) => set({ birthdate }),
  setPhotos: (photos) => set({ photos }),
  setLocation: (location) => set({ location }),
  setComposition: (composition) => set({ composition }),
  setInterests: (interests) => set({ interests }),
  setBio: (bio) => set({ bio }),
  setConsent: (consent) => set({ consent }),

  submit: async () => {
    const { username, birthdate, photos, location, composition, interests, bio, consent } = get();
    const uid = useAuthStore.getState().firebaseUser?.uid;

    // Upload any local file:// URIs to Firebase Storage
    const uploadedPhotos: string[] = [];
    for (const uri of photos) {
      if ((uri.startsWith('file://') || uri.startsWith('content://')) && uid) {
        uploadedPhotos.push(await uploadLocalPhoto(uri, uid));
      } else {
        uploadedPhotos.push(uri);
      }
    }

    await api.auth.updateProfile({
      username,
      displayName: username,
      bio,
      composition,
      interests,
      photoURL: uploadedPhotos[0] || undefined,
      photos: uploadedPhotos,
      ...(location ? { location } : {}),
      ...(consent ? {
        consent_privacy_version: consent.privacyVersion,
        consent_terms_version: consent.termsVersion,
        consent_accepted_at: consent.acceptedAt,
      } : {}),
    } as Parameters<typeof api.auth.updateProfile>[0]);

    await useAuthStore.getState().refreshProfile();
  },

  reset: () =>
    set({
      username: '',
      birthdate: '',
      photos: [],
      location: undefined,
      composition: {},
      interests: [],
      bio: '',
      consent: undefined,
    }),
}));
