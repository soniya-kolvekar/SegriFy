'use client';

import React, { useState, useEffect } from 'react';
import { Leaf, Package, Weight, IndianRupee, Send, Info, Plus, FileText } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { useRouter } from 'next/navigation';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

interface Material {
  _id: string;
  name: string;
  costPerTon: number;
  availableQuantity: number;
  description: string;
}

export default function MaterialRequestPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const { firebaseToken } = useAuthStore();
  const router = useRouter();

  const envApi = process.env.NEXT_PUBLIC_API_URL;
  const API = (envApi && envApi !== '/') ? envApi : 'http://localhost:5000';

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!firebaseToken) {
        setFetching(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/business/materials`, {
          headers: { 'Authorization': `Bearer ${firebaseToken}` }
        });
        const data = await res.json();
        setMaterials(data);
        if (data.length > 0) setSelectedMaterial(data[0].name);
      } catch (err) {
        console.error('Error fetching materials:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchMaterials();
  }, [firebaseToken]);

  const currentMaterial = materials.find(m => m.name === selectedMaterial);
  // Using costPerTon as provided by the inventory API
  const estimatedAmount = currentMaterial ? (currentMaterial.costPerTon || 0) * quantity : 0;
  const isOutOfStock = currentMaterial ? currentMaterial.availableQuantity <= 0 : false;
  const exceedsStock = currentMaterial ? quantity > currentMaterial.availableQuantity : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (materials.length === 0) {
      setMessage({ type: 'error', text: 'No materials configured by municipal yet.' });
      return;
    }
    if (quantity <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid quantity.' });
      return;
    }

    if (exceedsStock) {
      setMessage({ type: 'error', text: `Quantity exceeds available stock (${currentMaterial?.availableQuantity}kg).` });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/business/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          itemType: selectedMaterial,
          quantity,
          estimatedAmount
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Request submitted successfully!' });
        setTimeout(() => router.push('/dashboard/business'), 2000);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to submit request.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">
          <span>Dashboard</span>
          <Plus className="w-2 h-2" />
          <span>New Request</span>
        </div>
        <h1 className="text-4xl font-heading font-black text-brand-primary uppercase">Business Waste Management Portal</h1>
      </div>

      <div className="space-y-10">
        <div className="bg-white border border-brand-muted p-10 space-y-10 shadow-none rounded-none">
          <div className="flex items-center gap-4">
            <div className="bg-brand-secondary/50 p-3 rounded-none">
              <Leaf className="w-5 h-5 text-brand-primary/60" />
            </div>
            <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight">New Waste Collection Request</h2>
          </div>

          {message.text && (
            <div className={`p-4 rounded-none text-[10px] font-black uppercase tracking-widest border ${
              message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Waste Type</label>
                {currentMaterial && (
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-1 border",
                    currentMaterial.availableQuantity < 100 ? "text-red-500 border-red-100 bg-red-50" : "text-green-600 border-green-100 bg-green-50"
                  )}>
                    Stock: {currentMaterial.availableQuantity} kg Available
                  </span>
                )}
              </div>
              <select 
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                disabled={materials.length === 0}
                className="w-full bg-brand-bg py-4 px-5 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetching ? <option>Loading...</option> : 
                 materials.length === 0 ? <option>No materials available</option> : 
                 materials.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest ml-1">Quantity</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    max={currentMaterial?.availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    disabled={materials.length === 0 || isOutOfStock}
                    className={cn(
                      "w-full bg-brand-bg py-4 px-5 rounded-none border text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all pr-24 disabled:opacity-50",
                      exceedsStock ? "border-red-500 ring-1 ring-red-500" : "border-brand-muted"
                    )}
                    placeholder="0"
                  />
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-primary/40 uppercase">kg</span>
                </div>
                {exceedsStock && (
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 ml-1 animate-pulse">
                    Error: Request exceeds current stock limit
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest ml-1">Pickup Date</label>
                <input 
                  type="date"
                  className="w-full bg-brand-bg py-4 px-5 rounded-none border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
            </div>

            <div className="bg-brand-secondary/30 p-8 border-l-4 border-brand-primary space-y-2 rounded-none">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Estimated Incentive</p>
                <p className="text-3xl font-black text-brand-primary tracking-tighter">₹{estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <p className="text-[9px] text-brand-primary/40 font-bold leading-relaxed">
                Calculated based on current commercial rates for {selectedMaterial.toLowerCase()} materials.
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading || fetching || materials.length === 0 || exceedsStock || isOutOfStock}
              className="w-full bg-brand-primary py-5 rounded-none text-white font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/20"
            >
              {loading ? 'Processing...' : isOutOfStock ? 'OUT OF STOCK' : exceedsStock ? 'INSUFFICIENT STOCK' : 'Submit Request'}
            </button>
          </form>
        </div>

        <div className="bg-brand-secondary/30 p-8 space-y-4 rounded-none">
          <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
            <Info className="w-3 h-3" /> Guidelines
          </h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-[10px] font-bold text-brand-primary/60 uppercase tracking-wider leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-none bg-brand-primary mt-1 shrink-0" />
              Ensure all hazardous waste is double-contained and clearly labeled with chemical composition.
            </li>
            <li className="flex gap-3 text-[10px] font-bold text-brand-primary/60 uppercase tracking-wider leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-none bg-brand-primary mt-1 shrink-0" />
              Organic waste requests must be submitted 24 hours prior to desired pickup window.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
