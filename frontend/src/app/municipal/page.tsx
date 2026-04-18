'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2,
  XCircle,
  QrCode
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

export default function MunicipalDashboard() {
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  const API = (envApi && envApi !== '/') ? envApi : 'http://localhost:5000';
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [validationType, setValidationType] = useState<'proper' | 'improper' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [houseId, setHouseId] = useState<string | null>(null);
  const [residentName, setResidentName] = useState<string | null>(null);
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
                  inversionAttempts: "attemptBoth",
                });
                
                if (code && code.data && code.data.trim() !== "") {
                  const token = code.data.trim();
                  setScannedData(token);
                  setShowConfirm(true);
                  setIsValidating(true);
                  if (timeoutId) clearTimeout(timeoutId);
                  
                  // URL Encode the token to handle special characters like '#'
                  const encodedToken = encodeURIComponent(token);
                  const fetchUrl = `${API}/api/segregation/validate/${encodedToken}`;
                  
                  console.log("Scanner: Initiating verification for", token);
                  console.log("Scanner: Requesting URL", fetchUrl);

                  fetch(fetchUrl, {
                    headers: { 'Authorization': `Bearer ${useAuthStore.getState().firebaseToken}` }
                  })
                  .then(async r => {
                    const contentType = r.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                       const text = await r.text();
                       console.error("Non-JSON response received from", fetchUrl, ":", text.substring(0, 100));
                       throw new Error("Server returned non-JSON response. Please check if backend is running on port 5000.");
                    }
                    const data = await r.json();
                    if (!r.ok) throw new Error(data.message || 'Verification Failed');
                    return data;
                  })
                  .then(data => {
                    if (data.user) {
                      setHouseId(data.user.houseId || data.user.shopId);
                      setResidentName(data.user.name);
                      setAlreadyScanned(data.alreadyScanned);
                    } else {
                      setScanError("Resident not found in database.");
                      setAlreadyScanned(true);
                    }
                  })
                  .catch((err) => {
                    console.error("QR Validation Error:", err);
                    setScanError(err.message === 'Failed to fetch' ? "CORS/Network Issue" : err.message);
                  })
                  .finally(() => setIsValidating(false));

                  return;
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
        const response = await fetch(`${API}/api/dashboard/analytics/city`, {
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

  const handleValidation = async (isProper: boolean) => {
    if (alreadyScanned || isValidating || scanError) return;

    const token = useAuthStore.getState().firebaseToken;
    try {
      const response = await fetch(`${API}/api/segregation/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          qrToken: scannedData,
          status: isProper ? 'proper' : 'improper',
          municipalId: useAuthStore.getState().user?.id // Log as Municipal Person
        })
      });

      if (response.ok) {
        console.log(`Successfully logged segregation for ${houseId}`);
        stopCamera();
        setIsScannerActive(false);
        setShowConfirm(false);
        setScannedData(null);
        setScanError(null);
        setHouseId(null);
        setResidentName(null);
        setAlreadyScanned(false);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update record');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
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
              <div className="bg-white p-6 lg:p-12 border-2 border-brand-primary text-center animate-in fade-in zoom-in duration-200 shadow-2xl min-h-[400px] flex flex-col justify-center">
                {isValidating ? (
                  <div className="space-y-4 py-10">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verifying Identity...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4 lg:mb-6">
                       <QrCode className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    
                    <p className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                       {alreadyScanned ? 'Verification Alert' : 'Identity Verified'}
                    </p>
                    <h4 className="text-xl lg:text-3xl font-black text-brand-primary mb-1 uppercase tracking-tighter">
                       {houseId || scannedData}
                    </h4>
                    {residentName && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 lg:mb-8 italic">
                         Owner: {residentName}
                      </p>
                    )}
                    
                    {scanError ? (
                      <div className="bg-red-50 border border-red-200 p-6 mb-8">
                        <p className="text-sm font-bold text-red-700 uppercase tracking-tight">
                           🚫 {scanError}
                        </p>
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mt-2">
                           Please check your internet connection or try re-scanning.
                        </p>
                      </div>
                    ) : alreadyScanned ? (
                      <div className="bg-amber-50 border border-amber-200 p-6 mb-8">
                        <p className="text-sm font-bold text-amber-700 uppercase tracking-tight">
                           ⚠️ This unit has already been processed today.
                        </p>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-2">
                           Validation cycles are limited to once per day.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl lg:text-2xl font-black text-brand-primary mb-8 lg:mb-10 leading-tight">
                          Is the waste properly segregated?
                        </p>
                        
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                          <button 
                            onClick={() => handleValidation(true)}
                            className="flex-1 bg-green-600 text-white py-4 lg:py-6 text-xs lg:text-sm font-black uppercase tracking-widest shadow-lg shadow-green-600/10 hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Yes, Proper
                          </button>
                          <button 
                            onClick={() => handleValidation(false)}
                            className="flex-1 bg-red-600 text-white py-4 lg:py-6 text-xs lg:text-sm font-black uppercase tracking-widest shadow-lg shadow-red-600/10 hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                          >
                            <XCircle className="w-5 h-5" />
                            No, Improper
                          </button>
                        </div>
                      </>
                    )}
                    
                    <button 
                      onClick={() => { setShowConfirm(false); setScannedData(null); setScanError(null); setAlreadyScanned(false); setHouseId(null); }}
                      className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-brand-primary transition-colors"
                    >
                      Cancel / Rescan
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
