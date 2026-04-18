'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Trash2, 
  CheckCircle2, 
  User as UserIcon,
  Camera,
  Search,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/useAuthStore';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function WorkerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [userId, setUserId] = useState('');
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [scanError, setScanError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      useAuthStore.getState().logout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  const headers = { Authorization: `Bearer ${useAuthStore.getState().firebaseToken}` };

  const handleLookup = async () => {
    if (!userId) return;
    setScanError('');
    setScannedUser(null);
    setAlreadyScanned(false);
    try {
      const res = await fetch(`http://localhost:5000/api/segregation/validate/${userId}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setScannedUser(data.user);
        setAlreadyScanned(data.alreadyScanned);
      } else {
        setScanError(data.message);
      }
    } catch {
      setScanError('Connection error');
    }
  };

  // Auto-lookup when userId is entered (throttled/debounced if needed, but simple for now)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (userId.length >= 3) handleLookup();
    }, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  React.useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'worker') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'worker') return null;

  const handleScanSimulation = async (isProper: boolean) => {
    if (!userId) return alert('Please enter a User ID');
    
    setStatus('loading');
    
    try {
      const response = await fetch('http://localhost:5000/api/segregation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: userId,
          status: isProper ? 'proper' : 'improper',
          workerId: user?.id || user?._id || 'SYSTEM'
        })
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary p-6 flex flex-col items-center justify-center text-white font-sans antialiased">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-white/10 w-20 h-20 rounded-none mx-auto flex items-center justify-center shadow-none mb-6 border-4 border-white/20">
            <QrCode className="w-10 h-10 text-brand-accent" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Worker Scanner</h1>
          <p className="text-white/60 mt-2 font-black text-[10px] uppercase tracking-widest italic">Log waste segregation records instantly</p>
          
          <button 
            onClick={handleLogout}
            className="mt-6 mx-auto flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all border border-white/10 text-[9px] font-black uppercase tracking-[0.2em]"
          >
            Leave Session
          </button>
        </div>

        {/* Mock Scanner View */}
        <div className="relative bg-black rounded-none aspect-[3/4] overflow-hidden border-8 border-white/10 shadow-none group flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          
          {/* Scanning Animation */}
          <div className="absolute inset-x-10 top-20 bottom-20 border-2 border-brand-accent/30 rounded-none flex items-center justify-center">
             <div className="w-full h-1 bg-brand-accent shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-pulse absolute top-1/2"></div>
             <Camera className="w-16 h-16 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-8">
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 bg-white/5 py-2 rounded-none backdrop-blur-sm border border-white/10">Align code within frame</p>
            <div className="flex bg-white/10 rounded-none p-2 backdrop-blur-md border border-white/10">
              <Search className="w-4 h-4 text-white/40 ml-3 mt-3" />
              <input 
                type="text" 
                placeholder="MANUAL HOUSE ID..." 
                className="bg-transparent border-none text-white font-black text-xs placeholder:text-white/20 focus:ring-0 p-3 flex-1 uppercase tracking-widest"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/5 rounded-none p-8 border border-white/10 backdrop-blur-xl">
          {/* Status Indicators removed as per wasteType cleanup */}

          {/* User Preview Section */}
          <div className="mb-6">
            {scannedUser ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 p-4 border-l-4 border-brand-accent mb-4">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Resident Identified</p>
                     <h4 className="text-xl font-black text-white mt-1 uppercase tracking-tighter">
                       {scannedUser.houseId || scannedUser.shopId || 'Unknown Unit'}
                     </h4>
                     <p className="text-[10px] font-bold text-white/40 uppercase mt-1">Owner: {scannedUser.name}</p>
                   </div>
                   {alreadyScanned && (
                     <div className="bg-amber-500/20 px-2 py-1 border border-amber-500/50">
                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Done Today</p>
                     </div>
                   )}
                 </div>
                 {alreadyScanned && (
                   <p className="text-[9px] font-bold text-amber-400 mt-2 uppercase flex items-center gap-1">
                     <AlertCircle className="w-3 h-3" /> This unit has already been processed today.
                   </p>
                 )}
              </motion.div>
            ) : scanError ? (
              <div className="bg-red-900/40 p-4 border-l-4 border-red-500 mb-4 animate-pulse">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Error</p>
                <p className="text-sm font-bold text-white mt-1 uppercase">{scanError}</p>
              </div>
            ) : userId.length > 0 ? (
              <div className="text-center py-4 text-white/20 text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                Scanning for matches...
              </div>
            ) : (
              <div className="text-center py-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                Waiting for input...
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleScanSimulation(true)}
              disabled={status === 'loading' || !scannedUser || alreadyScanned}
              className="w-full py-5 rounded-none bg-green-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-green-500/30"
            >
              <CheckCircle2 className="w-5 h-5" />
              PROPERLY SEGREGATED
            </button>
            <button 
              onClick={() => handleScanSimulation(false)}
              disabled={status === 'loading' || !scannedUser || alreadyScanned}
              className="w-full py-5 rounded-none bg-red-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-red-500/30"
            >
               <Trash2 className="w-5 h-5" />
               IMPROPER SEGREGATION
            </button>
          </div>
        </div>
      </div>

      {/* Status Toasts */}
      {status === 'success' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-none font-black text-[10px] uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-5 border border-green-400/30">
          Record updated successfully
        </div>
      )}
      {status === 'error' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-none font-black text-[10px] uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-5 border border-red-400/30">
          Failed to update record
        </div>
      )}
    </div>
  );
}
