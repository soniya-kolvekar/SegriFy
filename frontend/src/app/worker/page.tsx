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
    if (isValidating) return;
    
    setScannedData(data);
    setIsValidating(true);
    
    try {
      const response = await apiRequest(`/api/segregation/validate/${data}`);
      const result = await response.json();

      if (response.ok) {
        setTargetUser(result.user);
        setAlreadyScanned(result.alreadyScanned);
        setShowConfirm(true); 
      } else {
        setStatus('error');
        setMessage({ type: 'error', text: result.message || 'Unregistered or Invalid QR Code' });
        // Auto-reset error after 3 seconds to allow re-scanning
        setTimeout(() => {
          setStatus('idle');
          setMessage(null);
          setScannedData(null);
        }, 3000);
      }
    } catch (err) {
      setStatus('error');
      setMessage({ type: 'error', text: 'Network identity check failed' });
    } finally {
      setIsValidating(false);
    }
  };

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
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      <header className="h-20 bg-white border-b border-[#E5E1D8] flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4D5443] flex items-center justify-center text-white">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-[#4D5443] leading-none">SegriFy Worker</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">Field Validation Node</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Logout</span>
          </button>
          <div className="w-10 h-10 bg-[#4D5443] flex items-center justify-center text-white">
             <UserIcon className="w-6 h-6" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-10 flex flex-col items-center justify-center">
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="w-full max-w-2xl bg-white p-6 lg:p-12 border border-[#E5E1D8] flex flex-col relative overflow-hidden shadow-2xl">
          {!isScannerActive ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="w-24 h-24 bg-[#F9F7F2] flex items-center justify-center text-[#4D5443] border border-[#E5E1D8] mb-8">
                <QrCode className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-[#2D3128] tracking-tight mb-4 uppercase">Field Scanner</h3>
              <p className="text-sm font-medium text-[#7A7D74] mb-10 max-w-sm">Scan resident QR codes to validate waste segregation and award points.</p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => setIsScannerActive(true)}
                  className="w-full bg-[#4D5443] text-white py-5 font-black text-sm uppercase tracking-widest shadow-xl shadow-[#4D5443]/20 hover:scale-[1.02] transition-transform active:scale-95"
                >
                  Start Scanning
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#F0EEE9]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F9F7F2] flex items-center justify-center text-[#4D5443] border border-[#E5E1D8]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-[#2D3128] uppercase tracking-tight">
                    {showConfirm ? 'Validation' : 'Active Camera'}
                  </h3>
                </div>
                
                <button 
                  onClick={() => {
                    stopCamera();
                    setIsScannerActive(false);
                    setShowConfirm(false);
                    setScannedData(null);
                  }} 
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {!showConfirm ? (
                <div className="aspect-square bg-[#0a0a0a] relative overflow-hidden border-4 border-[#F9F7F2] shadow-inner flex items-center justify-center">
                  {isCameraStarting && (
                    <div className="absolute inset-0 z-10 bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 text-[#4D5443] animate-spin" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warming Up Lens...</p>
                    </div>
                  )}
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700",
                      isCameraStarting || isValidating ? "brightness-50" : "brightness-100"
                    )}
                  />
                  
                  {isValidating && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#4D5443]/20 backdrop-blur-sm animate-in fade-in duration-300">
                      <div className="p-4 bg-white/90">
                        <Loader2 className="w-8 h-8 text-[#4D5443] animate-spin" />
                      </div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">Verifying Resident Identity...</p>
                    </div>
                  )}

                  {!isCameraStarting && !isValidating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 border-2 border-white/20 relative">
                        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-white" />
                        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-white" />
                        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-white" />
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-white" />
                        
                        {/* Scanning line animation */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-scan-slow" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-200">
                  {message ? (
                    <div className={`p-8 text-center border-2 ${message.type === 'success' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'}`}>
                      {message.type === 'success' ? <CheckCircle2 className="w-16 h-16 mx-auto mb-4" /> : <XCircle className="w-16 h-16 mx-auto mb-4" />}
                      <h4 className="text-xl font-black uppercase mb-2">{message.type === 'success' ? 'Success' : 'Error'}</h4>
                      <p className="font-bold">{message.text}</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="bg-[#F9F7F2] p-6 text-center border border-[#E5E1D8]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Resident Identity</p>
                        <h4 className="text-xl font-black text-[#4D5443] break-all">
                          {targetUser?.name || 'Resident'}
                        </h4>
                        <p className="text-[10px] font-bold text-[#7A7D74] mt-2">
                           ID: {targetUser?.houseId || targetUser?.shopId || 'N/A'}
                        </p>
                      </div>

                      {alreadyScanned && (
                        <div className="bg-amber-50 p-4 border border-amber-200 flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">
                            Already verified today.
                          </p>
                        </div>
                      )}

                      <div className="bg-[#F9F7F2] p-6 border border-[#E5E1D8] space-y-6">
                        <div className="space-y-4">
                          <button
                            onClick={() => handleValidation(true)}
                            disabled={submitting || alreadyScanned}
                            className="w-full py-5 rounded-none bg-green-600 hover:bg-green-700 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-green-600/20"
                          >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            PROPERLY SEGREGATED
                          </button>
                          <button
                            onClick={() => handleValidation(false)}
                            disabled={submitting || alreadyScanned}
                            className="w-full py-5 rounded-none bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
                          >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            IMPROPER SEGREGATION
                          </button>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => { setShowConfirm(false); setScannedData(null); }}
                        className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#4D5443] transition-colors text-center"
                      >
                        Rescan QR
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
        © 2024 SEGRIFY MUNICIPAL INFRASTRUCTURE. FIELD NODE.
      </footer>
    </div>
  );
}
