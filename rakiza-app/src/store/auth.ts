import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Specialty =
  | 'project_manager'
  | 'civil_engineer'
  | 'electrical_tech'
  | 'mechanical_plumbing_tech';

export const SPECIALTIES: { id: Specialty; label: string; emoji: string }[] = [
  { id: 'project_manager',          label: 'مدير مشروع',           emoji: '🗂️' },
  { id: 'civil_engineer',           label: 'مهندس مدني',           emoji: '🏗️' },
  { id: 'electrical_tech',          label: 'فني كهرباء',           emoji: '⚡' },
  { id: 'mechanical_plumbing_tech', label: 'فني ميكانيكا/سباكة',   emoji: '🔧' },
];

interface AuthState {
  hydrated: boolean;
  onboarded: boolean;
  nationalId: string | null;
  specialty: Specialty | null;
  hydrate: () => Promise<void>;
  signIn: (nationalId: string, specialty: Specialty) => Promise<void>;
  signOut: () => Promise<void>;
}

const KEY = 'rk:auth:v1';

export const useAuth = create<AuthState>((set) => ({
  hydrated: false,
  onboarded: false,
  nationalId: null,
  specialty: null,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const v = JSON.parse(raw);
        set({ ...v, hydrated: true });
        return;
      }
    } catch {}
    set({ hydrated: true });
  },

  signIn: async (nationalId, specialty) => {
    const payload = { onboarded: true, nationalId, specialty };
    try { await AsyncStorage.setItem(KEY, JSON.stringify(payload)); } catch {}
    set(payload);
  },

  signOut: async () => {
    try { await AsyncStorage.removeItem(KEY); } catch {}
    set({ onboarded: false, nationalId: null, specialty: null });
  },
}));

export function specialtyLabel(s: Specialty | null): string {
  return SPECIALTIES.find(x => x.id === s)?.label ?? '—';
}
