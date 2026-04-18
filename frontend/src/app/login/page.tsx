'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Leaf, Mail, Lock, ArrowRight, ShieldCheck, 
  BarChart3, Truck, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setAuth } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (user.role === 'municipal') router.replace('/municipal');
      else if (user.role === 'worker') router.replace('/worker');
      else if (user.role === 'business') router.replace('/dashboard/business');
      else router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);
      const firebaseToken = tokenResult.token;
      
      // Admin override check — Use custom claim if necessary, but prefer DB identity
      // Note: For 'admin@segrify.gov', we want to use the actual MongoDB profile details.
      // Direct Municipal Access for core admin
      if (email === 'admin@segrify.gov') {
        setAuth({
            id: 'admin_override',
            firebaseUid: userCredential.user.uid,
            name: 'Municipal Administrator',
            email: userCredential.user.email || '',
            role: 'municipal'
        }, firebaseToken);
        router.push('/municipal');
        return;
      } else if (tokenResult.claims.admin || email === 'admin@segrify.gov') {
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

      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API}/api/auth/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${firebaseToken}` }
      });

      const data = await response.json();
      
      if (response.ok) {
        setAuth(data.user, firebaseToken);
        
        // Unified Onboarding/Dashboard Redirect
        const role = data.user.role || 'citizen';
        const hasIdentity = data.user.houseId || data.user.shopId;

        if (role === 'municipal') {
          router.push('/municipal');
        } else if (role === 'worker') {
          router.push('/worker');
        } else if (!hasIdentity) {
          // New User / Incomplete Profile -> Setup
          router.push('/setup');
        } else {
          // Returning User -> Respective Dashboard
          router.push(role === 'business' ? '/dashboard/business' : '/dashboard');
        }
      } else {
        setError(data.message || 'Failed to load user profile.');
        auth.signOut();
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row font-sans selection:bg-[#4D5443] selection:text-white">
      
      {/* Left Branding Panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#F9F6F1] p-16 lg:p-24 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="bg-[#4D5443] p-2 rounded-none">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-[#4D5443] tracking-tighter">SegriFy</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-6xl font-black text-[#2D3128] leading-[1.1] tracking-tight">
              National Smart <br /> 
              <span className="text-[#4D5443]">Waste Mission</span>
            </h1>
            <p className="text-lg text-[#7A7D74] font-medium leading-relaxed">
              Architecting the future of urban sanitation. Join the centralized infrastructure for intelligent segregation, efficient logistics, and sustainable resource recovery.
            </p>
          </div>

          <div className="mt-16 space-y-10">
            <FeatureItem 
              icon={BarChart3} 
              title="Real-time Analytics" 
              desc="Centralized monitoring of municipal waste streams and collection efficiency." 
            />
            <FeatureItem 
              icon={Truck} 
              title="Zero-Waste Logistics" 
              desc="Optimized routing algorithms reducing carbon footprint of disposal cycles." 
            />
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute -bottom-24 -right-24 opacity-5 rotate-12">
            <Leaf className="w-[600px] h-[600px] text-[#4D5443]" />
        </div>


      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-white md:bg-transparent">
        <div className="w-full max-w-md space-y-10">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-[#2D3128]">Access Portal</h2>
            <p className="text-[#7A7D74] font-medium">Please enter your credentials to access the infrastructure dashboard.</p>
          </div>



          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 rounded-none text-xs font-bold border border-red-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7D74] group-focus-within:text-[#4D5443] transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@infrastructure.gov" 
                  className="w-full bg-white py-5 pl-14 pr-6 rounded-none border border-[#E5E2D9] text-sm font-medium focus:ring-4 focus:ring-[#4D5443]/5 focus:border-[#4D5443] transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center mb-0.5 px-1">
                <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7D74] group-focus-within:text-[#4D5443] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white py-5 pl-14 pr-14 rounded-none border border-[#E5E2D9] text-sm font-medium focus:ring-4 focus:ring-[#4D5443]/5 focus:border-[#4D5443] transition-all outline-none"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7A7D74] hover:text-[#4D5443]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>



            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#4D5443] py-5 rounded-none text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-[#4D5443]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Continue to Dashboard'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-8 text-center border-t border-[#F0EEE9]">
            <p className="text-sm text-[#7A7D74] font-medium">
              New to the infrastructure? <span className="text-[#4D5443] font-black hover:underline cursor-pointer" onClick={() => router.push('/signup')}>Register for New Request</span>
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-5 group">
      <div className="w-12 h-12 rounded-none bg-[#4D5443]/5 flex items-center justify-center shrink-0 group-hover:bg-[#4D5443] transition-colors">
        <Icon className="w-5 h-5 text-[#4D5443] group-hover:text-white transition-colors" />
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-black text-[#2D3128]">{title}</h4>
        <p className="text-sm text-[#7A7D74] leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
