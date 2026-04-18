'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Gavel, Filter, Download, X, MoreVertical, User, AlertCircle, CheckCircle2, ReceiptText, Wallet, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { format } from 'date-fns';

export default function FinesPage() {
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  const API = (envApi && envApi !== '/') ? envApi : 'http://localhost:5000';
  const { firebaseToken: token } = useAuthStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [allFines, setAllFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchFines = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/municipal/fines`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAllFines(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Dynamically calculate analytics based on state
  const analytics = useMemo(() => {
    const pending = allFines.filter(f => f.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const collected = allFines.filter(f => f.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalViolations = allFines.length;
    const collectedCount = allFines.filter(f => f.status === 'paid').length;
    const complianceRate = totalViolations > 0 ? Math.round((collectedCount / totalViolations) * 100) : 0;

    return { pending, collected, complianceRate };
  }, [allFines]);

  const filteredFines = useMemo(() => {
    if (activeFilter === 'ALL') return allFines;
    return allFines.filter(f => f.status.toUpperCase() === activeFilter.toUpperCase());
  }, [allFines, activeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Revenue Snapshot - NOW DYNAMIC & RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white p-6 lg:p-8 border border-[#E5E1D8] shadow-sm flex items-center justify-between transition-all">
           <div>
              <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Fines Pending</p>
              <h2 className="text-xl lg:text-3xl font-black text-red-600 tracking-tighter">₹{analytics.pending.toLocaleString('en-IN')}</h2>
           </div>
           <AlertCircle className="w-8 h-8 lg:w-10 lg:h-10 text-red-600 opacity-20" />
        </div>
        <div className="bg-white p-6 lg:p-8 border border-[#E5E1D8] shadow-sm flex items-center justify-between transition-all">
           <div>
              <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Collected MTD</p>
              <h2 className="text-xl lg:text-3xl font-black text-green-600 tracking-tighter">₹{analytics.collected.toLocaleString('en-IN')}</h2>
           </div>
           <CheckCircle2 className="w-8 h-8 lg:w-10 lg:h-10 text-green-600 opacity-20" />
        </div>
        <div className="bg-white p-6 lg:p-8 border border-[#E5E1D8] shadow-sm flex items-center justify-between transition-all">
           <div>
              <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Collection Rate</p>
              <h2 className="text-xl lg:text-3xl font-black text-brand-primary tracking-tighter">{analytics.complianceRate}%</h2>
           </div>
           <Gavel className="w-8 h-8 lg:w-10 lg:h-10 text-brand-primary opacity-20" />
        </div>
      </div>

      <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden flex flex-col">
        <div className="p-10 flex justify-between items-center border-b border-[#F0EDE7]">
          <div>
            <h3 className="text-2xl font-black text-brand-primary tracking-tight">Violation Fine Ledger</h3>
            <p className="text-sm font-medium text-gray-400 mt-1">Automatic penalties for homeowners exceeding 3 days of non-segregation.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setShowFilters(!showFilters)} className={`p-3 border transition-all flex items-center gap-2 ${showFilters ? 'bg-brand-primary text-white border-brand-primary' : 'bg-[#F0EDE7] text-brand-primary border-transparent hover:bg-[#E5E1D8]'}`}>
              <Filter className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="px-10 py-6 bg-[#F9F7F2] border-b border-[#F0EDE7] flex items-center justify-between">
            <div className="flex gap-3">
              {['ALL', 'PENDING', 'COLLECTED'].map((opt) => (
                <button key={opt} onClick={() => setActiveFilter(opt)} className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${activeFilter === opt ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-400 border-gray-100 hover:border-brand-primary/30'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#F0EDE7] bg-[#F9F7F2]">
                <th className="px-10 py-6">Ticket ID</th>
                <th className="px-8 py-6">Homeowner</th>
                <th className="px-8 py-6">Red Marks</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredFines.map((fine: any) => {
                const violationsCount = Math.max(0, Math.floor((fine.amount - 100) / 20 + 3));
                
                return (
                  <tr key={fine._id} className="group hover:bg-[#F9F7F2] transition-colors">
                    <td className="px-10 py-8 font-bold text-xs text-gray-400">#{fine._id.slice(-6).toUpperCase()}</td>
                    <td className="px-8 py-8">
                       <p className="font-black text-sm text-[#2D2D2D]">{fine.userName}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{fine.houseId}</p>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex gap-1 flex-wrap max-w-[120px]">
                          {[...Array(violationsCount)].map((_, i) => (
                             <div key={i} className="w-2.5 h-2.5 bg-red-600 shadow-sm" />
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-8 font-black text-brand-primary text-lg">₹{fine.amount}</td>
                    <td className="px-8 py-8">
                       <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${fine.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {fine.status}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       {fine.status === 'paid' ? (
                          <div className="flex items-center justify-end gap-2 text-green-600">
                             <CheckCircle2 className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                          </div>
                       ) : (
                          <div className="flex items-center justify-end gap-2 text-red-600/40">
                             <Wallet className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Payment Pending</span>
                          </div>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
