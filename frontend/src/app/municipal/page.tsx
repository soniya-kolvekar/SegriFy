'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2,
  XCircle,
  QrCode
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

export default function MunicipalDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [validationType, setValidationType] = useState<'proper' | 'improper' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Aggressive Camera Shutdown Function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`Camera Track ${track.label} SHUT DOWN.`);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  // Ref to track showConfirm state without triggering useEffect re-runs unnecessarily
  const showConfirmRef = useRef(false);
  useEffect(() => {
    showConfirmRef.current = showConfirm;
  }, [showConfirm]);

  // Load jsQR library from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;
    
    async function startCamera() {
      // ONLY start if scanner is active AND we are NOT in the confirmation phase
      if (!isScannerActive || showConfirm) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamRef.current = stream; // Store in ref for global access
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Auto-close if nothing scanned for 15 seconds
        timeoutId = setTimeout(() => {
          if (!showConfirmRef.current) {
            setIsScannerActive(false);
          }
        }, 15000);
        
        const scan = () => {
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
                  setScannedData(code.data);
                  setShowConfirm(true);
                  if (timeoutId) clearTimeout(timeoutId);
                  return; // Stop scan loop
                }
              }
            }
          }
          animationFrameId = requestAnimationFrame(scan);
        };
        animationFrameId = requestAnimationFrame(scan);

      } catch (err) {
        console.error("Error accessing camera:", err);
        setIsScannerActive(false);
      }
    }

    if (isScannerActive && !showConfirm) {
      startCamera();
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
      stopCamera(); // Aggressive shutdown on cleanup
    };
  }, [isScannerActive, showConfirm]); // Correct dependencies to manage camera lifecycle

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = useAuthStore.getState().firebaseToken;
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/analytics/city', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleValidation = (isProper: boolean) => {
    console.log(`Scanned QR: ${scannedData}, Proper: ${isProper}`);
    stopCamera(); // SHUT DOWN IMMEDIATELY
    setIsScannerActive(false);
    setShowConfirm(false);
    setScannedData(null);
    setValidationType(null);
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] lg:min-h-[70vh]">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="w-full max-w-4xl bg-[#F9F7F2] p-6 lg:p-16 border border-[#E5E1D8] flex flex-col relative overflow-hidden shadow-sm">
        {!isScannerActive ? (
          <div className="flex flex-col items-center justify-center text-center py-10 lg:py-20">
            <div className="w-20 h-20 lg:w-32 lg:h-32 bg-white flex items-center justify-center text-brand-primary border border-gray-100 mb-6 lg:mb-10 shadow-sm">
              <QrCode className="w-10 h-10 lg:w-16 lg:h-16" />
            </div>
            <h3 className="text-2xl lg:text-4xl font-black text-brand-primary tracking-tight mb-4 uppercase">QR Validation Node</h3>
            <p className="text-sm lg:text-lg font-medium text-gray-400 mb-8 lg:mb-12 max-w-md">Point the camera at a house QR code to start the segregation check.</p>
            <button 
              onClick={() => setIsScannerActive(true)}
              className="w-full lg:w-auto bg-brand-primary text-white px-8 lg:px-12 py-4 lg:py-6 font-bold text-xs lg:text-sm uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:scale-105 transition-transform"
            >
              Scan QR Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-10 border-b border-[#E5E1D8] pb-6 lg:pb-8 relative gap-4">
              <div className="flex items-center gap-4 lg:gap-5">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white flex items-center justify-center text-brand-primary border border-gray-100">
                  <QrCode className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <h3 className="text-lg lg:text-2xl font-black text-brand-primary tracking-tight uppercase">
                  {showConfirm ? 'Validation' : 'Active Scan'}
                </h3>
              </div>
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  stopCamera(); // SHUT DOWN IMMEDIATELY
                  setIsScannerActive(false);
                  setShowConfirm(false);
                  setScannedData(null);
                }} 
                className="group flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
              >
                <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-red-600">Close</span>
              </button>
            </div>

            {!showConfirm ? (
              <div className="aspect-[4/3] lg:aspect-video bg-black mb-6 lg:mb-10 relative overflow-hidden shadow-inner border-4 lg:border-8 border-white">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 lg:w-72 lg:h-72 border-2 border-white/30 relative">
                    <div className="absolute -top-1 -left-1 w-8 h-8 lg:w-12 lg:h-12 border-t-4 lg:border-t-8 border-l-4 lg:border-l-8 border-white" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 lg:w-12 lg:h-12 border-t-4 lg:border-t-8 border-r-4 lg:border-r-8 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 lg:w-12 lg:h-12 border-b-4 lg:border-b-8 border-l-4 lg:border-l-8 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 lg:w-12 lg:h-12 border-b-4 lg:border-b-8 border-r-4 lg:border-r-8 border-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-4 lg:px-6 py-2 text-[8px] lg:text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                  Detecting Identity...
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 lg:p-12 border-2 border-brand-primary text-center animate-in fade-in zoom-in duration-200 shadow-2xl">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4 lg:mb-6">
                   <QrCode className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <p className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Identity Verified</p>
                <h4 className="text-lg lg:text-xl font-black text-brand-primary mb-6 lg:mb-8 break-all">{scannedData}</h4>
                
                <p className="text-xl lg:text-2xl font-bold text-brand-primary mb-8 lg:mb-10 leading-tight">
                  Is the waste properly segregated?
                </p>
                
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  <button 
                    onClick={() => handleValidation(true)}
                    className="flex-1 bg-green-600 text-white py-4 lg:py-6 text-xs lg:text-sm font-black uppercase tracking-widest shadow-lg shadow-green-600/10 hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Yes
                  </button>
                  <button 
                    onClick={() => handleValidation(false)}
                    className="flex-1 bg-red-600 text-white py-4 lg:py-6 text-xs lg:text-sm font-black uppercase tracking-widest shadow-lg shadow-red-600/10 hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                  >
                    <XCircle className="w-5 h-5" />
                    No
                  </button>
                </div>
                
                <button 
                  onClick={() => { setShowConfirm(false); setScannedData(null); }}
                  className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-brand-primary transition-colors"
                >
                  Rescan QR
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
