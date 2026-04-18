'use client';

import React, { useState } from 'react';
import { MessageSquare, Filter, Download, X, MoreVertical, User, MapPin, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ComplaintsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Mock data with "Days Open" to demonstrate the 3-day SLA logic
  const complaints = [
    { 
      id: 'CMP-1021', 
      homeowner: 'Rajesh Kumar', 
      category: 'Missed Collection', 
      location: 'Ward 12, Green Avenue', 
      date: 'Oct 24, 2024', 
      daysOpen: 0,
      status: 'NEW',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      id: 'CMP-1018', 
      homeowner: 'Priya Singh', 
      category: 'Overflowing Bin', 
      location: 'Sector 4, Main Road', 
      date: 'Oct 23, 2024', 
      daysOpen: 1,
      status: 'IN PROGRESS',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      id: 'CMP-1015', 
      homeowner: 'Amit Verma', 
      category: 'Illegal Dumping', 
      location: 'Ward 9, South Gate', 
      date: 'Oct 21, 2024', 
      daysOpen: 3,
      status: 'ESCALATED',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      id: 'CMP-1012', 
      homeowner: 'Sunita Devi', 
      category: 'Bin Repair', 
      location: 'Ward 15, East Park', 
      date: 'Oct 21, 2024', 
      daysOpen: 3,
      status: 'PENDING',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      id: 'CMP-1009', 
      homeowner: 'Vikram Rao', 
      category: 'Smell Complaint', 
      location: 'Sector 2, North Plaza', 
      date: 'Oct 19, 2024', 
      daysOpen: 5,
      status: 'ESCALATED',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
  ];

  const filterOptions = ['ALL', 'NEW', 'IN PROGRESS', 'PENDING', 'ESCALATED', 'RESOLVED'];

  const filteredComplaints = activeFilter === 'ALL' 
    ? complaints 
    : complaints.filter(c => c.status === activeFilter);

  return (
    <div className="space-y-10 pb-20">
      {/* SLA Alert Banner */}
      <div className="bg-red-600 p-6 flex items-center justify-between shadow-lg shadow-red-600/10">
        <div className="flex items-center gap-4 text-white">
          <ShieldAlert className="w-8 h-8" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">SLA Violation Warning</p>
            <h4 className="text-lg font-black tracking-tight">2 Complaints have exceeded the 3-day resolution limit.</h4>
          </div>
        </div>
        <div className="bg-white/10 px-6 py-2 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
           Status: Escalated to Higher Authority
        </div>
      </div>

      <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden flex flex-col">
        <div className="p-10 flex justify-between items-center border-b border-[#F0EDE7]">
          <div>
            <h3 className="text-2xl font-black text-brand-primary tracking-tight">Citizen Complaints Ledger</h3>
            <p className="text-sm font-medium text-gray-400 mt-1">Resolution Timeframe: 72 Hours (3 Days). Issues exceeding this are automatically escalated.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 border transition-all flex items-center gap-2 ${showFilters ? 'bg-brand-primary text-white border-brand-primary' : 'bg-[#F0EDE7] text-brand-primary border-transparent hover:bg-[#E5E1D8]'}`}
            >
              <Filter className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="px-10 py-6 bg-[#F9F7F2] border-b border-[#F0EDE7] flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex gap-3">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                    activeFilter === opt 
                      ? 'bg-brand-primary text-white border-brand-primary' 
                      : 'bg-white text-gray-400 border-gray-100 hover:border-brand-primary/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setActiveFilter('ALL'); setShowFilters(false); }}
              className="flex items-center gap-2 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
            >
              <X className="w-3 h-3" />
              Clear Filters
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#F0EDE7] bg-[#F9F7F2]">
                <th className="px-10 py-6">Complaint ID</th>
                <th className="px-8 py-6">Homeowner</th>
                <th className="px-8 py-6">Issue Category</th>
                <th className="px-8 py-6">Resolution Deadline</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className={`group transition-colors ${c.daysOpen >= 3 ? 'bg-red-50/30' : 'hover:bg-[#F9F7F2]'}`}>
                    <td className="px-10 py-8 font-bold text-xs text-gray-400 group-hover:text-brand-primary transition-colors">{c.id}</td>
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                             <User className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-[#2D2D2D]">{c.homeowner}</span>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       <span className="text-sm font-bold text-brand-primary">{c.category}</span>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Reported: {c.date}</p>
                    </td>
                    <td className="px-8 py-8">
                       {c.daysOpen >= 3 ? (
                         <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">EXCEEDED ( {c.daysOpen} Days )</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">{3 - c.daysOpen} Days Remaining</span>
                         </div>
                       )}
                    </td>
                    <td className="px-8 py-8">
                       <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${c.bgColor} ${c.color} border-current/10`}>
                          {c.status}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                          Escalate Now
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <p className="text-sm font-black text-gray-300 uppercase tracking-[0.3em]">No complaints found in this category</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8">
        <div className="bg-white p-8 border border-[#E5E1D8] flex flex-col shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Under 24h</p>
           <p className="text-3xl font-black text-brand-primary tracking-tighter">04</p>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] flex flex-col shadow-sm border-l-4 border-l-orange-500">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Expiring Today</p>
           <p className="text-3xl font-black text-orange-500 tracking-tighter">01</p>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] flex flex-col shadow-sm border-l-4 border-l-red-600">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Overdue (3+ Days)</p>
           <p className="text-3xl font-black text-red-600 tracking-tighter">02</p>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] flex flex-col shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Authority Notified</p>
           <p className="text-3xl font-black text-gray-400 tracking-tighter">02</p>
        </div>
      </div>
    </div>
  );
}
