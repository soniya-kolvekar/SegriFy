'use client';

import React, { useState } from 'react';
import { 
  QrCode, 
  Trash2, 
  CheckCircle2, 
  User as UserIcon,
  Camera,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkerDashboard() {
  const [userId, setUserId] = useState('');
  const [wasteType, setWasteType] = useState('wet');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
          wasteType,
          workerId: '65f1a2b3c4d5e6f7a8b9c0d1' // Mock worker ID
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
          <h1 className="text-3xl font-black uppercase tracking-tighter">Worker Scanner</h1>
          <p className="text-white/60 mt-2 font-black text-[10px] uppercase tracking-widest">Log waste segregation records instantly</p>
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
          <div className="grid grid-cols-2 gap-4 mb-8">
            {['wet', 'dry'].map((type) => (
              <button
                key={type}
                onClick={() => setWasteType(type)}
                className={cn(
                  "py-4 rounded-none font-black text-xs uppercase tracking-widest transition-all border",
                  wasteType === type 
                    ? "bg-brand-accent text-white border-brand-accent" 
                    : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                )}
              >
                {type} Waste
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleScanSimulation(true)}
              disabled={status === 'loading'}
              className="w-full py-5 rounded-none bg-green-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 border border-green-500/30"
            >
              <CheckCircle2 className="w-5 h-5" />
              PROPERLY SEGREGATED
            </button>
            <button 
              onClick={() => handleScanSimulation(false)}
              disabled={status === 'loading'}
              className="w-full py-5 rounded-none bg-red-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 border border-red-500/30"
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
