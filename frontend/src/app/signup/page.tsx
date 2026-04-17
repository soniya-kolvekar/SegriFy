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
      <div className="w-full max-w-[540px] bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 border border-brand-secondary/20 relative overflow-hidden">
        <div className="relative z-10 w-full">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="bg-brand-primary p-4 rounded-3xl mb-4 shadow-xl shadow-brand-primary/20">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-black text-brand-primary">Create Account</h1>
            <p className="text-brand-muted-foreground mt-2 font-medium">Join securely as a homeowner or business</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-xs font-black text-brand-primary ml-1 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe" 
                      className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-brand-primary ml-1 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted-foreground" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com" 
                      className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                      required
                    />
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div className="space-y-1.5">
                  <label className="text-xs font-black text-brand-primary ml-1 uppercase">House ID</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted-foreground" />
                    <input 
                      type="text" 
                      value={formData.houseId}
                      onChange={(e) => setFormData({...formData, houseId: e.target.value})}
                      placeholder="e.g. #4521" 
                      className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-brand-primary ml-1 uppercase">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-brand-bg py-4 px-5 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                  >
                    <option value="citizen">Homeowner</option>
                    <option value="business">Business</option>
                  </select>
                </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-brand-primary ml-1 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted-foreground" />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full bg-brand-bg py-4 pl-11 pr-5 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary py-5 rounded-3xl text-white font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group mt-4 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Sign Up'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-brand-muted-foreground font-medium">
              Already have an account? <span className="text-brand-accent font-black hover:underline cursor-pointer" onClick={() => router.push('/login')}>Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
