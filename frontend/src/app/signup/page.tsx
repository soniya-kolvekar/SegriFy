'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Leaf, Mail, Lock, ArrowRight, UserPlus, 
  BarChart3, Truck, Eye, EyeOff, Home, Building2, Store 
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parentRole, setParentRole] = useState<'citizen' | 'business'>('citizen');
  const [citizenType, setCitizenType] = useState<'independent' | 'apartment'>('independent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Signup Attempt:', email);

    if (!auth) {
      console.error('Firebase Auth not initialized');
      setError('Authentication system error. Please refresh.');
      setLoading(false);
      return;
    }

    const finalRole = parentRole === 'business' ? 'business' : `citizen-${citizenType}`;

    try {
      console.log('Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase user created successfully');
      const firebaseToken = await userCredential.user.getIdToken();

      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Syncing with backend:', API);
      const response = await fetch(`${API}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${firebaseToken}` },
        body: JSON.stringify({ name: email.split('@')[0], role: finalRole }),
      });

      const data = await response.json();
      if (response.ok) {
        setAuth(data.user, firebaseToken);
        router.push('/setup');
      } else {
        setError(data.message || 'Registration failed.');
        await userCredential.user.delete().catch(console.error);
      }
    } catch (err: any) {
      console.error('Signup Error Caught:', err);
      setLoading(false);
      
      const errorMessage = err.message || '';
      const errorCode = err.code || '';

      if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('auth/email-already-in-use')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (errorCode === 'auth/weak-password' || errorMessage.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters.');
      } else if (errorCode === 'auth/invalid-email' || errorMessage.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(errorMessage || 'Registration failed.');
      }
      return; // Stop execution
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
              Join the <br /> 
              <span className="text-[#4D5443]">Smart Mission</span>
            </h1>
            <p className="text-lg text-[#7A7D74] font-medium leading-relaxed">
              Register your household or business to start benefiting from intelligent waste management and earn rewards for sustainable segregation.
            </p>
          </div>

          <div className="mt-16 space-y-10">
            <FeatureItem 
              icon={UserPlus} 
              title="One-Time Registration" 
              desc="Simple setup to get your unique QR code for verified waste collection." 
            />
            <FeatureItem 
              icon={Leaf} 
              title="Impact Tracking" 
              desc="Monitor your contribution to zero-waste goals in real-time." 
            />
          </div>
        </div>

        <div className="absolute -bottom-24 -right-24 opacity-5 rotate-12">
            <Leaf className="w-[600px] h-[600px] text-[#4D5443]" />
        </div>

        <div className="relative z-10 flex items-center gap-6 grayscale opacity-60">
           <div className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest">In collaboration with</div>
           <div className="w-8 h-8 rounded bg-[#2D3128]" />
           <div className="w-8 h-8 rounded bg-[#4D5443]" />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-white md:bg-transparent">
        <div className="w-full max-w-md space-y-8">
          
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-black text-[#2D3128]">Initialize Profile</h2>
            <p className="text-[#7A7D74] font-medium">Select your category to start the integration.</p>
          </div>

          {/* Account Type Tier 1 */}
          <div className="bg-[#F0EEE9] p-1 rounded-none flex relative h-14">
            <motion.div 
              className="absolute h-[calc(100%-8px)] bg-white rounded-none shadow-sm top-1 left-1"
              animate={{ x: parentRole === 'citizen' ? 0 : '100%' }}
              initial={false}
              style={{ width: 'calc(50% - 4px)' }}
            />
            <button onClick={() => setParentRole('citizen')} className={cn("flex-1 relative z-10 font-bold text-xs uppercase tracking-widest transition-colors", parentRole === 'citizen' ? "text-[#2D3128]" : "text-[#7A7D74]")}>
              Homeowner
            </button>
            <button onClick={() => setParentRole('business')} className={cn("flex-1 relative z-10 font-bold text-xs uppercase tracking-widest transition-colors", parentRole === 'business' ? "text-[#2D3128]" : "text-[#7A7D74]")}>
              Business
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {parentRole === 'citizen' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="bg-[#F9F6F1] p-1.5 rounded-none grid grid-cols-2 gap-1.5 border border-[#E5E2D9]"
                >
                  <button type="button" onClick={() => setCitizenType('independent')}
                    className={cn("py-3 rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all", citizenType === 'independent' ? "bg-[#4D5443] text-white" : "text-[#7A7D74] hover:bg-white")}>
                    <Home className="w-3 h-3" /> Independent
                  </button>
                  <button type="button" onClick={() => setCitizenType('apartment')}
                    className={cn("py-3 rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all", citizenType === 'apartment' ? "bg-[#4D5443] text-white" : "text-[#7A7D74] hover:bg-white")}>
                    <Building2 className="w-3 h-3" /> Apartment
                  </button>
                </motion.div>
              )}
              {parentRole === 'business' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="bg-[#F9F6F1] p-4 rounded-none border border-[#E5E2D9] flex items-center gap-3"
                >
                  <div className="bg-[#4D5443] p-2 rounded-none"><Store className="w-4 h-4 text-white" /></div>
                  <div className="text-[10px] font-black text-[#2D3128] uppercase tracking-widest">Registering as Commercial Entity</div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-none text-xs font-bold border border-red-100 flex flex-col gap-2">
                <span>{error}</span>
                {error.includes('already registered') && (
                  <button 
                    type="button" 
                    onClick={() => router.push('/login')}
                    className="text-left text-[#4D5443] underline decoration-dotted"
                  >
                    Go to Login instead →
                  </button>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7D74] group-focus-within:text-[#4D5443]" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (error) setError(''); }} placeholder="name@example.com"
                  className="w-full bg-white py-4 pl-14 pr-6 rounded-none border border-[#E5E2D9] text-sm font-medium focus:ring-4 focus:ring-[#4D5443]/5 focus:border-[#4D5443] transition-all outline-none" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7D74] group-focus-within:text-[#4D5443]" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-white py-4 pl-14 pr-14 rounded-none border border-[#E5E2D9] text-sm font-medium focus:ring-4 focus:ring-[#4D5443]/5 focus:border-[#4D5443] transition-all outline-none" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7A7D74]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#4D5443] py-5 rounded-none text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-[#4D5443]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {loading ? 'Initializing...' : 'Register for New Request'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-6 text-center border-t border-[#F0EEE9]">
            <p className="text-sm text-[#7A7D74] font-medium">
              Already have an infrastructure account? <span className="text-[#4D5443] font-black hover:underline cursor-pointer" onClick={() => router.push('/login')}>Sign In</span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-4 text-center px-6 pointer-events-none">
          <div className="flex gap-8 text-[9px] font-black text-[#7A7D74] uppercase tracking-widest pointer-events-auto">
            <a href="#" className="hover:text-[#4D5443]">Privacy Policy</a>
            <a href="#" className="hover:text-[#4D5443]">Terms of Service</a>
            <a href="#" className="hover:text-[#4D5443]">Accessibility</a>
            <a href="#" className="hover:text-[#4D5443]">Contact</a>
          </div>
          <p className="text-[9px] font-bold text-[#7A7D74]/50 uppercase tracking-[0.2em]">© 2024 SEGRIFY MUNICIPAL INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
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
