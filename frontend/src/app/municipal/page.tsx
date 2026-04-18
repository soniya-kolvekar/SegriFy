'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2,
  XCircle,
  QrCode,
  Map,
  Trash2,
  Activity,
  Users,
  BarChart3,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuthStore } from '@/context/useAuthStore';

export default function MunicipalDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const showConfirmRef = useRef(false);
  useEffect(() => {
    showConfirmRef.current = showConfirm;
  }, [showConfirm]);

  // Mock data for charts if analytics is missing
  const wasteData = [
    { name: 'Organic', amount: 4500 },
    { name: 'Plastic', amount: 3200 },
    { name: 'Paper', amount: 2100 },
    { name: 'Glass', amount: 1200 },
    { name: 'Metal', amount: 900 },
  ];

  const complianceData = [
    { name: 'Proper', value: analytics?.properCount || 75 },
    { name: 'Improper', value: analytics?.improperCount || 25 },
  ];

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
      if (!isScannerActive) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

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

    if (isScannerActive) {
      startCamera();
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerActive]);

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
    setIsScannerActive(false);
    setShowConfirm(false);
    setScannedData(null);
  };

  return (
    <div className="space-y-12">
      <canvas ref={canvasRef} className="hidden" />

      {/* City Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Validations', value: analytics?.totalRecords || '1,240', delta: '+12%', icon: Trash2 },
          { label: 'Compliance Rate', value: `${analytics?.properRate || '88'}%`, delta: '+5.4%', icon: CheckCircle2 },
          { label: 'Escalated Issues', value: '02', delta: '-8%', icon: Activity },
          { label: 'Active Wards', value: '18', delta: 'Stable', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E5E1D8] shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-brand-primary/10 w-12 h-12 flex items-center justify-center text-brand-primary mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all">
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-3xl font-black text-brand-primary tracking-tighter">{stat.value}</p>
                <span className="text-green-600 text-[10px] font-black mb-1.5 uppercase">{stat.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Scanner Section */}
      <div className="w-full bg-[#F9F7F2] p-16 border border-[#E5E1D8] relative overflow-hidden shadow-sm">
        {!isScannerActive ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="w-32 h-32 bg-white flex items-center justify-center text-brand-primary border border-gray-100 mb-10 shadow-sm">
              <QrCode className="w-16 h-16" />
            </div>
            <h3 className="text-4xl font-black text-brand-primary tracking-tight mb-4 uppercase">QR Validation Node</h3>
            <p className="text-lg font-medium text-gray-400 mb-12 max-w-md italic">Point the camera at a house QR code to start the segregation check.</p>
            <button 
              onClick={() => setIsScannerActive(true)}
              className="bg-brand-primary text-white px-12 py-6 font-bold text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:scale-105 transition-transform"
            >
              Initialize Scanner
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-10 border-b border-[#E5E1D8] pb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white flex items-center justify-center text-brand-primary border border-gray-100">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-brand-primary tracking-tight uppercase">
                  {showConfirm ? 'Field Validation' : 'Active QR Scan Stream'}
                </h3>
              </div>
              <button 
                onClick={() => { setIsScannerActive(false); setShowConfirm(false); setScannedData(null); }} 
                className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500"
              >
                Terminate Stream
              </button>
            </div>

            {!showConfirm ? (
              <div className="aspect-video bg-black mb-10 relative overflow-hidden shadow-inner border-8 border-white">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 border-2 border-white/30 relative">
                    <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-white" />
                    <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-white" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-6 py-2 text-[10px] font-black text-white uppercase tracking-widest">
                  Detecting Identity...
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 border-2 border-brand-primary text-center animate-in fade-in zoom-in duration-200 shadow-2xl">
                <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-6">
                   <QrCode className="w-8 h-8" />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Identity Verified</p>
                <h4 className="text-xl font-black text-brand-primary mb-8">{scannedData}</h4>
                <p className="text-2xl font-bold text-brand-primary mb-10 leading-tight">Is the waste properly segregated?</p>
                <div className="flex gap-6">
                  <button onClick={() => handleValidation(true)} className="flex-1 bg-green-600 text-white py-6 text-sm font-black uppercase tracking-widest shadow-lg shadow-green-600/10 hover:bg-green-700 transition-all flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5" /> Yes
                  </button>
                  <button onClick={() => handleValidation(false)} className="flex-1 bg-red-600 text-white py-6 text-sm font-black uppercase tracking-widest shadow-lg shadow-red-600/10 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
                    <XCircle className="w-5 h-5" /> No
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white p-10 border border-[#E5E1D8] shadow-sm">
          <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight mb-10 flex items-center gap-3 border-b border-[#F0EDE7] pb-6">
            <BarChart3 className="w-5 h-5 text-gray-300" />
            Waste Distribution
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#5C5D47', fontSize: 10, fontWeight: 900}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5C5D47', fontSize: 10, fontWeight: 900}} />
                <Tooltip contentStyle={{borderRadius: '0', border: '1px solid #5C5D47', background: '#F9F7F2'}} />
                <Bar dataKey="amount" fill="#5C5D47" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-10 border border-[#E5E1D8] shadow-sm">
          <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight mb-10 border-b border-[#F0EDE7] pb-6 text-center">Compliance Rate</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complianceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={0} dataKey="value">
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#5C5D47' : '#F9F7F2'} stroke="#5C5D47" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-10 mt-6">
             <div className="text-center">
                <p className="text-3xl font-black text-brand-primary">{analytics?.properCount || 740}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Proper</p>
             </div>
             <div className="text-center">
                <p className="text-3xl font-black text-gray-200">{analytics?.improperCount || 120}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mixed</p>
             </div>
          </div>
        </div>
      </div>

      {/* Residential Compliance Table */}
      <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden">
        <div className="p-10 flex justify-between items-center border-b border-[#F0EDE7] bg-[#F9F7F2]">
          <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight">Residential Compliance Records</h2>
          <div className="flex bg-white px-5 py-3 w-96 border border-[#E5E1D8]">
            <Search className="w-4 h-4 text-gray-300" />
            <input type="text" placeholder="Search House ID / Name..." className="bg-transparent border-none focus:ring-0 px-3 text-[10px] font-black uppercase tracking-widest w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9F7F2] text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Resident Identity</th>
                <th className="px-6 py-6">Zone</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6">Score</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {[
                { name: 'Adarsh Kumar', id: '#4521', zone: 'Sector 4', status: 'Eligible', points: '1250' },
                { name: 'Sarah Joseph', id: '#8922', zone: 'Old Town', status: 'Warning', points: '840' },
                { name: 'Vikram Singh', id: '#1230', zone: 'Sector 2', status: 'Ineligible', points: '120' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#F9F7F2] transition-colors group">
                  <td className="px-10 py-6">
                    <p className="font-black text-brand-primary text-xs uppercase">{row.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{row.id}</p>
                  </td>
                  <td className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase">{row.zone}</td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                      row.status === 'Eligible' ? 'bg-green-50 text-green-700 border-green-100' : 
                      row.status === 'Warning' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-black text-brand-primary text-xs uppercase">{row.points}</td>
                  <td className="px-10 py-6 text-right">
                    <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline underline-offset-4">View Records</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
