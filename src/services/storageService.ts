export type AuthMethod = 'mobile' | 'google' | 'apple' | 'facebook' | 'email';

export interface AuthSession {
  method: AuthMethod;
  identifier: string;
  signedInAt: string;
}

export interface FarmerProfile {
  name: string;
  mobile: string;
  village: string;
  farmlandArea: number;
  cropType: string;
  language: string;
  latitude?: number;
  longitude?: number;
  gpsDetected?: boolean;
}

export interface PersistedAppState {
  auth: AuthSession | null;
  profile: FarmerProfile | null;
}

const STORAGE_KEY = 'farm-in-one-state-v2';

export const defaultProfile: FarmerProfile = {
  name: '',
  mobile: '',
  village: '',
  farmlandArea: 2,
  cropType: 'Paddy',
  language: 'en',
  latitude: undefined,
  longitude: undefined,
  gpsDetected: false
};

export function loadPersistedState(): PersistedAppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { auth: null, profile: null };
    const parsed = JSON.parse(raw) as PersistedAppState;
    return {
      auth: parsed.auth ?? null,
      profile: parsed.profile ? { ...defaultProfile, ...parsed.profile } : null
    };
  } catch {
    return { auth: null, profile: null };
  }
}

export function savePersistedState(state: PersistedAppState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedState() {
  window.localStorage.removeItem(STORAGE_KEY);
}
