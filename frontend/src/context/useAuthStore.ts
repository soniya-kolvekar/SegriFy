import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string; // MongoDB ID
  firebaseUid: string;
  name: string;
  email: string;
  role: 'citizen' | 'worker' | 'municipal' | 'business';
  qrToken?: string;
  points?: number;
  eligibilityStatus?: boolean;
  businessName?: string;
  aadhaarNo?: string;
  panCard?: string;
  shopNumber?: string;
}

interface AuthState {
  user: User | null;
  firebaseToken: string | null;
  setAuth: (user: User, firebaseToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      firebaseToken: null,
      setAuth: (user, firebaseToken) => set({ user, firebaseToken }),
      logout: () => set({ user: null, firebaseToken: null }),
    }),
    {
      name: 'segrify-auth',
    }
  )
);
