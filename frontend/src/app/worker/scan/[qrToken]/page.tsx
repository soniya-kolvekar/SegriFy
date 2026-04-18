'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  MapPin, 
  User, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DirectScanPage() {
  const params = useParams();
  const router = useRouter();
  const { qrToken } = params;
  const { user, firebaseToken } = useAuthStore();
  
  const [targetUser, setTargetUser] = useState<any>(null);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 1. Auth & Role Protection
  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/worker/scan/${qrToken}`);
      return;
    }

    if (user.role !== 'worker' && user.role !== 'municipal') {
      setError('ACCESS DENIED: Authorized personnel only.');
      setLoading(false);
      return;
    }

    // 2. Fetch Resident Details (Standardized check)
    const fetchResident = async () => {
      try {
        const res = await fetch(`${API}/api/segregation/validate/${qrToken}`, {
          headers: { 'Authorization': `Bearer ${firebaseToken}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setTargetUser(data.user);
          setAlreadyScanned(data.alreadyScanned);
        } else {
          setError(data.message || 'Invalid Identifier.');
        }
      } catch (err) {
        setError('Connection failed. Please check your internet.');
      } finally {
        setLoading(false);
      }
    };

    fetchResident();
  }, [qrToken, user, firebaseToken, router]);

  const handleUpdate = async (status: 'proper' | 'improper') => {
    if (!user || submitting || alreadyScanned) return;
    setSubmitting(true);
    setError(null);

    const workerMongoId = user.id || user._id;

    try {
      const res = await fetch(`${API}/api/segregation/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          qrToken,
          status,
          workerId: workerMongoId,
          municipalId: workerMongoId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/worker'), 2500);
      } else {
        setError(data.message || 'Failed to update database.');
      }
    } catch (err) {
      setError('Failed to transmit data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Decrypting Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary p-6 lg:p-12 flex flex-col items-center justify-center font-sans transition-all duration-500">
      <div className="w-full max-w-lg bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        {/* Top Decoration */}
        <div className="h-3 bg-brand-secondary/80 animate-pulse" />
        
        <div className="p-10 space-y-10">
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/worker')}
              className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition-all group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Node
            </button>
            <ShieldCheck className="w-8 h-8 text-brand-secondary opacity-50" />
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border-2 border-red-500/50 p-8 text-center space-y-6"
              >
                <div className="inline-flex p-4 bg-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Identity Fault</h3>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-loose">{error}</p>
                </div>
                <button 
                  onClick={() => router.push('/worker')}
                  className="w-full bg-white text-black py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-secondary transition-all"
                >
                  Reset Terminal
                </button>
              </motion.div>
            ) : success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border-2 border-green-500/50 p-10 text-center space-y-8"
              >
                <div className="inline-flex p-5 bg-green-500/20">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Registry Updated</h3>
                  <p className="text-[9px] font-black text-green-400 uppercase tracking-[0.3em] leading-relaxed">Resident records successfully synced. Points allocated.</p>
                </div>
                <div className="flex flex-col items-center">
                   <div className="w-full h-1 bg-white/5 overflow-hidden">
                      <div className="h-full bg-green-500 animate-progress origin-left"></div>
                   </div>
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mt-3 italic">Autonomous Redirection...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] leading-none mb-4 underline underline-offset-8 decoration-brand-secondary">Field Identification Scan</p>
                  <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Log Waste</h2>
                </div>

                {/* Resident Card */}
                <div className="bg-white/5 p-8 space-y-8 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 bg-brand-secondary text-black font-black text-[9px] uppercase tracking-widest italic shadow-lg">Target Located</div>
                  
                  {alreadyScanned && (
                    <div className="absolute bottom-0 left-0 right-0 bg-amber-500/20 border-t border-amber-500/40 p-3 flex items-center justify-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Logged: Valid record already exists</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-6 pt-4">
                    <div className="bg-white/10 p-4 border border-white/10">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Subject Name</p>
                      <p className="text-2xl font-black text-white uppercase tracking-tighter">{targetUser?.name || 'Loading Identifier...'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 pb-4">
                    <div className="bg-white/10 p-4 border border-white/10">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Residential Plot / Unit</p>
                      <p className="text-3xl font-black text-brand-secondary tracking-tighter uppercase italic">{targetUser?.houseId || targetUser?.shopId || 'Unregistered'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <button 
                    disabled={submitting || alreadyScanned}
                    onClick={() => handleUpdate('proper')}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-6 px-8 font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-between group disabled:opacity-20 disabled:grayscale"
                  >
                    <span>Log Proper (+10)</span>
                    <CheckCircle2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  </button>
                  <button 
                    disabled={submitting || alreadyScanned}
                    onClick={() => handleUpdate('improper')}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-6 px-8 font-black text-[11px] uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-between group disabled:opacity-20 disabled:grayscale border border-red-400/20"
                  >
                    <span>Log Improper Fault</span>
                    <XCircle className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        
        {/* Decal */}
        <div className="absolute top-1/2 -left-20 w-40 h-80 bg-brand-secondary/5 blur-[100px] pointer-events-none" />
      </div>

      <footer className="mt-12 flex flex-col items-center gap-4 opacity-30">
        <p className="text-[9px] font-black text-white uppercase tracking-[0.6em] italic">
          SEGRiFY PROTOCOL // FIELD HUB
        </p>
        <div className="w-20 h-1 bg-white/10" />
      </footer>
    </div>
  );
}
