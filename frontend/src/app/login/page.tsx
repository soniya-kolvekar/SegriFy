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
      const firebaseToken = await userCredential.user.getIdToken();

      // 2. Fetch User Profile from MongoDB to get roles
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
      <div className="w-full max-w-[480px] bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 border border-brand-secondary/20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-brand-primary p-4 rounded-3xl mb-6 shadow-xl shadow-brand-primary/20">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-heading font-black text-brand-primary">SegriFy</h1>
            <p className="text-brand-muted-foreground mt-3 font-medium">Join the real-time waste revolution</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold mb-8 text-center border border-red-100">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted-foreground" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full bg-brand-bg py-5 pl-12 pr-6 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted-foreground" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-brand-bg py-5 pl-12 pr-6 rounded-2xl border-none text-sm font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary py-5 rounded-3xl text-white font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-brand-muted-foreground font-medium">
              Don't have an account? <span className="text-brand-accent font-black hover:underline cursor-pointer" onClick={() => router.push('/signup')}>Start Segregating</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
