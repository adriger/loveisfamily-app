import { create } from 'zustand';
import { api } from '../api/client';
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

interface OnboardingState {
  username: string;
  birthdate: string;
  photoURL?: string;
  location?: LocationData;
  composition: FamilyComposition;
  interests: string[];
  bio: string;

  setUsername: (username: string) => void;
  setBirthdate: (birthdate: string) => void;
  setPhotoURL: (photoURL?: string) => void;
  setLocation: (location?: LocationData) => void;
  setComposition: (composition: FamilyComposition) => void;
  setInterests: (interests: string[]) => void;
  setBio: (bio: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  username: '',
  birthdate: '',
  photoURL: undefined,
  location: undefined,
  composition: {},
  interests: [],
  bio: '',

  setUsername: (username) => set({ username }),
  setBirthdate: (birthdate) => set({ birthdate }),
  setPhotoURL: (photoURL) => set({ photoURL }),
  setLocation: (location) => set({ location }),
  setComposition: (composition) => set({ composition }),
  setInterests: (interests) => set({ interests }),
  setBio: (bio) => set({ bio }),

  submit: async () => {
    const { username, birthdate, photoURL, location, composition, interests, bio } = get();

    const bioText = [
      composition.household,
      composition.childrenAges?.join(', '),
      composition.pets?.join(', '),
    ]
      .filter(Boolean)
      .join(' · ');

    // TODO: If photoURL starts with 'file://' or 'content://', it is a local URI
    // and should be uploaded to Firebase Storage before calling updateProfile.
    // For now we pass the local URI as-is until storage upload is implemented.
    await api.auth.updateProfile({
      displayName: username,
      bio: bio || bioText,
      interests,
      photoURL,
      ...(location ? { location } : {}),
    });

    await useAuthStore.getState().refreshProfile();
  },

  reset: () =>
    set({
      username: '',
      birthdate: '',
      photoURL: undefined,
      location: undefined,
      composition: {},
      interests: [],
      bio: '',
    }),
}));
