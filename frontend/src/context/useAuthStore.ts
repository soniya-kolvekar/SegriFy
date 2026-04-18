import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string; // MongoDB ID
  _id?: string; // MongoDB ID Alternative
  firebaseUid: string;
  name: string;
  email: string;
  role: 'citizen' | 'worker' | 'municipal' | 'business' | 'citizen-independent' | 'citizen-apartment';
  qrToken?: string;
  qrPayload?: string;
  houseId?: string;
  shopId?: string;
  maskedAadhaar?: string;
  points?: number;
  eligibilityStatus?: boolean;
  businessName?: string;
  industrySector?: string;
  phone?: string;
  pickupAddress?: string;
  aadhaarNo?: string;
  panCard?: string;
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
