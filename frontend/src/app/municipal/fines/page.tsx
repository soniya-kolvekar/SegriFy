'use client';

import React, { useState, useMemo } from 'react';
import { Gavel, Filter, Download, X, MoreVertical, User, AlertCircle, CheckCircle2, ReceiptText, Wallet } from 'lucide-react';

export default function FinesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const [fines, setFines] = useState([
    { id: 'FINE-9021', homeowner: 'Rajesh Kumar', violations: 4, ward: 'Ward 12', amount: 500, status: 'PENDING', date: 'Oct 24, 2024' },
    { id: 'FINE-8842', homeowner: 'Priya Singh', violations: 3, ward: 'Sector 4', amount: 250, status: 'PENDING', date: 'Oct 23, 2024' },
    { id: 'FINE-8701', homeowner: 'Amit Verma', violations: 5, ward: 'Ward 9', amount: 750, status: 'COLLECTED', date: 'Oct 22, 2024' },
    { id: 'FINE-8654', homeowner: 'Sunita Devi', violations: 3, ward: 'Ward 15', amount: 250, status: 'COLLECTED', date: 'Oct 21, 2024' },
    { id: 'FINE-8601', homeowner: 'Vikram Rao', violations: 6, ward: 'Sector 2', amount: 1000, status: 'PENDING', date: 'Oct 20, 2024' },
  ]);

  // Dynamically calculate analytics based on state
  const analytics = useMemo(() => {
    const pending = fines.filter(f => f.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
    const collected = fines.filter(f => f.status === 'COLLECTED').reduce((acc, curr) => acc + curr.amount, 0);
    const totalViolations = fines.length;
    const collectedCount = fines.filter(f => f.status === 'COLLECTED').length;
    const complianceRate = Math.round((collectedCount / totalViolations) * 100);

    return { pending, collected, complianceRate };
  }, [fines]);

  const handleCollect = (id: string) => {
    setFines(prev => prev.map(f => f.id === id ? { ...f, status: 'COLLECTED' } : f));
  };

  const filteredFines = activeFilter === 'ALL' 
    ? fines 
    : fines.filter(f => f.status === activeFilter);

  return (
    <div className="space-y-10 pb-20">
      {/* Revenue Snapshot - NOW DYNAMIC */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex items-center justify-between transition-all">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Fines Pending</p>
              <h2 className="text-3xl font-black text-red-600 tracking-tighter">₹{analytics.pending.toLocaleString('en-IN')}</h2>
           </div>
           <AlertCircle className="w-10 h-10 text-red-600 opacity-20" />
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex items-center justify-between transition-all">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Collected MTD</p>
              <h2 className="text-3xl font-black text-green-600 tracking-tighter">₹{analytics.collected.toLocaleString('en-IN')}</h2>
           </div>
           <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex items-center justify-between transition-all">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Collection Rate</p>
              <h2 className="text-3xl font-black text-brand-primary tracking-tighter">{analytics.complianceRate}%</h2>
           </div>
           <Gavel className="w-10 h-10 text-brand-primary opacity-20" />
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
              {filteredFines.map((fine) => (
                <tr key={fine.id} className="group hover:bg-[#F9F7F2] transition-colors">
                  <td className="px-10 py-8 font-bold text-xs text-gray-400">{fine.id}</td>
                  <td className="px-8 py-8">
                     <p className="font-black text-sm text-[#2D2D2D]">{fine.homeowner}</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{fine.ward}</p>
                  </td>
                  <td className="px-8 py-8">
                     <div className="flex gap-1">
                        {[...Array(fine.violations)].map((_, i) => (
                           <div key={i} className="w-2.5 h-2.5 bg-red-600 shadow-sm" />
                        ))}
                     </div>
                  </td>
                  <td className="px-8 py-8 font-black text-brand-primary text-lg">₹{fine.amount}</td>
                  <td className="px-8 py-8">
                     <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${fine.status === 'COLLECTED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {fine.status}
                     </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                     {fine.status === 'PENDING' ? (
                        <button onClick={() => handleCollect(fine.id)} className="bg-brand-primary text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-[#3d5a4a] transition-all">
                           Mark Collected
                        </button>
                     ) : (
                        <div className="flex items-center justify-end gap-2 text-green-600">
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                        </div>
                     )}
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
