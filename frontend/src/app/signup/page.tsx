'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, User, MapPin, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    houseId: '',
    maskedAadhaar: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'municipal' || formData.role === 'worker') {
      setError('Registration restricted: Administrative roles must be pre-approved.');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // 1. Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseToken = await userCredential.user.getIdToken();

      // 2. Sync with Backend MongoDB
      const response = await fetch('http://localhost:5000/api/auth/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          houseId: formData.houseId,
          maskedAadhaar: formData.maskedAadhaar
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAuth(data.user, firebaseToken);
        router.push(data.user.role === 'business' ? '/dashboard/business' : '/dashboard');
      } else {
        // If backend fails, you might want to delete the firebase user here in a real app
        setError(data.message || 'Database sync failed. Please try again.');
        await userCredential.user.delete().catch(console.error);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-[540px] bg-white p-12 rounded-none shadow-none border border-brand-muted relative overflow-hidden">
        <div className="relative z-10 w-full">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="bg-brand-primary p-4 rounded-none mb-4 shadow-none">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-black text-brand-primary uppercase tracking-tighter">Create Account</h1>
            <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mt-2">Join securely as a homeowner or business</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-none text-[10px] font-black uppercase tracking-widest mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe" 
                      className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com" 
                      className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">House ID</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                    <input 
                      type="text" 
                      value={formData.houseId}
                      onChange={(e) => setFormData({...formData, houseId: e.target.value})}
                      placeholder="e.g. #4521" 
                      className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-brand-bg py-4 px-5 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="citizen">Homeowner</option>
                    <option value="business">Business</option>
                  </select>
                </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary py-5 rounded-none text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:brightness-110 transition-all flex items-center justify-center gap-3 group mt-4 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Sign Up'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-brand-primary/40 font-black uppercase tracking-widest">
              Already have an account? <span className="text-brand-primary hover:underline cursor-pointer" onClick={() => router.push('/login')}>Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
