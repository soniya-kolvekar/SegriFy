'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 1. Firebase Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get the ID token and its decoded payload to rigorously check Custom Claims
      const tokenResult = await userCredential.user.getIdTokenResult(true);
      const firebaseToken = tokenResult.token;
      
      // If the hardcoded Firebase admin claim exists, grant immediate secure access.
      if (tokenResult.claims.admin) {
        setAuth({
            id: 'admin_override',
            firebaseUid: userCredential.user.uid,
            name: 'Municipal Administrator',
            email: userCredential.user.email || '',
            role: 'municipal'
        }, firebaseToken);
        router.push('/municipal');
        return;
      }

      // 2. Otherwise for Citizens/Businesses, fetch User Profile from MongoDB
      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${firebaseToken}` 
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setAuth(data.user, firebaseToken);
        
        // Route based on role
        if (data.user.role === 'municipal') {
          router.push('/municipal');
        } else if (data.user.role === 'worker') {
          router.push('/worker');
        } else if (data.user.role === 'business') {
          router.push('/dashboard/business');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Failed to load user profile. Please contact support.');
        auth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] bg-white p-12 rounded-none shadow-none border border-brand-muted relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-secondary/20 rounded-none blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-accent/5 rounded-none blur-3xl"></div>

        <div className="relative z-10 w-full">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-brand-primary p-4 rounded-none mb-6 shadow-none">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-heading font-black text-brand-primary uppercase tracking-tighter">SegriFy</h1>
            <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mt-2">Join the real-time waste revolution</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-none text-[10px] font-black uppercase tracking-widest mb-8 text-center border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full bg-brand-bg py-4 pl-12 pr-6 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/40" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-brand-bg py-4 pl-12 pr-6 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary py-5 rounded-none text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:brightness-110 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-brand-primary/40 font-black uppercase tracking-widest">
              Don't have an account? <span className="text-brand-primary hover:underline cursor-pointer" onClick={() => router.push('/signup')}>Start Segregating</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
