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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 1. Auth & Role Protection
  useEffect(() => {
    if (!user) {
      // Redirect to login but keep the current path as a redirect target
      router.push(`/login?redirect=/worker/scan/${qrToken}`);
      return;
    }

    if (user.role !== 'worker' && user.role !== 'municipal') {
      setError('ACCESS DENIED: Only authorized Municipal workers can log waste segregation.');
      setLoading(false);
      return;
    }

    // 2. Fetch Resident Details
    const fetchResident = async () => {
      try {
        const res = await fetch(`${API}/api/segregation/validate/${qrToken}`, {
          headers: { 'Authorization': `Bearer ${firebaseToken}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setTargetUser(data.user);
        } else {
          setError(data.message || 'Invalid QR Code or User not found.');
        }
      } catch (err) {
        setError('Network error. Could not connect to the municipal server.');
      } finally {
        setLoading(false);
      }
    };

    fetchResident();
  }, [qrToken, user, firebaseToken, router]);

  const handleUpdate = async (status: 'proper' | 'improper') => {
    if (!user || submitting) return;
    setSubmitting(true);
    setError(null);

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
          workerId: user.id || user._id,
          municipalId: 'MUNICIPAL_AUTH' // Fallback for direct scan
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        // Auto-redirect back to dashboard after 3 seconds
        setTimeout(() => router.push('/worker'), 3000);
      } else {
        setError(data.message || 'Failed to update record.');
      }
    } catch (err) {
      setError('Failed to transmit data to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#4D5443] animate-spin" />
          <p className="text-xs font-black text-[#7A7D74] uppercase tracking-widest">Validating Infrastructure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 lg:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white border border-[#E5E2D9] shadow-2xl relative overflow-hidden">
        
        {/* Top Decoration */}
        <div className="h-2 bg-gradient-to-r from-[#4D5443] via-[#788852] to-[#4D5443]" />
        
        <div className="p-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/worker')}
              className="flex items-center gap-2 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest hover:text-[#4D5443] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </button>
            <ShieldCheck className="w-6 h-6 text-[#4D5443]" />
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 p-6 text-center space-y-4"
              >
                <div className="inline-flex p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-black text-red-900 uppercase">Verification Failed</h3>
                <p className="text-sm font-medium text-red-700 leading-relaxed">{error}</p>
                <button 
                  onClick={() => router.push('/worker')}
                  className="w-full bg-red-600 text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            ) : success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-[#EAF5CE] border border-[#D5ECA5] p-8 text-center space-y-6"
              >
                <div className="inline-flex p-4 bg-[#D5ECA5] rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-[#567E14]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#2D3128] uppercase">Record Logged</h3>
                  <p className="text-sm font-medium text-[#567E14]">Segregation data successfully synced to the municipal database.</p>
                </div>
                <p className="text-[10px] font-black text-[#567E14]/40 uppercase tracking-widest animate-pulse">Redirecting back...</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-[0.2em]">Verification Scan</p>
                  <h2 className="text-3xl font-black text-[#2D3128] tracking-tight">Log Waste Log</h2>
                </div>

                {/* Resident Card */}
                <div className="bg-[#F9F6F1] p-6 space-y-4 border border-[#E5E2D9]">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#4D5443] p-2.5">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest mb-1">Resident / Business</p>
                      <p className="text-lg font-black text-[#2D3128]">{targetUser?.name || 'Loading...'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#4D5443] p-2.5">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest mb-1">Infrastructure ID</p>
                      <p className="text-lg font-black text-[#2D3128]">{targetUser?.houseId || targetUser?.shopId || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button 
                    disabled={submitting}
                    onClick={() => handleUpdate('proper')}
                    className="w-full bg-[#4D5443] text-white py-5 px-6 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-between group"
                  >
                    <span>Proper Segregation</span>
                    <CheckCircle2 className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  </button>
                  <button 
                    disabled={submitting}
                    onClick={() => handleUpdate('improper')}
                    className="w-full bg-white border-2 border-red-200 text-red-600 py-5 px-6 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 active:scale-95 transition-all flex items-center justify-between group"
                  >
                    <span>Improperly Mixed</span>
                    <XCircle className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <p className="mt-8 text-[10px] font-black text-[#7A7D74] uppercase tracking-[0.3em] opacity-40">
        SegriFy Municipal Infrastructure · Worker Portal
      </p>
    </div>
  );
}
