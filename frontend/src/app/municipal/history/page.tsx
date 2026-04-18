'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Building2,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { format } from 'date-fns';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type ActivityType = 'all' | 'complaint' | 'business' | 'enforcement' | 'logistics';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  status: string;
  date: string;
}

export default function MunicipalHistory() {
  const { firebaseToken } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityType>('all');
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/municipal/history`, {
        headers: { Authorization: `Bearer ${firebaseToken}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setActivities(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [firebaseToken]);

  const filteredActivities = activities.filter(act => {
    const matchesFilter = filter === 'all' || act.type === filter;
    const matchesSearch = act.title.toLowerCase().includes(search.toLowerCase()) || 
                          act.detail.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'complaint': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'business': return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'enforcement': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'logistics': return <Trash2 className="w-5 h-5 text-green-600" />;
      default: return <History className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (['resolved', 'paid', 'proper', 'accepted'].includes(status)) return 'bg-green-100 text-green-800';
    if (['pending', 'in_progress', 'unpaid'].includes(status)) return 'bg-yellow-100 text-yellow-800';
    if (['improper', 'rejected'].includes(status)) return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1200px] mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7A7D74]">
            <ShieldCheck className="w-3 h-3" />
            <span>Infrastructure Oversight</span>
          </div>
          <h1 className="text-5xl font-black text-[#2D3128] tracking-tighter uppercase italic">
            Audit Trail<span className="text-[#4D5443]">.</span>
          </h1>
          <p className="text-sm font-medium text-[#7A7D74]">Comprehensive log of all municipal interactions and waste management events.</p>
        </div>

        <div className="flex items-center gap-3 bg-[#EBE9E0] p-1.5 rounded-none border border-[#D9D7CE]">
          <Search className="w-4 h-4 text-[#7A7D74] ml-2" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="bg-transparent border-none outline-none text-sm font-bold text-[#2D3128] placeholder-[#7A7D74]/50 w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b-2 border-[#E5E2D9]">
        {(['all', 'complaint', 'business', 'enforcement', 'logistics'] as ActivityType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === t 
              ? "bg-[#4D5443] text-white shadow-lg -translate-y-1" 
              : "text-[#7A7D74] hover:bg-[#EBE9E0]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* History Feed */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[26px] top-0 bottom-0 w-0.5 bg-[#E5E2D9] hidden md:block" />

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-12 h-12 text-[#4D5443] animate-spin" />
                <p className="text-xs font-black text-[#7A7D74] uppercase tracking-widest">Compiling Records...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-24 bg-[#F5F4F0] border-2 border-dashed border-[#D9D7CE]">
                <p className="text-sm font-bold text-[#7A7D74] italic">No activities matching your current filters.</p>
              </div>
            ) : filteredActivities.map((act, index) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group md:pl-16"
              >
                {/* Timeline Dot */}
                <div className="absolute left-[18px] top-5 w-4 h-4 rounded-full bg-white border-4 border-[#4D5443] z-10 hidden md:block group-hover:scale-125 transition-transform" />

                <div className="bg-white border border-[#E5E2D9] p-6 lg:p-8 hover:shadow-2xl transition-all duration-300 hover:border-[#4D5443] group-hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-5">
                      <div className="p-3 bg-slate-50 border border-slate-100 shrink-0">
                        {getIcon(act.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                           <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${getStatusColor(act.status)}`}>
                             {act.status}
                           </span>
                           <span className="text-[10px] font-bold text-[#7A7D74] flex items-center gap-1.5">
                             <Calendar className="w-3 h-3" />
                             {format(new Date(act.date), 'MMM d, yyyy · HH:mm')}
                           </span>
                        </div>
                        <h4 className="text-xl font-black text-[#2D3128] uppercase italic tracking-tight">{act.title}</h4>
                        <p className="text-sm font-medium text-[#7A7D74] max-w-2xl">{act.detail}</p>
                      </div>
                    </div>
                    
                    <button className="flex items-center gap-2 text-[10px] font-black text-[#4D5443] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.2em]">
                      View Source
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
