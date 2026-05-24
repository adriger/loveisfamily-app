import { create } from 'zustand';
import { api } from '../api/client';
import { useAuthStore } from './authStore';

interface FamilyComposition {
  household?: string;
  children?: string;
  pets?: string;
}

interface OnboardingState {
  username: string;
  birthdate: string;
  photoURL?: string;
  composition: FamilyComposition;
  interests: string[];
  bio: string;

  setUsername: (username: string) => void;
  setBirthdate: (birthdate: string) => void;
  setPhotoURL: (photoURL?: string) => void;
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
  composition: {},
  interests: [],
  bio: '',

  setUsername: (username) => set({ username }),
  setBirthdate: (birthdate) => set({ birthdate }),
  setPhotoURL: (photoURL) => set({ photoURL }),
  setComposition: (composition) => set({ composition }),
  setInterests: (interests) => set({ interests }),
  setBio: (bio) => set({ bio }),

  submit: async () => {
    const { username, birthdate, photoURL, composition, interests, bio } = get();

    const bioText = [
      composition.household,
      composition.children,
      composition.pets,
    ]
      .filter(Boolean)
      .join(', ');

    await api.auth.updateProfile({
      displayName: username,
      bio: bio || bioText,
      interests,
      photoURL,
    });

    await useAuthStore.getState().refreshProfile();
  },

  reset: () =>
    set({
      username: '',
      birthdate: '',
      photoURL: undefined,
      composition: {},
      interests: [],
      bio: '',
    }),
}));
