'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  QrCode, 
  Trash2, 
  CheckCircle2, 
  User as UserIcon,
  Camera,
  Search,
  LogOut,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/context/useAuthStore';
import { auth as firebaseAuth } from '@/lib/firebase';
import { apiRequest } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function WorkerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const showConfirmRef = useRef(false);

  useEffect(() => {
    showConfirmRef.current = showConfirm;
  }, [showConfirm]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (typeof document !== 'undefined' && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleLogout = async () => {
    await firebaseAuth.signOut();
    logout();
    router.push('/login');
  };

  const handleQrScanned = async (data: string) => {
    // Prevent multiple simultaneous lookups
    if (isValidating || !data) return;
    
    // 1. URL Extraction Logic
    let cleanToken = data;
    if (data.includes('/worker/scan/')) {
      const parts = data.split('/worker/scan/');
      cleanToken = parts[parts.length - 1].split('?')[0].split('#')[0];
    }
    
    setScannedData(cleanToken);
    setIsValidating(true);
    setStatus('loading');
    
    try {
      const response = await apiRequest(`/api/segregation/validate/${cleanToken}`);
      const result = await response.json();

      if (response.ok) {
        setTargetUser(result.user);
        setAlreadyScanned(result.alreadyScanned);
        setShowConfirm(true); 
        setStatus('idle');
      } else {
        setStatus('error');
        setMessage({ type: 'error', text: result.message || 'Unregistered or Invalid ID' });
        setTimeout(() => {
          setStatus('idle');
          setMessage(null);
          setScannedData(null);
          setManualId('');
        }, 3000);
      }
    } catch (err) {
      setStatus('error');
      setMessage({ type: 'error', text: 'Network identity check failed' });
    } finally {
      setIsValidating(false);
    }
  };

  // Manual Lookup Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (manualId.length >= 3 && !showConfirm && !isValidating) {
        handleQrScanned(manualId);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [manualId]);

  const handleValidation = async (isProper: boolean) => {
    setStatus('loading');
    setSubmitting(true);
    try {
      const response = await apiRequest('/api/segregation/update', {
        method: 'POST',
        body: JSON.stringify({
          qrToken: scannedData || 'manual_log',
          status: isProper ? 'proper' : 'improper',
          workerId: user?.id || user?._id,
          municipalId: user?.id || user?._id // Match the required payload
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage({ type: 'success', text: 'Record updated successfully' });
        setTimeout(() => {
          setStatus('idle');
          setIsScannerActive(false);
          setShowConfirm(false);
          setScannedData(null);
          setMessage(null);
        }, 2000);
      } else {
        const data = await response.json();
        setStatus('error');
        setMessage({ type: 'error', text: data.message || 'Update failed' });
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (err) {
      setStatus('error');
      setMessage({ type: 'error', text: 'Network error' });
      setTimeout(() => setStatus('idle'), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    let mounted = true;
    
    async function startCamera() {
      if (!isScannerActive || showConfirm || !mounted) return;
      
      setIsCameraStarting(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraStarting(false);

        const scan = () => {
          if (!mounted || showConfirmRef.current) return;
          
          if (videoRef.current && canvasRef.current && (window as any).jsQR) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.height = video.videoHeight;
              canvas.width = video.videoWidth;
              context?.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
              if (imageData) {
                const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
                });
                
                if (code) {
                  handleQrScanned(code.data);
                  return;
                }
              }
            }
          }
          animationFrameId = requestAnimationFrame(scan);
        };
        animationFrameId = requestAnimationFrame(scan);

      } catch (err) {
        console.error("Camera Error:", err);
        setIsCameraStarting(false);
        setIsScannerActive(false);
      }
    }

    if (isScannerActive && !showConfirm) {
      startCamera();
    }
    
    return () => {
      mounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      stopCamera();
    };
  }, [isScannerActive, showConfirm]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans transition-colors duration-500">
      <header className="h-20 bg-brand-primary border-b border-white/10 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 flex items-center justify-center text-white border border-white/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-none uppercase">Worker Node</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40 mt-1 italic">SegriFy Infrastructure</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-all text-[10px] uppercase font-black tracking-widest">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block leading-none">Leave Session</span>
          </button>
          <div className="w-10 h-10 bg-white/20 flex items-center justify-center text-white border border-white/20">
             <UserIcon className="w-6 h-6" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-10 flex flex-col items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="w-full max-w-lg bg-brand-primary p-8 border border-white/10 flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          {!isScannerActive ? (
            <div className="flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-white/5 flex items-center justify-center text-white border border-white/10 mb-8 shadow-inner">
                <QrCode className="w-12 h-12 text-brand-secondary" />
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase italic">Field Terminal</h3>
              <p className="text-xs font-black text-white/40 mb-10 max-w-sm uppercase tracking-widest leading-relaxed">System Ready. Initiate housing validation to award segregation rewards.</p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => setIsScannerActive(true)}
                  className="w-full bg-white text-black py-6 font-black text-sm uppercase tracking-[0.3em] hover:bg-brand-secondary transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                  Start Scanning
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 flex items-center justify-center text-white border border-white/10">
                    <Camera className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                    {showConfirm ? 'Validation' : 'Identity Sensor'}
                  </h3>
                </div>
                
                <button 
                  onClick={() => {
                    stopCamera();
                    setIsScannerActive(false);
                    setShowConfirm(false);
                    setScannedData(null);
                    setManualId('');
                  }} 
                  className="p-2 text-white/30 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {!showConfirm ? (
                <div className="space-y-6">
                  {/* Mock/Live Viewport */}
                  <div className="aspect-[3/4] bg-[#050505] relative overflow-hidden border-8 border-white/5 shadow-inner flex items-center justify-center group transition-all">
                    {isCameraStarting && (
                      <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 text-brand-secondary animate-spin" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">Lens Initialization...</p>
                      </div>
                    )}
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className={cn(
                        "w-full h-full object-cover transition-all duration-1000",
                        isCameraStarting || isValidating ? "opacity-30 brightness-50 grayscale" : "opacity-100 brightness-110 grayscale-[0.5]"
                      )}
                    />
                    
                    {isValidating && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="p-5 bg-white shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          <Loader2 className="w-8 h-8 text-black animate-spin" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] drop-shadow-lg text-center px-6 leading-loose">Querying Municipal Registry...</p>
                      </div>
                    )}

                    {!isCameraStarting && !isValidating && (
                      <div className="absolute inset-x-10 top-20 bottom-20 border-2 border-white/10 flex items-center justify-center pointer-events-none transition-all group-hover:border-white/20">
                         {/* Scanning laser line animation */}
                         <div className="absolute top-1/2 left-0 w-full h-[3px] bg-brand-secondary/80 shadow-[0_0_20px_rgba(249,115,22,1)] animate-pulse" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 pointer-events-none"></div>
                  </div>

                  {/* Manual Input Fallback */}
                  <div className="bg-white/5 p-4 border border-white/10 backdrop-blur-md flex items-center gap-4 group transition-all focus-within:border-brand-secondary/50">
                    <Search className="w-5 h-5 text-white/20 group-focus-within:text-brand-secondary transition-colors" />
                    <input 
                      type="text"
                      placeholder="MANUAL HOUSE/QR ID..."
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value.toUpperCase())}
                      className="bg-transparent border-none text-white font-black text-xs placeholder:text-white/10 focus:ring-0 p-0 flex-1 uppercase tracking-[0.3em]"
                    />
                    {manualId.length > 0 && (
                      <button onClick={() => setManualId('')} className="text-white/20 hover:text-white">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                  <AnimatePresence mode="wait">
                    {message ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className={`p-10 text-center border-4 ${message.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'}`}
                      >
                        {message.type === 'success' ? <CheckCircle2 className="w-16 h-16 mx-auto mb-6" /> : <XCircle className="w-16 h-16 mx-auto mb-6" />}
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{message.type === 'success' ? 'Verified' : 'Log Failure'}</h4>
                        <p className="font-black text-xs uppercase tracking-widest leading-loose">{message.text}</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-8">
                        <div className="bg-white/10 p-8 text-center border border-white/10 backdrop-blur-md relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 bg-brand-secondary text-black font-black text-[8px] uppercase tracking-widest">Citizen Found</div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3 leading-none underline underline-offset-8 decoration-brand-secondary">Identified Subject</p>
                          <h4 className="text-3xl font-black text-white break-all uppercase tracking-tighter">
                            {targetUser?.name || 'Resident'}
                          </h4>
                          <p className="text-[10px] font-black text-brand-secondary mt-4 uppercase tracking-[0.2em] bg-white/5 py-2 inline-block px-4 border border-white/5">
                             Unit ID: {targetUser?.houseId || targetUser?.shopId || 'N/A'}
                          </p>
                        </div>

                        {alreadyScanned && (
                          <div className="bg-amber-500/10 p-5 border border-amber-500/50 flex items-center gap-4 animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            <p className="text-[10px] font-black text-amber-500 uppercase leading-relaxed tracking-widest">
                              Registry conflict: Daily record already exists. Rewards locked.
                            </p>
                          </div>
                        )}

                        <div className="space-y-4">
                          <button
                            onClick={() => handleValidation(true)}
                            disabled={submitting || alreadyScanned}
                            className="w-full py-6 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(22,163,74,0.2)]"
                          >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                             Log Proper Segregation
                          </button>
                          <button
                            onClick={() => handleValidation(false)}
                            disabled={submitting || alreadyScanned}
                            className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                          >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            Log Improper Fault
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => { setShowConfirm(false); setScannedData(null); setManualId(''); }}
                          className="w-full py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.4em] hover:text-white transition-all text-center border border-white/5 hover:bg-white/5"
                        >
                          Manual Rescan / Reset
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Background Industrial Decals */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-secondary opacity-20" />
        </div>
      </main>

      <footer className="p-10 text-center text-[9px] font-black text-brand-primary/20 uppercase tracking-[0.5em] italic">
        © 2024 SEGRiFY MUNICIPALITY // FIELD TErMiNAL NODE 4 // SECURE ACCESS
      </footer>
    </div>
  );
}
