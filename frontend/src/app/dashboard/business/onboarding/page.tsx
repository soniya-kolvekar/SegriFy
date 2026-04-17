'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CreditCard, Hash, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

export default function BusinessOnboarding() {
  const [formData, setFormData] = useState({
    businessName: '',
    aadhaarNo: '',
    panCard: '',
    shopNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { firebaseToken, setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setAuth(data.user, firebaseToken!);
        router.push('/dashboard/business');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto font-sans antialiased">
      <div className="bg-white p-12 border border-brand-muted shadow-none rounded-none">
        <div className="mb-12 border-b border-brand-muted pb-8">
          <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-[0.2em] mb-2">Legal Compliance</p>
          <h1 className="text-4xl font-black text-brand-primary uppercase tracking-tight">Business Profile</h1>
          <p className="text-brand-primary/60 font-bold text-sm uppercase tracking-tight mt-2">Complete your legal identification to start requesting raw materials.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 text-[10px] font-black uppercase tracking-widest mb-8 border border-red-100 rounded-none">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Legal Business Name</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full bg-brand-bg py-4 pl-12 pr-6 border border-brand-muted rounded-none text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-primary/20"
                  placeholder="e.g. SegriFy Corp"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Registration ID / Shop No.</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text"
                  value={formData.shopNumber}
                  onChange={(e) => setFormData({...formData, shopNumber: e.target.value})}
                  className="w-full bg-brand-bg py-4 pl-12 pr-6 border border-brand-muted rounded-none text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-primary/20"
                  placeholder="e.g. REG-7700-SFY"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">Aadhaar Card Number</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text"
                  required
                  maxLength={12}
                  value={formData.aadhaarNo}
                  onChange={(e) => setFormData({...formData, aadhaarNo: e.target.value.replace(/\D/g, '')})}
                  className="w-full bg-brand-bg py-4 pl-12 pr-6 border border-brand-muted rounded-none text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-primary/20"
                  placeholder="12-digit Aadhaar Number"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-1">PAN Card Number</label>
              <div className="relative group">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text"
                  required
                  maxLength={10}
                  value={formData.panCard}
                  onChange={(e) => setFormData({...formData, panCard: e.target.value.toUpperCase()})}
                  className="w-full bg-brand-bg py-4 pl-12 pr-6 border border-brand-muted rounded-none text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-primary/20"
                  placeholder="10-character PAN ID"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary py-6 rounded-none text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/10 hover:brightness-110 transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
            >
              {loading ? 'Saving Details...' : 'Complete Registration'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
