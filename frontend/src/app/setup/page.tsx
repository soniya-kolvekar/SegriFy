'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Home, CreditCard, ArrowRight, CheckCircle2, Leaf, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

export default function SetupPage() {
  const router = useRouter();
  const { user, firebaseToken, setAuth } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    houseNumber: '',
    aadhaarNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRoleLabel = () => {
    if (user?.role === 'citizen-independent') return 'Independent House Number';
    if (user?.role === 'citizen-apartment') return 'Flat / Apartment Number';
    if (user?.role === 'business') return 'Shop / Business Number';
    return 'House / Flat Number';
  };

  const getPlaceholder = () => {
    if (user?.role === 'citizen-independent') return 'e.g. #1234 or House 42';
    if (user?.role === 'citizen-apartment') return 'e.g. Flat 402, Building A';
    if (user?.role === 'business') return 'e.g. Shop G-12 or Suite 5';
    return '#1234';
  };

  // If not logged in, redirect to signup
  useEffect(() => {
    if (!firebaseToken) {
      router.push('/signup');
      return;
    }

    if (user?.role === 'municipal') {
      router.replace('/municipal');
      return;
    }

    if (user?.role === 'worker') {
      router.replace('/worker');
      return;
    }

    // Secure Redirect: If user already has a verified identity, skip setup
    const role = user?.role;
    const isProfileComplete = !!(user?.houseId || user?.shopId);

    if (isProfileComplete) {
      router.push(role === 'business' ? '/dashboard/business' : '/dashboard');
    }
  }, [user, firebaseToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.aadhaarNumber.length !== 12 || isNaN(Number(form.aadhaarNumber))) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    setLoading(true);
    try {
      const maskedAadhaar = `XXXX-XXXX-${form.aadhaarNumber.slice(-4)}`;
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Determine whether to send houseId or shopId
      const payload: any = {
        name: form.name,
        maskedAadhaar,
      };
      
      if (user?.role === 'business') {
        payload.shopId = form.houseNumber;
      } else {
        payload.houseId = form.houseNumber;
      }

      const res = await fetch(`${API}/api/homeowner/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, firebaseToken!);
        router.push(user?.role === 'business' ? '/dashboard/business' : '/dashboard');
      } else {
        setError(data.message || 'Failed to save profile. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[560px]"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex bg-[#4D5443] p-4 rounded-none mb-5 shadow-xl shadow-[#4D5443]/20">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-black text-[#2D3128]">Complete Your Profile</h1>
          <p className="text-[#7A7D74] mt-2 font-medium">This is a one-time setup. Your info is kept secure.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-[#4D5443] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold text-[#4D5443]">Account Created</span>
          </div>
          <div className="w-12 h-0.5 bg-[#D9D7CE]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-[#4D5443] text-white flex items-center justify-center text-xs font-black">2</div>
            <span className="text-xs font-black text-[#2D3128]">Profile Details</span>
          </div>
          <div className="w-12 h-0.5 bg-[#D9D7CE]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-[#D9D7CE] text-[#7A7D74] flex items-center justify-center text-xs font-black">3</div>
            <span className="text-xs font-bold text-[#7A7D74]">Dashboard</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-none p-12 shadow-2xl shadow-[#4D5443]/5 border border-[#E5E2D9]">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-none text-sm font-bold mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aditya Verma"
                className="w-full bg-[#F5F4F0] py-4 px-5 rounded-none border-2 border-transparent text-sm font-semibold text-[#2D3128] focus:border-[#4D5443]/30 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* House / Flat Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Home className="w-3 h-3" /> {getRoleLabel()}
                <span className="text-[#4D5443] ml-1">(Primary Key)</span>
              </label>
              <input
                type="text"
                required
                value={form.houseNumber}
                onChange={e => setForm({ ...form, houseNumber: e.target.value })}
                placeholder={getPlaceholder()}
                className="w-full bg-[#F5F4F0] py-4 px-5 rounded-none border-2 border-transparent text-sm font-semibold text-[#2D3128] focus:border-[#4D5443]/30 focus:bg-white outline-none transition-all"
              />
              <p className="text-[9px] text-[#7A7D74] font-bold ml-1 uppercase tracking-widest">
                This will be used to generate your unique QR code
              </p>
            </div>

            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <CreditCard className="w-3 h-3" /> 12-Digit Aadhaar Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={12}
                  minLength={12}
                  inputMode="numeric"
                  value={form.aadhaarNumber}
                  onChange={e => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="0000 0000 0000"
                  className="w-full bg-[#F5F4F0] py-4 px-5 rounded-none border-2 border-transparent text-sm font-bold text-[#2D3128] focus:border-[#4D5443]/30 focus:bg-white outline-none transition-all tracking-[0.2em] text-center"
                />
              </div>
              <p className="text-[9px] text-[#7A7D74] font-bold ml-1 uppercase tracking-widest">
                We only store the last 4 digits (e.g. XXXX-XXXX-{form.aadhaarNumber.slice(-4) || '8921'})
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4D5443] py-5 rounded-none text-white font-black text-lg shadow-xl shadow-[#4D5443]/20 hover:bg-[#3D4435] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group mt-4 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving Profile...</>
              ) : (
                <>Go to My Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#7A7D74] font-bold uppercase tracking-widest mt-6">
          Your data is encrypted and never shared
        </p>
      </motion.div>
    </div>
  );
}
