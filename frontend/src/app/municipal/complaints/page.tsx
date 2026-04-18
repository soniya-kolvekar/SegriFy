'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, Filter, Download, X, MoreVertical, User, MapPin, Clock, AlertTriangle, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { format, differenceInDays } from 'date-fns';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');

export default function ComplaintsPage() {
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  const API = (envApi && envApi !== '/') ? envApi : 'http://localhost:5000';
  const { firebaseToken: token } = useAuthStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/municipal/complaints`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAllComplaints(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const complaintsWithSLA = useMemo(() => {
    return allComplaints.map((c: any) => {
      const daysOpen = differenceInDays(new Date(), new Date(c.createdAt));
      return {
        ...c,
        daysOpen,
        isOverdue: daysOpen >= 3 && c.status !== 'resolved'
      };
    });
  }, [allComplaints]);

  const analytics = useMemo(() => {
    const overdue = complaintsWithSLA.filter((c: any) => c.isOverdue).length;
    const expiringToday = complaintsWithSLA.filter((c: any) => c.daysOpen === 2 && c.status !== 'resolved').length;
    const under24h = complaintsWithSLA.filter((c: any) => c.daysOpen === 0).length;

    return { overdue, expiringToday, under24h };
  }, [complaintsWithSLA]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API}/api/municipal/complaints/${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchComplaints();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const filterOptions = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'OVERDUE'];

  const filteredComplaints = useMemo(() => {
    if (activeFilter === 'ALL') return complaintsWithSLA;
    if (activeFilter === 'OVERDUE') return complaintsWithSLA.filter((c: any) => c.isOverdue);
    return complaintsWithSLA.filter((c: any) => c.status.toUpperCase() === activeFilter);
  }, [complaintsWithSLA, activeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* SLA Alert Banner */}
      <div className={cn("p-6 flex items-center justify-between shadow-lg", analytics.overdue > 0 ? "bg-red-600 shadow-red-600/10" : "bg-brand-primary shadow-brand-primary/10")}>
        <div className="flex items-center gap-4 text-white">
          <ShieldAlert className="w-8 h-8" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">SLA Monitoring System</p>
            <h4 className="text-lg font-black tracking-tight">
              {analytics.overdue > 0 
                ? `${analytics.overdue} Complaints have exceeded the 3-day resolution limit.` 
                : "All complaints are within the 72-hour resolution window."}
            </h4>
          </div>
        </div>
        {analytics.overdue > 0 && (
          <div className="bg-white/10 px-6 py-2 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
            Status: Escalated to Higher Authority
          </div>
        )}
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
                filteredComplaints.map((c: any) => {
                  const statusColors: any = {
                    pending: 'bg-blue-50 text-blue-600',
                    in_progress: 'bg-orange-50 text-orange-600',
                    resolved: 'bg-green-50 text-green-600'
                  };

                  return (
                    <tr key={c._id} className={`group transition-colors ${c.isOverdue ? 'bg-red-50/30' : 'hover:bg-[#F9F7F2]'}`}>
                      <td className="px-10 py-8 font-bold text-xs text-gray-400 group-hover:text-brand-primary transition-colors">#{c._id.slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-8">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                               <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#2D2D2D]">{c.userName}</p>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.houseId}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                         <span className="text-sm font-bold text-brand-primary">{c.subject}</span>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Reported: {format(new Date(c.createdAt), 'MMM dd, yyyy')}</p>
                      </td>
                      <td className="px-8 py-8">
                         {c.isOverdue ? (
                           <div className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-xs font-black uppercase tracking-widest">EXCEEDED ( {c.daysOpen} Days )</span>
                           </div>
                         ) : c.status === 'resolved' ? (
                           <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest text-[#4D5443]">RESOLVED</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-widest">{Math.max(0, 3 - c.daysOpen)} Days Remaining</span>
                           </div>
                         )}
                      </td>
                      <td className="px-8 py-8">
                         <span className={cn(
                           "px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-current/10",
                           statusColors[c.status] || 'bg-gray-50 text-gray-400'
                         )}>
                            {c.status.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-10 py-8 text-right space-x-4">
                        {c.status !== 'resolved' && (
                          <button 
                            onClick={() => handleUpdateStatus(c._id, 'resolved')}
                            className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                          >
                            Resolve
                          </button>
                        )}
                        {c.status === 'pending' && (
                          <button 
                             onClick={() => handleUpdateStatus(c._id, 'in_progress')}
                             className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                          >
                            Start Work
                          </button>
                        )}
                        {c.isOverdue && (
                          <button className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                            Escalate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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
           <p className="text-3xl font-black text-brand-primary tracking-tighter">{analytics.under24h.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] flex flex-col shadow-sm border-l-4 border-l-orange-500">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Expiring Today</p>
           <p className="text-3xl font-black text-orange-500 tracking-tighter">{analytics.expiringToday.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] flex flex-col shadow-sm border-l-4 border-l-red-600">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Overdue (3+ Days)</p>
           <p className="text-3xl font-black text-red-600 tracking-tighter">{analytics.overdue.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] flex flex-col shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Active</p>
           <p className="text-3xl font-black text-gray-400 tracking-tighter">{(allComplaints.filter((c: any) => c.status !== 'resolved').length).toString().padStart(2, '0')}</p>
        </div>
      </div>
    </div>
  );
}
